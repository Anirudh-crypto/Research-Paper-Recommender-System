import faiss
import numpy as np
from sqlalchemy.orm import Session
from app.models import Paper

class VectorStore:
    def __init__(self, dim: int = 384):  # 384 = MiniLM embedding size
        self.index = faiss.IndexFlatL2(dim)  # L2 = Euclidean distance
        self.paper_ids = []  # mapping FAISS index → DB id

    def build(self, db: Session):
        """Load all embeddings from DB into FAISS"""
        papers = db.query(Paper).filter(Paper.embedding.isnot(None)).all()
        vectors = [p.embedding for p in papers]
        ids = [p.id for p in papers]

        if vectors:
            matrix = np.array(vectors).astype("float32")
            self.index.add(matrix)
            self.paper_ids = ids

    def add(self, paper_id: int, embedding: list):
        """Add a single paper embedding"""
        vector = np.array([embedding]).astype("float32")
        self.index.add(vector)
        self.paper_ids.append(paper_id)

    def search(self, query_embedding: list, k: int = 5):
        """Return top-k most similar paper IDs"""
        vector = np.array([query_embedding]).astype("float32")
        distances, indices = self.index.search(vector, k)
        results = []
        for idx in indices[0]:
            if idx < len(self.paper_ids):
                results.append(self.paper_ids[idx])
        return results

vector_store = VectorStore()
