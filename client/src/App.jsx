function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        NeuroNotes 🧠
      </h1>

      <p style={{ marginBottom: "2rem", color: "#cbd5e1" }}>
        AI-powered Notes Generator
      </p>

      <input type="file" />

      <button
        style={{
          marginTop: "1.5rem",
          padding: "12px 24px",
          border: "none",
          borderRadius: "10px",
          backgroundColor: "#2563eb",
          color: "white",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Generate Notes
      </button>
    </div>
  );
}

export default App;