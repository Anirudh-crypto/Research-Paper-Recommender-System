import axios from "axios";

// Adjust if backend runs on a different host/port
const API_BASE = "http://127.0.0.1:8000";

export async function ingestArxiv(query, maxResults = 5) {
  const res = await axios.post(`${API_BASE}/ingest_arxiv`, null, {
    params: { query, max_results: maxResults },
  });
  return res.data;
}

export async function recommend(text, k = 5) {
  const res = await axios.post(`${API_BASE}/recommend`, { text, k });
  return res.data.results;
}

export async function listPapers(limit = 20) {
  const res = await axios.get(`${API_BASE}/papers`, { params: { limit } });
  return res.data.papers;
}
