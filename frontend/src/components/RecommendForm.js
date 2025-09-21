import { useState } from "react";
import axios from "axios";

export default function RecommendForm({ onRecommend }) {
  const [query, setQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      query,
      k: 5,
      year_min: yearMin || null,
      year_max: yearMax || null,
      author: author || null,
    };

    try {
      const res = await axios.post("http://127.0.0.1:8000/recommend", payload);
      onRecommend(res.data);
    } catch (err) {
      console.error("Recommendation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold text-gray-800 flex justify-between items-center">
        🤖 Recommend Papers
        <button
          type="button"
          onClick={() => setFiltersVisible(!filtersVisible)}
          className="text-sm text-indigo-600 hover:underline"
        >
          {filtersVisible ? "Hide Filters" : "Show Filters"}
        </button>
      </h2>

      <input
        type="text"
        placeholder="Enter your query (e.g., Deep Learning)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />

      {filtersVisible && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="Year Min"
            value={yearMin}
            onChange={(e) => setYearMin(e.target.value)}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Year Max"
            value={yearMax}
            onChange={(e) => setYearMax(e.target.value)}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Recommending..." : "Get Recommendations"}
      </button>
    </form>
  );
}
