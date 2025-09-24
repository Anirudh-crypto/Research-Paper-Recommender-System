import { useState } from "react";
import PaperModal from "./PaperModal";
import {highlightMatch} from "../utils/highlightMatch";

export default function PaperList({ title, papers, loading, highlightText = "", highlightTitle = "" }) {
  const [selectedPaper, setSelectedPaper] = useState(null);

  if (loading) {
    return <p className="text-gray-500 italic">{title} are loading...</p>;
  }

  if (!papers || papers.length === 0) {
    return <p className="text-gray-500 italic">No {title} found.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {papers.map((paper) => (
          <li
            key={paper.id}
            onClick={() => setSelectedPaper(paper)}
            className="bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-indigo-700 line-clamp-2">
              {highlightMatch(paper.title, highlightTitle)}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
              {highlightMatch(paper.authors || "Unknown", highlightText)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{paper.year || "N/A"}</p>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {selectedPaper && (
        <PaperModal paper={selectedPaper} onClose={() => setSelectedPaper(null)} />
      )}
    </div>
  );
}
