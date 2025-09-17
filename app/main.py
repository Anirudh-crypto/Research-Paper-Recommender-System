# app/main.py
from fastapi import FastAPI, Depends
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

# load embedding model (will download on first run)
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
model = SentenceTransformer(MODEL_NAME)
EMB_DIM = model.get_sentence_embedding_dimension()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RecommendRequest(BaseModel):
    text: str
    k: int = 5

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    vector_store.build(db)

@app.post("/ingest_arxiv")
def ingest(query: str, max_results: int = 10):
    result = ingest_arxiv(query, max_results)
    return {"status": "success", "result": result}

@app.post("/recommend")
def recommend(query: str, k: int = 5, db: Session = Depends(get_db)):
    query_embedding = get_embedding(query)
    paper_ids = vector_store.search(query_embedding, k=k)
    results = db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
    return [{"title": p.title, "url": p.url, "abstract": p.abstract} for p in results]

@app.get("/papers")
def list_papers(limit: int = 20, db: Session = Depends(get_db)):
    ps = db.query(Paper).limit(limit).all()
    out = []
    for p in ps:
        out.append({"id": p.id, "title": p.title, "year": p.publication_year, "arxiv_id": p.arxiv_id})
    return {"count": len(out), "papers": out}
