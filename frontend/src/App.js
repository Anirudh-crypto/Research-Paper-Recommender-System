import { useState, useEffect } from "react";
import axios from "axios";
import IngestForm from "./components/IngestForm";
import RecommendForm from "./components/RecommendForm";
import PaperList from "./components/PaperList";

function App() {
  const [ingestedPapers, setIngestedPapers] = useState([]);
  const [recommendedPapers, setRecommendedPapers] = useState([]);
  const [loadingIngested, setLoadingIngested] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [showCombined, setShowCombined] = useState(false);

  // Filters settings
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // Fetch the papers at the beginning to display ingested papers
  useEffect(() => {
    const fetchPapers = async () => {
      setLoadingIngested(true);
      try {
        const res = await axios.get("http://127.0.0.1:8000/papers?limit=20");
        if (Array.isArray(res.data)) {
          setIngestedPapers(res.data);
        } else if (res.data.papers && Array.isArray(res.data.papers)) {
          setIngestedPapers(res.data.papers);
        } else {
          setIngestedPapers([]);
        }
      } catch (err) {
        console.error("Failed to fetch papers:", err);
        setIngestedPapers([]);
      } finally {
        setLoadingIngested(false);
      }
    };

    fetchPapers();
  }, []);

  const combinedPapers = [...ingestedPapers, ...recommendedPapers];

  const filteredPapers = combinedPapers.filter((paper) => {
    const matchesYearMin = yearMin ? paper.year >= Number(yearMin) : true;
    const matchesYearMax = yearMax ? paper.year <= Number(yearMax) : true;
    const matchesAuthor = authorFilter
      ? paper.authors.toLowerCase().includes(authorFilter.toLowerCase())
      : true;
    return matchesYearMin && matchesYearMax && matchesAuthor;
  });

  // Sort papers based on publication year or title
  const sortedPapers = [...filteredPapers].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return b.year - a.year;
      case "oldest":
        return a.year - b.year;
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <IngestForm onIngest={(newPapers) => setIngestedPapers(newPapers)} />
        <RecommendForm onRecommend={(recommended) => setRecommendedPapers(recommended)} />

        {/* Toggle combined view */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => setShowCombined(!showCombined)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            {showCombined ? "Show Separate Lists" : "Show Combined Papers"}
          </button>

          {showCombined && (
            <div className="flex flex-wrap gap-3 items-center">
              {/* Sorting */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="title">Sort by Title</option>
              </select>

              {/* Year filter */}
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

              {/* Author filter */}
              <input
                type="text"
                placeholder="Author"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Paper lists */}
        {showCombined ? (
          <PaperList title="All Papers" papers={sortedPapers} />
        ) : (
          <>
            <PaperList title="Ingested Papers" papers={ingestedPapers} loading={loadingIngested} />
            <PaperList title="Recommended Papers" papers={recommendedPapers} loading={loadingRecommended} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
