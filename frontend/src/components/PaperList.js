export default function PaperList({ title, papers, loading }) {
  const paperArray = Array.isArray(papers) ? papers : [];

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-4 animate-pulse">
        Loading papers...
      </div>
    );
  }

  if (paperArray.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-4">
        No papers to display.
      </div>
    );
  }

  return (
    <div className="mt-6">
      {title && <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paperArray.map((paper) => (
          <div
            key={paper.id}
            className="bg-white p-4 rounded-xl shadow-md border hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-indigo-700">
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {paper.title}
              </a>
            </h3>
            <p className="text-sm text-gray-600 mt-1">{paper.authors}</p>
            <details className="mt-2 text-gray-700">
              <summary className="cursor-pointer font-medium">Abstract</summary>
              <p className="mt-1">{paper.abstract}</p>
            </details>
            <span className="text-xs text-gray-500 mt-2 block">
              Published: {paper.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
