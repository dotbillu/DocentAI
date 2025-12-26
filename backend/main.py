import asyncio
import io
import logging
import os
import re
import time
from typing import Any, Dict, List, Optional, cast

# REMOVED: import chromadb
# ADDED: Pinecone imports
from pinecone import Pinecone, ServerlessSpec

import PIL.Image
from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from groq import Groq
from groq.types.chat import ChatCompletionMessageParam
from pydantic import BaseModel
from pypdf import PdfReader

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("RAG_Worker")

load_dotenv()

# --- CONFIGURATION ---
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY") # NEW
PINECONE_INDEX_NAME = "docent-ai-index"          # NEW

GROQ_KEYS = [
    os.getenv("GROQ_API_KEY1"),
    os.getenv("GROQ_API_KEY2"),
    os.getenv("GROQ_API_KEY3"),
    os.getenv("GROQ_API_KEY4"),
]
GROQ_KEYS = [k for k in GROQ_KEYS if k]

if not GEMINI_KEY or not GROQ_KEYS or not PINECONE_API_KEY:
    raise ValueError("Missing API Keys in .env (Check GEMINI, GROQ, and PINECONE)")

# --- PINECONE SETUP ---
pc = Pinecone(api_key=PINECONE_API_KEY)

# Check if index exists, if not create it (Serverless - AWS us-east-1 is standard)
existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

if PINECONE_INDEX_NAME not in existing_indexes:
    logger.info(f"Creating new Pinecone index: {PINECONE_INDEX_NAME}")
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=768, # IMPORTANT: Gemini text-embedding-004 output dimension
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    # Wait a moment for the index to be ready
    while not pc.describe_index(PINECONE_INDEX_NAME).status["ready"]:
        time.sleep(1)

# Connect to the index
index = pc.Index(PINECONE_INDEX_NAME)

google_client = genai.Client(api_key=GEMINI_KEY)

EMBEDDING_MODEL = "text-embedding-004"
CHAT_MODEL = "llama-3.3-70b-versatile"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: List[Message] = []
    file_context: Optional[str] = None

class CrawlRequest(BaseModel):
    url: str
    max_depth: int = 2

# --- HELPERS ---
def get_groq_client(index: int) -> Groq:
    return Groq(api_key=GROQ_KEYS[index])

def get_embedding(text: str) -> List[float]:
    try:
        response = google_client.models.embed_content(
            model=EMBEDDING_MODEL, contents=text[:9000]
        )
        if response.embeddings and response.embeddings[0].values:
            return response.embeddings[0].values
        return []
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        return []

# --- CORE LOGIC ---
async def perform_crawl(url: str, max_depth: int = 1):
    logger.info(f"Auto-Crawling: {url} (Depth: {max_depth})")

    run_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        word_count_threshold=10,
        excluded_tags=["nav", "footer", "aside"],
    )

    vectors_to_upsert = []
    processed_count = 0

    async with AsyncWebCrawler() as crawler:
        result: Any = await crawler.arun(url=url, config=run_config)
        pages_to_process = [result]

        if max_depth > 0 and hasattr(result, "links"):
            internal_links = [
                link["href"]
                for link in result.links.get("internal", [])
                if link["href"].startswith("http")
            ]
            internal_links = list(set(internal_links))[:10]

            if internal_links:
                logger.info(f"Found sub-pages, crawling {len(internal_links)}...")
                tasks = [
                    crawler.arun(url=link, config=run_config) for link in internal_links
                ]
                sub_results = await asyncio.gather(*tasks)
                pages_to_process.extend(sub_results)

        for page in pages_to_process:
            if not hasattr(page, "markdown") or not page.markdown:
                continue

            content = page.markdown[:8000]
            vec = get_embedding(content)
            if not vec:
                continue

            page_title = "No Title"
            if hasattr(page, "metadata") and page.metadata:
                page_title = page.metadata.get("title", "No Title")

            page_url = "Unknown"
            if hasattr(page, "url"):
                page_url = page.url
            
            # Pinecone requires ASCII IDs, so we use the URL or a hash
            # We store the actual TEXT content in the metadata so we can retrieve it later
            safe_id = re.sub(r'[^a-zA-Z0-9]', '_', page_url)[:512]
            
            vectors_to_upsert.append({
                "id": safe_id,
                "values": vec,
                "metadata": {
                    "url": page_url,
                    "title": page_title,
                    "text": content 
                }
            })
            processed_count += 1

    if vectors_to_upsert:
        # Pinecone Upsert
        index.upsert(vectors=vectors_to_upsert)
        logger.info(f"Indexed {len(vectors_to_upsert)} pages to Cloud.")

    return processed_count


