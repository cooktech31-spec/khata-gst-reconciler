// =====================================================================
// App.jsx — main shell
// No router needed — simple state switch between 'home' and 'results'
// view. Small app ke liye yahi sahi hai; react-router add karna easy
// hai baad mein jab multi-page chahiye hoga.
// =====================================================================
import { useState } from "react";
import Home from "./pages/Home.jsx";
import Results from "./pages/Results.jsx";

export default function App() {
  const [view, setView] = useState("home");
  const [resultData, setResultData] = useState(null);

  function handleResult(data) {
    setResultData(data);
    setView("results");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleReset() {
    setResultData(null);
    setView("home");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (view === "results" && resultData) {
    return <Results data={resultData} onReset={handleReset} />;
  }

  return <Home onResult={handleResult} />;
}
