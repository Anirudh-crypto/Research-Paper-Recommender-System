import { useState } from "react";
import axios from "axios";

function IngestForm({ onIngest }) {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/ingest_arxiv?query=${query}&max_results=${maxResults}`
      );
      onIngest(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold text-gray-800">📥 Ingest Papers</h2>
      <input
        type="text"
        placeholder="Enter topic (e.g., Computer Vision)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <input
        type="number"
        value={maxResults}
        onChange={(e) => setMaxResults(e.target.value)}
        min="1"
        max="50"
        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Ingesting..." : "Ingest Papers"}
      </button>
    </form>
  );
}

export default IngestForm;
