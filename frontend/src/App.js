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
  const [titleSearch, setTitleSearch] = useState("");
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

  // Combine papers
  const combinedPapers = [...ingestedPapers, ...recommendedPapers];

  // Apply filters & search
  const filteredPapers = combinedPapers.filter((paper) => {
    const authorsText = paper.authors || "";
    const matchesAuthor = authorFilter
      ? authorsText.toLowerCase().includes(authorFilter.toLowerCase())
      : true;

    const matchesYearMin = yearMin ? paper.publication_year >= Number(yearMin) : true;
    const matchesYearMax = yearMax ? paper.publication_year <= Number(yearMax) : true;

    const titleText = paper.title || "";
    const matchesTitle = titleSearch
      ? titleText.toLowerCase().includes(titleSearch.toLowerCase())
      : true;

    return matchesAuthor && matchesYearMin && matchesYearMax && matchesTitle;
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search papers by title..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Ingest + Recommend Forms */}
        <IngestForm onIngest={(newPapers) => setIngestedPapers(newPapers)} />
        <RecommendForm onRecommend={(recommended) => setRecommendedPapers(recommended)} />

        {/* Combined / Separate toggle */}
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

              {/* Year filters */}
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

        {/* Paper Lists */}
        {showCombined ? (
          <PaperList
            title="All Papers"
            papers={sortedPapers}
            highlightText={authorFilter}
            highlightTitle={titleSearch}
          />
        ) : (
          <>
            <PaperList
              title="Ingested Papers"
              papers={ingestedPapers}
              loading={loadingIngested}
              highlightTitle={titleSearch}
            />
            <PaperList
              title="Recommended Papers"
              papers={recommendedPapers}
              loading={loadingRecommended}
              highlightTitle={titleSearch}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
