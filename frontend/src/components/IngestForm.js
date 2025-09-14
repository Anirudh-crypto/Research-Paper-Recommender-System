import React, { useState } from "react";
import { ingestArxiv } from "../api";

export default function IngestForm({ onIngest }) {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(5);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await ingestArxiv(query, maxResults);
      onIngest(data);
    } catch (err) {
      console.error(err);
      alert("Failed to ingest papers");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1em" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search arXiv (e.g. machine learning)"
      />
      <input
        type="number"
        value={maxResults}
        onChange={(e) => setMaxResults(e.target.value)}
        style={{ width: "60px", marginLeft: "0.5em" }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Ingesting..." : "Ingest"}
      </button>
    </form>
  );
}
