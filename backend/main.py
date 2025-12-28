import asyncio
import io
import logging
import os
import re
from typing import Any, List, Optional, cast

import PIL.Image
from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from groq import Groq
from groq.types.chat import ChatCompletionMessageParam
from pinecone import Pinecone
from pydantic import BaseModel
from pypdf import PdfReader

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("RAG_Worker")

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

GROQ_KEYS = [
    os.getenv("GROQ_API_KEY1"),
    os.getenv("GROQ_API_KEY2"),
    os.getenv("GROQ_API_KEY3"),
    os.getenv("GROQ_API_KEY4"),
    os.getenv("GROQ_API_KEY5"),
    os.getenv("GROQ_API_KEY6"),
    os.getenv("GROQ_API_KEY7"),
    os.getenv("GROQ_API_KEY8"),
    os.getenv("GROQ_API_KEY9"),
]
GROQ_KEYS = [k for k in GROQ_KEYS if k]

if not GEMINI_KEY or not GROQ_KEYS or not PINECONE_KEY or not PINECONE_INDEX_NAME:
    raise ValueError("Missing API Keys (Gemini, Groq, or Pinecone) in .env")
pc = Pinecone(api_key=PINECONE_KEY)
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


async def perform_crawl(url: str, max_depth: int = 1) -> List[str]:
    logger.info(f"Auto-Crawling: {url} (Depth: {max_depth})")

    run_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        word_count_threshold=15,
        excluded_tags=["nav", "footer", "aside", "script", "style"],
        remove_overlay_elements=True,
        wait_for="body",
        page_timeout=60000,
    )

    vectors_to_upsert = []
    crawled_logs = []

    async with AsyncWebCrawler() as crawler:
        result: Any = await crawler.arun(url=url, config=run_config, magic=True)
        pages_to_process = [result]

        if max_depth > 0 and hasattr(result, "links"):
            internal_links = [
                link["href"]
                for link in result.links.get("internal", [])
                if link["href"].startswith("http")
            ]
            internal_links = list(set(internal_links))[:5]

            if internal_links:
                logger.info(f"Found sub-pages, crawling {len(internal_links)}...")
                tasks = [
                    crawler.arun(url=link, config=run_config, magic=True)
                    for link in internal_links
                ]
                sub_results = await asyncio.gather(*tasks)
                pages_to_process.extend(sub_results)

        for page in pages_to_process:
            if not hasattr(page, "markdown") or not page.markdown:
                continue

            clean_content = page.markdown[:8000].strip()
            if len(clean_content) < 50:
                continue

            if hasattr(page, "url"):
                crawled_logs.append(f"Indexed: {page.url}")

            vec = get_embedding(clean_content)
            if not vec:
                continue

            page_title = "No Title"
            if hasattr(page, "metadata") and page.metadata:
                page_title = page.metadata.get("title", "No Title")

            page_url = "Unknown"
            if hasattr(page, "url"):
                page_url = page.url

            safe_id = (
                f"{re.sub(r'[^a-zA-Z0-9]', '', page_url)[:50]}_{os.urandom(4).hex()}"
            )
            vectors_to_upsert.append(
                {
                    "id": safe_id,
                    "values": vec,
                    "metadata": {
                        "url": page_url,
                        "title": page_title,
                        "text": clean_content,
                    },
                }
            )

    if vectors_to_upsert:
        batch_size = 50
        for i in range(0, len(vectors_to_upsert), batch_size):
            batch = vectors_to_upsert[i : i + batch_size]
            index.upsert(vectors=batch)
        logger.info(f"Indexed {len(vectors_to_upsert)} pages to Pinecone.")

    return crawled_logs


@app.get("/")
async def root():
    try:
        stats = index.describe_index_stats()
        count = stats.total_vector_count
        return {"status": "RAG System Online (Pinecone)", "docs_count": count}
    except:
        return {"status": "RAG System Online", "docs_count": "Unknown"}


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
        safe_id = (
            f"file_{re.sub(r'[^a-zA-Z0-9]', '', filename)[:30]}_{os.urandom(4).hex()}"
        )
        index.upsert(
            vectors=[
                {
                    "id": safe_id,
                    "values": vec,
                    "metadata": {
                        "url": f"file://{filename}",
                        "title": filename,
                        "text": extracted_text,
                    },
                }
            ]
        )

    return {
        "message": "File indexed successfully",
        "filename": filename,
        "extracted_text": extracted_text,
    }


@app.post("/crawl")
async def crawl_endpoint(req: CrawlRequest):
    logs = await perform_crawl(req.url, req.max_depth)
    return {
        "message": f"Crawled {len(logs)} pages.",
        "logs": logs,
        "database_count": "updated",
    }


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    logger.info(f"Query: {req.query}")

    query_vec = get_embedding(req.query)
    context_text = ""
    sources = []

    if req.file_context:
        context_text += f"\n=== CURRENTLY UPLOADED FILE CONTENT ===\n{req.file_context}\n=======================================\n"
        sources.append("Uploaded File")

    if query_vec:
        # Pinecone Query
        results = index.query(vector=query_vec, top_k=5, include_metadata=True)

        if results and results.matches:
            for match in results.matches:
                if match.metadata:
                    url_source = str(match.metadata.get("url", "Unknown"))
                    doc_content = str(
                        match.metadata.get("text", "")
                    )  # Retrieving text from metadata

                    context_text += (
                        f"\nSOURCE: {url_source}\nCONTENT:\n{doc_content}\n---\n"
                    )
                    sources.append(url_source)

    messages: List[ChatCompletionMessageParam] = [
        {
            "role": "system",
            "content": (
                "You are Docent AI. You are a strict RAG system. "
                "1. If the user provides a URL or says 'hello', SUMMARIZE the CONTEXT provided below. "
                "2. If the user asks a specific question and the answer is not in the CONTEXT, strictly say: 'I do not have that information in my database.' "
                "3. Format ALL code snippets using Markdown code blocks with the correct language identifier."
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
