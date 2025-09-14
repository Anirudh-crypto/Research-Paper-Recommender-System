# app/faiss_index.py
import os
import json
import numpy as np
import faiss

class FaissIndex:
    def __init__(self, dim=384, index_path="faiss.index", map_path="id_map.json"):
        self.dim = dim
        self.index_path = index_path
        self.map_path = map_path
        self._load_or_create()

    def _load_or_create(self):
        if os.path.exists(self.index_path) and os.path.exists(self.map_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.map_path, "r") as f:
                self.id_map = json.load(f)   # keys: str(index_position) -> paper_id
        else:
            # We'll use inner-product after normalizing vectors for cosine similarity
            self.index = faiss.IndexFlatIP(self.dim)
            self.id_map = {}

    def add(self, vectors: np.ndarray, paper_ids):
        """
        vectors: (N, dim) float32, already normalized (if using IP)
        paper_ids: list of paper ids (ints)
        """
        if vectors.dtype != np.float32:
            vectors = vectors.astype('float32')
        start = self.index.ntotal
        self.index.add(vectors)
        for i, pid in enumerate(paper_ids):
            self.id_map[str(start + i)] = int(pid)
        self.save()

    def save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.map_path, "w") as f:
            json.dump(self.id_map, f)

    def search(self, vector: np.ndarray, k=5):
        """
        vector: (1, dim) float32 and normalized
        returns: list of paper_ids in ranked order
        """
        if self.index.ntotal == 0:
            return []
        D, I = self.index.search(vector, k)
        result = []
        for idx in I[0]:
            if int(idx) < 0:
                continue
            pid = self.id_map.get(str(int(idx)))
            if pid is not None:
                result.append(int(pid))
        return result
