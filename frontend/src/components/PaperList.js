import React from "react";

export default function PaperList({ papers }) {
  if (!papers || papers.length === 0) return <p>No papers yet.</p>;
  return (
    <ul>
      {papers.map((p) => (
        <li key={p.id} style={{ marginBottom: "1em" }}>
          <strong>{p.title}</strong> ({p.year || "n/a"}) <br />
          <em>{p.authors}</em> <br />
          <a href={p.url} target="_blank" rel="noreferrer">
            View on arXiv
          </a>
        </li>
      ))}
    </ul>
  );
}
