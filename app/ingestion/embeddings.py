from sentence_transformers import SentenceTransformer

# Load model once and reuse
model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str):
    """
    Generate a dense vector embedding for given text.
    """
    return model.encode(text, convert_to_numpy=True).tolist()
