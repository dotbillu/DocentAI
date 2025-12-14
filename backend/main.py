import json
import os
import re
import numpy as np
from dotenv import load_dotenv
import google.generativeai as genai # type: ignore
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.scraper import crawl_site

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY) # type: ignore

# 1. GENERATION MODEL (Answerer)
chat_model = genai.GenerativeModel('gemini-flash-latest') # type: ignore

# 2. EMBEDDING MODEL (Searcher)
# This converts text into list of numbers
EMBEDDING_MODEL = "models/text-embedding-004"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_embedding(text):
    """Call Gemini API to get vector for text"""
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Embedding error: {e}")
        return []

def compute_cosine_similarity(vec1, vec2):
    """Math to find how similar two vectors are"""
    if not vec1 or not vec2: return 0.0
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

@app.get("/")
async def root():
    return {"message": "Advanced RAG Backend Running"}

@app.get("/crawl")
async def crawl_endpoint(url: str = Query(...), max_depth: int = Query(2)):
    print(f"🕷️ Crawling: {url}")
    data = crawl_site(url, max_depth)
    
    if not data:
        raise HTTPException(status_code=400, detail="Crawl failed")
    
    # --- ADVANCED STEP: Generate Embeddings immediately ---
    print("🧠 Generating AI Embeddings for scraped data (This may take a moment)...")
    
    # 1. Keep the Abhay/Custom data if it exists
    existing_custom_data = []
    if os.path.exists("scraped_data.json"):
        with open("scraped_data.json", "r", encoding="utf-8") as f:
            old_data = json.load(f)
            # Preserve manual entries like 'Abhay'
            existing_custom_data = [d for d in old_data if "abhay" in d.get("url", "")]

    # 2. Combine new crawl data with custom data
    final_data = existing_custom_data + data
    
    # 3. Generate vectors for all pages
    for page in final_data:
        # We only embed the first 1000 chars to save API tokens/speed
        # (The summary usually lives at the top)
        if "embedding" not in page:
            page["embedding"] = get_embedding(page["content"][:1000])
            
    # 4. Save everything
    try:
        with open("scraped_data.json", "w", encoding="utf-8") as f:
            json.dump(final_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "message": "Crawl & Embedding successful",
        "pages": len(final_data),
        "note": "Vector Database Updated"
    }

@app.get("/search")
async def search_and_generate(q: str = Query(...)):
    print(f"🔎 Semantic Search: {q}")
    
    if not os.path.exists("scraped_data.json"):
        raise HTTPException(status_code=404, detail="No data found")
        
    with open("scraped_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Embed the User's Question
    try:
        query_embedding = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=q,
            task_type="retrieval_query"
        )['embedding']
    except Exception:
        # Fallback if embedding fails
        query_embedding = None

    results = []
    
    # 2. Clean Query Words for Hybrid Keyword Match
    query_words = re.findall(r'\b\w+\b', q.lower())
    STOP_WORDS = {"how", "what", "where", "when", "does", "is", "the", "a", "an", "and", "or", "to"}
    filtered_words = [w for w in query_words if w not in STOP_WORDS]

    # 3. Score every page
    for page in data:
        score = 0
        
        # A. Vector Score (Semantic Meaning) - Weight: 70%
        if query_embedding and "embedding" in page and page["embedding"]:
            similarity = compute_cosine_similarity(query_embedding, page["embedding"])
            # Boost semantic score
            score += similarity * 70 
            
        # B. Keyword Score (Exact Match) - Weight: 30%
        # This fixes the "Abhay" issue where exact names matter
        content_lower = page["content"].lower()
        keyword_matches = 0
        for word in filtered_words:
            if word in content_lower:
                keyword_matches += 1
        
        if len(filtered_words) > 0:
            keyword_score = keyword_matches / len(filtered_words)
            score += keyword_score * 30
            
        # C. Critical Keyword Boost (The "Abhay" Fix)
        # If a very specific proper noun matches, give it a massive bonus
        for word in filtered_words:
            if word in content_lower and len(word) > 4 and content_lower.count(word) < 5:
                # If a long unique word appears, it's likely important
                score += 10

        if score > 0:
            results.append({
                "url": page["url"],
                "content": page["content"],
                "score": score
            })
    
    # 4. Sort and Pick Top 3
    results.sort(key=lambda x: x["score"], reverse=True)
    top_results = results[:3]

    if not top_results:
        return {"query": q, "answer": "No relevant documentation found.", "sources": []}

    # 5. Generate Answer
    context_text = ""
    for r in top_results:
        context_text += f"SOURCE: {r['url']}\n{r['content'][:3000]}\n\n"

    prompt = f"""
    You are an advanced documentation assistant. 
    Use the context below to answer the user question deeply and accurately.
    
    QUESTION: {q}

    CONTEXT:
    {context_text}
    """
    
    try:
        response = chat_model.generate_content(prompt)
        ai_answer = response.text
    except Exception as e:
        ai_answer = f"AI Error: {str(e)}"

    return {
        "query": q,
        "answer": ai_answer,
        "sources": [r["url"] for r in top_results]
    }
