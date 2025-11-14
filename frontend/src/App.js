import React, { useState } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askBot = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("http://localhost:8002/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.answer || data.error || "No response");
    } catch (err) {
      setAnswer("Error connecting to backend");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h2>🤖 Chatbot</h2>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask me anything..."
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={askBot} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>
      <div style={{ marginTop: "20px" }}>
        <strong>Answer:</strong>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default App;