@app.get("/")
async def root():
    stats = index.describe_index_stats()
    return {"status": "RAG System Online (Pinecone Cloud)", "stats": stats}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename if file.filename else "unknown_file"
    logger.info(f"Processing upload: {filename}")

    file_content = await file.read()
    extracted_text = ""

    if filename.lower().endswith(".pdf"):
        try:
            pdf_reader = PdfReader(io.BytesIO(file_content))
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as e:
            logger.error(f"PDF extract failed: {e}")
            return {"error": "Failed to parse PDF"}

    elif filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".heic")):
        try:
            image = PIL.Image.open(io.BytesIO(file_content))
            response = google_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[
                    "Extract all text from this image and provide a detailed technical description of what is visible.",
                    image,
                ],
            )
            extracted_text = response.text
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            return {"error": "Failed to analyze image"}

    else:
        try:
            extracted_text = file_content.decode("utf-8")
        except:
            extracted_text = str(file_content)

    if not extracted_text.strip():
        return {"error": "No text could be extracted"}

    vec = get_embedding(extracted_text)
    if vec:
        # Upsert to Pinecone
        safe_id = f"file_{re.sub(r'[^a-zA-Z0-9]', '_', filename)}_{int(time.time())}"
        index.upsert(vectors=[{
            "id": safe_id,
            "values": vec,
            "metadata": {
                "url": f"file://{filename}",
                "title": filename,
                "text": extracted_text[:8000] # Store text in metadata
            }
        }])

    return {
        "message": "File indexed successfully to Pinecone",
        "filename": filename,
        "extracted_text": extracted_text,
    }


@app.post("/crawl")
async def crawl_endpoint(req: CrawlRequest):
    count = await perform_crawl(req.url, req.max_depth)
    return {"message": f"Crawled {count} pages."}


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    logger.info(f"Query: {req.query}")

    url_match = re.search(r"(https?://[^\s]+)", req.query)
    if url_match:
        found_url = url_match.group(0)
        await perform_crawl(found_url, max_depth=2)

    query_vec = get_embedding(req.query)
    context_text = ""
    sources = []

    # 1. IMMEDIATE CONTEXT
    if req.file_context:
        context_text += f"\n=== CURRENTLY UPLOADED FILE CONTENT ===\n{req.file_context}\n=======================================\n"
        sources.append("Uploaded File")

   
    if query_vec:
        # Query Pinecone
        results = index.query(
            vector=query_vec,
            top_k=5,
            include_metadata=True 
        )

        for match in results['matches']:
            if match and match['metadata']:
                meta = match['metadata']
                url_source = str(meta.get("url", "Unknown"))
                # Retrieve the text we stored earlier
                doc_content = meta.get("text", "") 
                context_text += f"\nSOURCE: {url_source}\nCONTENT:\n{doc_content}\n---\n"
                sources.append(url_source)

    messages: List[ChatCompletionMessageParam] = [
        {
            "role": "system",
            "content": (
                "You are Docent AI. You are a strict RAG system. "
                "If the answer is not in the CONTEXT, strictly say: 'I do not have that information in my database.' "
                "IMPORTANT: Format ALL code snippets using Markdown code blocks with the correct language identifier. "
                "Example: ```python\nprint('hello')\n```"
                f"\n\nCONTEXT:\n{context_text}"
            ),
        }
    ]

    for msg in req.history[-4:]:
        role_str = "assistant" if msg.role == "ai" else "user"
        msg_obj = {"role": role_str, "content": msg.content}
        messages.append(cast(ChatCompletionMessageParam, msg_obj))

    messages.append({"role": "user", "content": req.query})

    answer = "Error: All API keys exhausted or failed."

    for i in range(len(GROQ_KEYS)):
        try:
            current_client = get_groq_client(i)
            completion = current_client.chat.completions.create(
                messages=messages,
                model=CHAT_MODEL,
                temperature=0.2,
            )
            if completion.choices[0].message.content:
                answer = completion.choices[0].message.content
                break
        except Exception as e:
            logger.warning(f"Key {i+1} failed with error: {e}. Trying next key...")
            if i == len(GROQ_KEYS) - 1:
                answer = "Rate limit exceeded on all available API keys. Please try again later."

    return {"answer": answer, "sources": list(set(sources))}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)