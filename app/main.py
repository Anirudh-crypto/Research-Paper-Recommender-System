# app/main.py
from fastapi import FastAPI, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import SessionLocal, Base, engine
from app.models import Paper
from app.ingestion.pipeline import ingest_arxiv, get_embedding
from app.faiss import vector_store
import os, numpy as np
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware

# ensure DB tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

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

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
model = SentenceTransformer(MODEL_NAME)
EMB_DIM = model.get_sentence_embedding_dimension()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Parameters for recommendation request
class RecommendRequest(BaseModel):
    query: str
    k: int = 5
    year_min: int = None
    year_max: int = None
    author: str = None

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    vector_store.build(db)

@app.post("/ingest_arxiv")
def ingest(query: str, max_results: int = 10):
    result = ingest_arxiv(query, max_results)
    return {"status": "success", "result": result}

@app.post("/recommend")
def recommend(request: RecommendRequest, db: Session = Depends(get_db)):
    query = request.query
    k = request.k
    year_min = request.year_min
    year_max = request.year_max
    author = request.author
    query_embedding = get_embedding(query)

    paper_ids = vector_store.search(query_embedding, k=k)
    if not paper_ids:
        return []

    q = db.query(Paper).filter(Paper.id.in_(paper_ids))

    if year_min is not None:
        q = q.filter(Paper.publication_year >= year_min)
    if year_max is not None:
        q = q.filter(Paper.publication_year <= year_max)
    if author is not None:
        q = q.filter(Paper.authors.ilike(f"%{author}%"))

    results = q.all()

    return [
        {"title": p.title, "abstract": p.abstract, "authors": p.authors,
         "year": p.publication_year, "url": p.url}
        for p in results
    ]

@app.get("/papers")
def list_papers(limit: int = 20, db: Session = Depends(get_db)):
    ps = db.query(Paper).limit(limit).all()
    out = []
    for p in ps:
        out.append({"id": p.id, "title": p.title, "authors": p.authors, "abstract": p.abstract, "year": p.publication_year, "arxiv_id": p.arxiv_id, "url": p.url})
    return {"count": len(out), "papers": out}
