# app/main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import SessionLocal, Base, engine, Paper
from app.faiss import FaissIndex

import os, numpy as np
from sentence_transformers import SentenceTransformer
import feedparser
import requests
from fastapi.middleware.cors import CORSMiddleware

# ensure DB tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Paper Recommender (MVP)")

# Allow frontend (React dev server) to talk to backend
origins = [
    "http://localhost:3000",   # React default
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load embedding model (will download on first run)
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
model = SentenceTransformer(MODEL_NAME)
EMB_DIM = model.get_sentence_embedding_dimension()

# initialize faiss index
faiss_index = FaissIndex(dim=EMB_DIM)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RecommendRequest(BaseModel):
    text: str
    k: int = 5

@app.post("/ingest_arxiv")
def ingest_arxiv(query: str = Query(..., description="arXiv search query (e.g., machine+learning)"),
                 max_results: int = 5,
                 db: Session = Depends(get_db)):
    """
    Simple ingestion from arXiv. Adds new entries (by arXiv id) to DB and FAISS.
    """
    # call arXiv API
    url = f"http://export.arxiv.org/api/query?search_query={query}&start=0&max_results={max_results}"
    resp = requests.get(url, timeout=30)
    feed = feedparser.parse(resp.text)
    added = []
    vectors_to_add = []
    paper_ids = []
    for entry in feed.entries:
        arxiv_id = entry.get('id', "").split("/abs/")[-1]
        # skip if present
        existing = db.query(Paper).filter(Paper.arxiv_id == arxiv_id).first()
        if existing:
            continue
        title = entry.get('title', "").replace("\n", " ").strip()
        abstract = entry.get('summary', "").replace("\n", " ").strip()
        authors = ", ".join([a.name for a in entry.get('authors', [])]) if entry.get('authors') else ""
        pub_year = None
        if 'published' in entry and len(entry.published) >= 4:
            try:
                pub_year = int(entry.published[:4])
            except:
                pub_year = None
        url_link = next((l.href for l in entry.get('links', []) if l.get('rel') == 'alternate'), entry.get('link', ''))
        # create DB record
        p = Paper(arxiv_id=arxiv_id, title=title, abstract=abstract, authors=authors, publication_year=pub_year, url=url_link)
        db.add(p)
        db.commit()
        db.refresh(p)
        added.append(p.id)
        # create embedding
        vec = model.encode([abstract], convert_to_numpy=True)
        # normalize for IP index
        vec = vec / np.linalg.norm(vec, axis=1, keepdims=True)
        vectors_to_add.append(vec)
        paper_ids.append(p.id)

    if vectors_to_add:
        vectors = np.vstack(vectors_to_add).astype('float32')
        faiss_index.add(vectors, paper_ids)

    return {"added_count": len(added), "added_ids": added}

@app.post("/recommend")
def recommend(req: RecommendRequest, db: Session = Depends(get_db)):
    # quick guard
    if faiss_index.index.ntotal == 0:
        # try fallback: embed query and brute-force compare embeddings stored in DB? For MVP we just error clearly
        raise HTTPException(status_code=400, detail="No embeddings in index yet. Ingest some papers first.")
    qvec = model.encode([req.text], convert_to_numpy=True)
    qvec = qvec / np.linalg.norm(qvec, axis=1, keepdims=True)
    ids = faiss_index.search(qvec.astype('float32'), k=req.k)
    # fetch metadata preserving order
    if not ids:
        return {"results": []}
    papers = db.query(Paper).filter(Paper.id.in_(ids)).all()
    id_to_p = {p.id: p for p in papers}
    ordered = []
    for pid in ids:
        p = id_to_p.get(pid)
        if p:
            ordered.append({
                "id": p.id,
                "title": p.title,
                "abstract": p.abstract,
                "authors": p.authors,
                "year": p.publication_year,
                "url": p.url
            })
    return {"results": ordered}

@app.get("/papers")
def list_papers(limit: int = 20, db: Session = Depends(get_db)):
    ps = db.query(Paper).limit(limit).all()
    out = []
    for p in ps:
        out.append({"id": p.id, "title": p.title, "year": p.publication_year, "arxiv_id": p.arxiv_id})
    return {"count": len(out), "papers": out}
