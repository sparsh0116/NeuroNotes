import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/upload-pdf/",
        formData
      );

      setMessage(response.data.notes);
    } catch (error) {
      console.error(error);
      setMessage("Failed to generate notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              fontSize: "3.5rem",
              marginBottom: "10px",
              background:
                "linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              fontWeight: "800",
            }}
          >
            NeuroNotes 🧠
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "18px",
              marginBottom: "40px",
            }}
          >
            Transform PDFs into AI-powered study notes instantly
          </p>

          <div
            style={{
              background: "#111827",
              borderRadius: "18px",
              padding: "30px",
              border: "1px solid #334155",
              textAlign: "center",
            }}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{
                color: "#e2e8f0",
                marginBottom: "15px",
              }}
            />

            {selectedFile && (
              <p
                style={{
                  color: "#60a5fa",
                  marginTop: "15px",
                  marginBottom: "20px",
                }}
              >
                📄 {selectedFile.name}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                background:
                  "linear-gradient(90deg, #2563eb, #7c3aed)",
                color: "white",
                border: "none",
                padding: "14px 32px",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              {loading ? "Generating Notes..." : "Generate Notes"}
            </button>
          </div>

          {message && (
            <div
              style={{
                marginTop: "30px",
                background: "#111827",
                borderRadius: "18px",
                padding: "30px",
                border: "1px solid #334155",
                maxHeight: "600px",
                overflowY: "auto",
              }}
            >
              <h2
                style={{
                  color: "#f8fafc",
                  marginBottom: "20px",
                  fontSize: "28px",
                }}
              >
                📘 Generated Notes
              </h2>

              <div
                style={{
                  color: "#cbd5e1",
                  lineHeight: "1.9",
                  fontSize: "16px",
                  textAlign: "left",
                }}
              >
                <ReactMarkdown>{message}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;