import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Upload,
  FileText,
  Moon,
  Sun,
  Send,
  Brain,
  Copy,
  Download,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleFileChange = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await axios.post(
        `${API}/upload-pdf/`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      console.log(
        "Notes Length:",
        res.data.notes?.length
      );

      setNotes(res.data.notes || "");
      setMessages([]);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to generate notes. Check backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentQuestion,
      },
    ]);

    setQuestion("");

    try {
      setAsking(true);

      const res = await axios.post(
        `${API}/ask-question/`,
        {
          question: currentQuestion,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            res.data.answer ||
            "No answer generated.",
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to generate answer.",
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(
        notes
      );
    } catch (err) {
      console.error(err);
    }
  };

  const downloadNotes = () => {
    const blob = new Blob(
      [notes],
      {
        type: "text/markdown",
      }
    );

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "notes.md";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      className={
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-100 text-black"
      }
    >
      <div className="h-screen flex">

        {/* Sidebar */}

        <aside className="w-[320px] border-r border-slate-800 p-6 flex flex-col">

          <div className="flex justify-between items-center mb-8">

            <div className="flex items-center gap-3">
              <Brain size={32} />
              <h1 className="font-bold text-2xl">
                NeuroNotes V4
              </h1>
            </div>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              {darkMode
                ? <Sun />
                : <Moon />}
            </button>

          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) =>
              e.preventDefault()
            }
            className="border-2 border-dashed border-slate-700 rounded-3xl p-8 text-center"
          >
            <Upload
              size={50}
              className="mx-auto mb-4"
            />

            <h3 className="font-semibold">
              Upload PDF
            </h3>

            <p className="text-slate-500 mt-2 mb-4">
              Drag & Drop or Select
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                handleFileChange(
                  e.target.files[0]
                )
              }
            />
          </div>

          {selectedFile && (
            <div className="mt-5 bg-slate-900 p-4 rounded-2xl">
              <div className="flex gap-3 items-center">
                <FileText />
                <span className="truncate">
                  {selectedFile.name}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={
              loading ||
              !selectedFile
            }
            className="mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50"
          >
            {loading
              ? "Generating Notes..."
              : "Generate Notes"}
          </button>

          {error && (
            <div className="mt-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mt-auto text-sm text-slate-500">
            NeuroNotes AI PDF Assistant
          </div>

        </aside>

        {/* Notes */}

        <main className="flex-1 overflow-y-auto p-8">

          {!notes ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              Upload a PDF to generate notes
            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl p-8">

              <div className="flex justify-between items-center mb-8">

                <div>
                  <h2 className="text-3xl font-bold">
                    Study Notes
                  </h2>

                  <p className="text-slate-400 mt-2">
                    AI Generated Notes
                  </p>
                </div>

                <div className="flex gap-2">

                  <button
                    onClick={copyNotes}
                    className="bg-slate-800 p-3 rounded-xl"
                  >
                    <Copy size={18} />
                  </button>

                  <button
                    onClick={downloadNotes}
                    className="bg-slate-800 p-3 rounded-xl"
                  >
                    <Download size={18} />
                  </button>

                </div>

              </div>

              <pre className="whitespace-pre-wrap text-sm">
                {notes}
              </pre>

            </div>
          )}

        </main>

        {/* Chat */}

        <section className="w-[400px] border-l border-slate-800 flex flex-col">

          <div className="p-5 border-b border-slate-800">
            <h2 className="font-bold text-xl">
              Chat With Notes
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-500 text-center">
                Ask questions about your notes
              </div>
            )}

            {messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.role === "user"
                        ? "bg-blue-600"
                        : "bg-slate-800"
                    }`}
                  >
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            )}

            {asking && (
              <div className="bg-slate-800 p-3 rounded-2xl w-fit">
                Thinking...
              </div>
            )}

            <div ref={chatBottomRef} />

          </div>

          <div className="border-t border-slate-800 p-4">

            <div className="flex gap-2">

              <input
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !asking
                  ) {
                    askQuestion();
                  }
                }}
                placeholder="Ask anything..."
                className="flex-1 bg-slate-900 rounded-xl px-4 py-3 outline-none"
              />

              <button
                onClick={askQuestion}
                disabled={asking}
                className="bg-blue-600 px-4 rounded-xl disabled:opacity-50"
              >
                <Send size={18} />
              </button>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}