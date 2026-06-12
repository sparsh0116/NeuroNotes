import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Upload,
  FileText,
  Moon,
  Sun,
  Send,
  Brain,
} from "lucide-react";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);

  const handleFileChange = (file) => {
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      handleFileChange(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/upload-pdf/",
        formData
      );

      setNotes(res.data.notes || "");
    } catch (err) {
      console.log(err);
      setNotes("Failed to generate notes.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
    ]);

    try {
      setAsking(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/ask-question/",
        { 
          question,
          notes
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer || "No answer generated.",
        },
      ]);

      setQuestion("");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to get answer.",
        },
      ]);
    } finally {
      setAsking(false);
    }
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

        <aside className="w-[300px] border-r border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Brain size={32} />
              <h1 className="text-2xl font-bold">NeuroNotes</h1>
            </div>

            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-slate-700 rounded-3xl p-8 text-center hover:border-blue-500 hover:bg-slate-900/40 transition-all"
          >
            <Upload size={46} className="mx-auto mb-4 text-blue-400" />

            <h3 className="font-semibold text-lg">
              Drag & Drop PDF
            </h3>

            <p className="text-slate-500 mt-2 mb-4">
              or choose from device
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                handleFileChange(e.target.files[0])
              }
            />
          </div>

          {selectedFile && (
            <div className="mt-6 bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-3">
                <FileText />
                <div>
                  <p className="font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    PDF Ready
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-xl font-semibold"
          >
            {loading ? "Generating..." : "Generate Notes"}
          </button>

          <div className="mt-auto text-sm text-slate-500">
            NeuroNotes V3 SaaS
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="mb-8">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              NeuroNotes V3
            </h1>

            <p className="text-slate-400 mt-3">
              AI Powered PDF Intelligence
            </p>
          </div>

          {!notes ? (
            <div className="h-[70vh] flex items-center justify-center text-slate-500">
              Upload PDF to generate notes
            </div>
          ) : (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-10 h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm mb-4">
                    AI Generated Notes
                  </div>

                  <h2 className="text-4xl font-bold">
                    Study Notes
                  </h2>

                  <p className="text-slate-400 mt-2">
                    Structured summary from your PDF
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(notes)
                  }
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
                >
                  Copy
                </button>
              </div>

              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-5xl font-black text-white border-b border-slate-700 pb-5 mb-8">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-bold text-blue-400 mt-12 mb-5">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-purple-400 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-300 leading-8 mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-3 my-5">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex gap-3 text-slate-300">
                      <span className="text-blue-400">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                }}
              >
                {notes}
              </ReactMarkdown>
            </div>
          )}
        </main>

        <section className="w-[380px] border-l border-slate-800 flex flex-col">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-bold text-xl">
              Chat with PDF
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Brain
                  size={55}
                  className="text-purple-500 mb-5"
                />
                <h3 className="text-xl font-semibold">
                  Chat With Your PDF
                </h3>
                <p className="text-slate-500 mt-2">
                  Ask summaries, concepts and definitions
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600"
                      : "bg-slate-800"
                  }`}
                >
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {asking && (
              <div className="bg-slate-800 px-4 py-3 rounded-2xl w-fit">
                Thinking...
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-slate-800 p-4 bg-slate-950">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                placeholder="Ask anything..."
                className="flex-1 bg-slate-900 rounded-xl px-4 py-3 outline-none"
              />

              <button
                onClick={askQuestion}
                className="bg-blue-600 px-4 rounded-xl"
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
