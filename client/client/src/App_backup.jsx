import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
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
      setAnswer("");
      setQuestion("");

      const response = await axios.post(
        "http://127.0.0.1:8000/upload-pdf/",
        formData
      );

      setNotes(response.data.notes || "");
    } catch (error) {
      console.error(error);
      setNotes("Failed to generate notes.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      setAsking(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/ask-question/",
        {
          question: question,
        }
      );

      setAnswer(response.data.answer || "");
    } catch (error) {
      console.error(error);
      setAnswer("Failed to get answer.");
    } finally {
      setAsking(false);
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
          maxWidth: "1100px",
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
            Upload PDFs, generate notes and chat with your documents
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
              {loading
                ? "Generating Notes..."
                : "Generate Notes"}
            </button>
          </div>

          {notes && (
            <div
              style={{
                marginTop: "30px",
                background: "#111827",
                borderRadius: "18px",
                padding: "30px",
                border: "1px solid #334155",
                maxHeight: "650px",
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
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>
            </div>
          )}

          {notes && (
            <div
              style={{
                marginTop: "30px",
                background: "#111827",
                borderRadius: "18px",
                padding: "30px",
                border: "1px solid #334155",
              }}
            >
              <h2
                style={{
                  color: "#f8fafc",
                  marginBottom: "20px",
                }}
              >
                💬 Chat With PDF
              </h2>

              <input
                type="text"
                placeholder="Ask anything from the PDF..."
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "white",
                  marginBottom: "15px",
                  boxSizing: "border-box",
                }}
              />

              <button
                onClick={askQuestion}
                disabled={asking}
                style={{
                  background:
                    "linear-gradient(90deg, #2563eb, #7c3aed)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                {asking
                  ? "Thinking..."
                  : "Ask Question"}
              </button>

              {answer && (
                <div
                  style={{
                    marginTop: "20px",
                    background: "#0f172a",
                    padding: "20px",
                    borderRadius: "12px",
                    color: "#cbd5e1",
                    lineHeight: "1.8",
                  }}
                >
                  <ReactMarkdown>
                    {answer}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;