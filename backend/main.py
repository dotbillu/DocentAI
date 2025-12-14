import json
import os
import re
import time
import logging
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from groq import Groq
from src.scraper import crawl_site

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

load_dotenv()

# --- CONFIGURATION ---
gemini_key = os.getenv("GEMINI_API_KEY")
groq_key = os.getenv("GROQ_API_KEY")

if not gemini_key or not groq_key:
    raise ValueError("Missing API Keys in .env")

# Clients
google_client = genai.Client(api_key=gemini_key)
groq_client = Groq(api_key=groq_key)

# Models
CHAT_MODEL = "llama-3.3-70b-versatile"
EMBEDDING_MODEL = "text-embedding-004"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REQUEST MODELS ---
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: List[Message] = []

# --- HELPERS ---
def get_embedding(text):
    text = text.replace("\n", " ")
    for attempt in range(3):
        try:
            response = google_client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=text,
            )
            return response.embeddings[0].values
        except Exception as e:
            if "429" in str(e):
                logger.warning("Rate limit hit (Embedding). Waiting 2s...")
                time.sleep(2)
            else:
                logger.error(f"Embedding error: {e}")
                return []
    return []

def compute_cosine_similarity(vec1, vec2):
    if not vec1 or not vec2: return 0.0
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0: return 0.0
    return np.dot(v1, v2) / (norm1 * norm2)

@app.get("/")
async def root():
    return {"message": "Backend running: POST /chat enabled"}

@app.get("/crawl")
async def crawl_endpoint(url: str, max_depth: int = 2):
    logger.info(f"Starting crawl for: {url} with depth {max_depth}")
    data = crawl_site(url, max_depth)
    
    if not data:
        raise HTTPException(status_code=400, detail="Crawl failed")

    existing_data = []
    if os.path.exists("scraped_data.json"):
        try:
            with open("scraped_data.json", "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except:
            existing_data = []

    processed_count = 0
    for i, page in enumerate(data):
        if any(d["url"] == page["url"] for d in existing_data):
            continue
        
        # Embed
        page["embedding"] = get_embedding(page["content"][:2000])
        existing_data.append(page)
        processed_count += 1
        logger.info(f"Processed {i+1}/{len(data)}: {page['url']}")
        time.sleep(1.0) 

    with open("scraped_data.json", "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=2)

    return {"message": "Crawl successful", "new_pages": processed_count}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    logger.info(f"Received query: {req.query}")

    context_text = ""
    sources = []

    # 1. Retrieve Context if DB exists
    if os.path.exists("scraped_data.json"):
        with open("scraped_data.json", "r", encoding="utf-8") as f:
            data = json.load(f)

        query_embedding = get_embedding(req.query)
        results = []
        
        query_words = re.findall(r"\b\w+\b", req.query.lower())
        STOP_WORDS = {"how", "what", "does", "is", "the", "a", "an", "and", "or", "to"}
        filtered_words = [w for w in query_words if w not in STOP_WORDS]

        for page in data:
            score = 0
            if query_embedding and "embedding" in page:
                score += compute_cosine_similarity(query_embedding, page["embedding"]) * 70
            
            content_lower = page["content"].lower()
            matches = sum(1 for w in filtered_words if w in content_lower)
            if len(filtered_words) > 0:
                score += (matches / len(filtered_words)) * 30
            
            for word in filtered_words:
                if word in content_lower and len(word) > 4:
                    score += 5

            if score > 0:
                results.append({**page, "score": score})

        results.sort(key=lambda x: x["score"], reverse=True)
        top_results = results[:3]
        
        if top_results:
            context_text = "\n\n".join([f"SOURCE: {r['url']}\n{r['content'][:4000]}" for r in top_results])
            sources = [r["url"] for r in top_results]
        else:
            context_text = "No relevant context found in knowledge base."

    # 2. Construct Messages for Groq
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert technical assistant. "
                "Use the provided CONTEXT to answer the user's question accurately. "
                "If the context is empty, answer from your general knowledge but mention you have no docs on it."
                f"\n\nCONTEXT:\n{context_text}"
            )
        }
    ]
    
    # --- CRITICAL FIX: MAP ROLES ---
    # Groq hates "ai", so we change it to "assistant"
    for msg in req.history[-5:]: 
        role = "assistant" if msg.role == "ai" else "user"
        messages.append({"role": role, "content": msg.content})
    # -------------------------------
    
    messages.append({"role": "user", "content": req.query})

    # 3. Generate Answer
    try:
        completion = groq_client.chat.completions.create(
            messages=messages,
            model=CHAT_MODEL,
            temperature=0.3, 
        )
        ai_answer = completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq error: {e}")
        ai_answer = f"I encountered an error: {str(e)}"

    return {
        "query": req.query,
        "answer": ai_answer,
        "sources": sources
    }
