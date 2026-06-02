from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import requests

app = FastAPI()

# Store latest uploaded PDF text
pdf_content = ""

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Split large PDFs into chunks
# -----------------------------
def split_text(text, chunk_size=3000):
    chunks = []

    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])

    return chunks


# -----------------------------
# Generate Notes
# -----------------------------
def generate_notes(text):

    prompt = f"""
You are an expert study assistant.

Convert the following content into professional study notes.

Format:

# Topic

## Key Concepts
- Bullet points

## Important Definitions
- Definitions

## Important Facts
- Facts

## Quick Revision Notes
- Revision points

Content:
{text}
"""

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=300
        )

        data = response.json()

        return data.get("response", "")

    except Exception as e:

        return f"Error: {str(e)}"


# -----------------------------
# Ask Questions
# -----------------------------
def ask_pdf_question(question):

    global pdf_content

    prompt = f"""
Answer the user's question ONLY using the PDF content.

If the answer is not present in the PDF,
say:
'The information is not available in the uploaded PDF.'

PDF CONTENT:

{pdf_content[:12000]}

QUESTION:

{question}
"""

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=300
        )

        data = response.json()

        return data.get("response", "")

    except Exception as e:

        return f"Error: {str(e)}"


@app.get("/")
def home():
    return {
        "message": "NeuroNotes Backend Running 🚀"
    }


# -----------------------------
# Upload PDF
# -----------------------------
@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):

    global pdf_content

    pdf_bytes = await file.read()

    pdf_reader = PyPDF2.PdfReader(
        io.BytesIO(pdf_bytes)
    )

    extracted_text = ""

    for page in pdf_reader.pages:

        text = page.extract_text()

        if text:
            extracted_text += text + "\n"

    if not extracted_text.strip():

        return {
            "filename": file.filename,
            "notes": "No readable text found in PDF."
        }

    # Save PDF for chat feature
    pdf_content = extracted_text

    chunks = split_text(extracted_text)

    all_notes = []

    for index, chunk in enumerate(chunks):

        print(
            f"Processing Chunk {index + 1}/{len(chunks)}"
        )

        notes = generate_notes(chunk)

        all_notes.append(notes)

    final_notes = "\n\n".join(all_notes)

    return {
        "filename": file.filename,
        "notes": final_notes
    }


# -----------------------------
# Chat With PDF
# -----------------------------
@app.post("/ask-question/")
async def ask_question(data: dict):

    question = data.get("question", "")

    if not question:

        return {
            "answer": "Please provide a question."
        }

    answer = ask_pdf_question(question)

    return {
        "answer": answer
    }