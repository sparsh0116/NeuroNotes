from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import PyPDF2
import io
import requests

app = FastAPI(title="NeuroNotes V4")

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Models
# =========================

class QuestionRequest(BaseModel):
    question: str
    notes: Optional[str] = None


# =========================
# Memory Storage
# =========================

notes_storage = {
    "current_notes": ""
}


# =========================
# Utilities
# =========================

def split_text(text, chunk_size=3000):
    chunks = []

    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])

    return chunks


# =========================
# Ollama Health Check
# =========================

def check_ollama():

    try:
        response = requests.get(
            "http://localhost:11434/api/tags",
            timeout=10
        )

        return response.status_code == 200

    except:
        return False


# =========================
# Generate Notes
# =========================

def generate_notes(chunk):

    prompt = f"""
You are an expert study assistant.

Convert the provided content into professional markdown notes.

FORMAT:

# Title

## Overview

## Key Concepts

- Point

## Important Definitions

### Definition

Explanation

## Examples

- Example

## Quick Revision

✅ Point

CONTENT:

{chunk}

Return markdown only.
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

        if response.status_code != 200:
            return "Failed to generate notes."

        data = response.json()

        return data.get("response", "")

    except Exception as e:

        return f"Error: {str(e)}"


# =========================
# Chat With Notes
# =========================

def answer_question(notes, question):

    prompt = f"""
You are NeuroNotes AI.

Answer the question ONLY using the provided notes.

NOTES:

{notes}

QUESTION:

{question}

RULES:

1. Use notes only.
2. Be concise.
3. Use markdown.
4. If answer not found, say:
   "This information is not present in the notes."
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

        if response.status_code != 200:
            return "Unable to generate answer."

        data = response.json()

        return data.get("response", "")

    except Exception as e:

        return f"Error: {str(e)}"


# =========================
# Health Check
# =========================

@app.get("/health")
def health():

    return {
        "status": "running",
        "ollama": check_ollama()
    }


# =========================
# Home
# =========================

@app.get("/")
def home():

    return {
        "message": "NeuroNotes V4 Backend Running 🚀"
    }


# =========================
# Upload PDF
# =========================

@app.post("/upload-pdf/")
async def upload_pdf(
    file: UploadFile = File(...)
):

    try:

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

        chunks = split_text(
            extracted_text,
            chunk_size=3000
        )

        all_notes = []

        total_chunks = len(chunks)

        for index, chunk in enumerate(chunks):

            print(
                f"Processing Chunk {index + 1}/{total_chunks}"
            )

            notes = generate_notes(chunk)

            all_notes.append(notes)

        final_notes = "\n\n".join(
            all_notes
        )

        notes_storage[
            "current_notes"
        ] = final_notes

        print(
            f"Generated Notes Length: {len(final_notes)}"
        )

        return {
            "filename": file.filename,
            "notes": final_notes
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# Ask Question
# =========================

@app.post("/ask-question/")
async def ask_question(
    request: QuestionRequest
):

    try:

        question = request.question

        if not question.strip():

            return {
                "answer":
                "Please ask a valid question."
            }

        notes = notes_storage.get(
            "current_notes",
            ""
        )

        if not notes:

            return {
                "answer":
                "Generate notes first."
            }

        answer = answer_question(
            notes,
            question
        )

        return {
            "answer": answer
        }

    except Exception as e:

        return {
            "answer": f"Error: {str(e)}"
        }