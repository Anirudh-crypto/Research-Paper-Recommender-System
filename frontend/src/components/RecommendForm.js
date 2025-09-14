import React, { useState } from "react";
import { recommend } from "../api";

export default function RecommendForm({ onResults }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const results = await recommend(text, 5);
      onResults(results);
    } catch (err) {
      console.error(err);
      alert("Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1em" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a topic or description"
        style={{ width: "300px" }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Recommend"}
      </button>
    </form>
  );
}
