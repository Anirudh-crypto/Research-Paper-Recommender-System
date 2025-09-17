from sqlalchemy.orm import Session
from app.ingestion.arxiv_client import fetch_papers
from app.models import Paper
from app.db import SessionLocal
from app.ingestion.embeddings import get_embedding
from app.faiss import vector_store

def save_papers_to_db(papers, db: Session):
    added = 0
    for paper in papers:
        exists = db.query(Paper).filter(Paper.arxiv_id == paper["arxiv_id"]).first()
        if exists:
            continue  

        # Combine title + abstract for embedding
        text_for_embedding = paper["title"] + " " + paper["abstract"]
        embedding = get_embedding(text_for_embedding)

        new_paper = Paper(
            arxiv_id=paper["arxiv_id"],
            title=paper["title"],
            abstract=paper["abstract"],
            authors=paper["authors"],
            publication_year=paper["publication_year"],
            url=paper["url"],
            embedding=embedding
        )

        db.add(new_paper)
        db.flush()  # to get new_paper.id
        added += 1

        if embedding:
            vector_store.add(new_paper.id, embedding)

    db.commit()
    return added

def ingest_arxiv(query: str, max_results: int = 10):
    """
    Fetch papers from arXiv and save them into the DB.
    """
    db = SessionLocal()
    try:
        papers = fetch_papers(query, max_results)
        added_count = save_papers_to_db(papers, db)
        return {"fetched": len(papers), "inserted": added_count}
    finally:
        db.close()