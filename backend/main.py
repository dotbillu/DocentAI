import os
import re
import asyncio
import logging
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from groq import Groq
import chromadb
from chromadb.config import Settings
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("RAG_Worker")

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")

if not GEMINI_KEY or not GROQ_KEY:
    raise ValueError("Missing API Keys in .env")

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="docent_knowledge")

google_client = genai.Client(api_key=GEMINI_KEY)
groq_client = Groq(api_key=GROQ_KEY)

EMBEDDING_MODEL = "text-embedding-004"
CHAT_MODEL = "llama-3.3-70b-versatile"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: List[Message] = []

class CrawlRequest(BaseModel):
    url: str
    max_depth: int = 2

def get_embedding(text: str) -> List[float]:
    try:
        response = google_client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text[:9000]
        )
        return response.embeddings[0].values
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        return []

async def perform_crawl(url: str, max_depth: int = 1):
    logger.info(f"Auto-Crawling: {url} (Depth: {max_depth})")
    
    run_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        word_count_threshold=10,
        excluded_tags=["nav", "footer", "aside"]
    )

    documents = []
    embeddings = []
    metadatas = []
    ids = []
    processed_count = 0

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=run_config)
        pages_to_process = [result]

        if max_depth > 0 and result.links:
            internal_links = [
                link['href'] for link in result.links.get("internal", [])
                if link['href'].startswith("http")
            ]
            internal_links = list(set(internal_links))[:10] 
            
            if internal_links:
                logger.info(f"Found sub-pages, crawling {len(internal_links)}...")
                tasks = [crawler.arun(url=link, config=run_config) for link in internal_links]
                sub_results = await asyncio.gather(*tasks)
                pages_to_process.extend(sub_results)

        for page in pages_to_process:
            if not page.markdown: continue
            
            content = page.markdown[:8000]
            vec = get_embedding(content)
            if not vec: continue

            documents.append(content)
            embeddings.append(vec)
            metadatas.append({"url": page.url, "title": page.metadata.get("title", "No Title")})
            ids.append(page.url)
            processed_count += 1

    if documents:
        collection.upsert(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        logger.info(f"Indexed {len(documents)} pages.")
    
    return processed_count

@app.get("/")
async def root():
    return {"status": "RAG System Online", "docs_count": collection.count()}

@app.post("/crawl")
async def crawl_endpoint(req: CrawlRequest):
    count = await perform_crawl(req.url, req.max_depth)
    return {"message": f"Crawled {count} pages.", "database_count": collection.count()}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    logger.info(f"Query: {req.query}")

    url_match = re.search(r'(https?://[^\s]+)', req.query)
    if url_match:
        found_url = url_match.group(0)
        await perform_crawl(found_url, max_depth=0)
    
    query_vec = get_embedding(req.query)
    context_text = ""
    sources = []
    
    if query_vec:
        results = collection.query(
            query_embeddings=[query_vec],
            n_results=5 
        )
        if results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                meta = results['metadatas'][0][i]
                context_text += f"\nSOURCE: {meta['url']}\nCONTENT:\n{doc}\n---\n"
                sources.append(meta['url'])
    
    if not context_text:
        context_text = ""

    messages = [
        {
            "role": "system",
            "content": (
                "You are Docent AI. You are a strict RAG system. "
                "You MUST answer strictly based on the provided CONTEXT only. "
                "Do not use your own internal knowledge. "
                "If the answer is not in the CONTEXT, strictly say: 'I do not have that information in my database.' "
                "IMPORTANT: Format ALL code snippets using Markdown code blocks with the correct language identifier. "
                "Example: ```python\nprint('hello')\n```"
                f"\n\nCONTEXT:\n{context_text}"
            )
        }
    ]
    
    for msg in req.history[-4:]:
        role = "assistant" if msg.role == "ai" else "user"
        messages.append({"role": role, "content": msg.content})

    messages.append({"role": "user", "content": req.query})

    try:
        completion = groq_client.chat.completions.create(
            messages=messages,
            model=CHAT_MODEL,
            temperature=0.2,
        )
        answer = completion.choices[0].message.content
    except Exception as e:
        answer = f"Error generating response: {e}"

    return {
        "answer": answer,
        "sources": list(set(sources))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
