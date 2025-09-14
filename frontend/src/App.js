import React, { useEffect, useState } from "react";
import IngestForm from "./components/IngestForm";
import RecommendForm from "./components/RecommendForm";
import PaperList from "./components/PaperList";
import { listPapers } from "./api";

function App() {
  const [papers, setPapers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function load() {
      const ps = await listPapers();
      setPapers(ps);
    }
    load();
  }, []);

  return (
    <div style={{ padding: "1em" }}>
      <h1>📄 Research Paper Recommender (MVP)</h1>

      <IngestForm
        onIngest={(data) => {
          alert(`${data.added_count} new papers ingested`);
        }}
      />

      <RecommendForm
        onResults={(results) => {
          setRecommendations(results);
        }}
      />

      <h2>Recommendations</h2>
      <PaperList papers={recommendations} />

      <h2>All Papers (first 20)</h2>
      <PaperList papers={papers} />
    </div>
  );
}

export default App;
