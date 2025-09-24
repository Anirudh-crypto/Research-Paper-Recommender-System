export default function PaperModal({ paper, onClose }) {
  if (!paper) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl"
        >
          ✕
        </button>

        {/* Paper details */}
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">{paper.title}</h2>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Authors:</span> {paper.authors || "Unknown"}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Published:</span>{" "}
          {paper.year || "N/A"}
        </p>
        <p className="text-gray-800 mb-4">{paper.abstract}</p>

        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          View Full Paper
        </a>
      </div>
    </div>
  );
}
