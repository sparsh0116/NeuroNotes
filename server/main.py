from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import requests

app = FastAPI()

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
# Generate notes using Ollama
# -----------------------------
def generate_notes(text):

    prompt = f"""
You are an expert study notes generator.

Convert the following PDF content into beautiful markdown notes.

Format:

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

PDF CONTENT:

{text}

Return ONLY markdown notes.
Do not ask for a PDF.
Do not ask questions.
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
            return "Error generating notes."

        data = response.json()

        return data.get("response", "")

    except Exception as e:
        return f"Error: {str(e)}"


@app.get("/")
def home():
    return {
        "message": "NeuroNotes Backend Running 🚀"
    }


@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):

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

    # Split large PDFs
    chunks = split_text(extracted_text)

    all_notes = []

    for index, chunk in enumerate(chunks):

        print(f"Processing Chunk {index + 1}/{len(chunks)}")

        notes = generate_notes(chunk)

        all_notes.append(notes)

    final_notes = "\n\n".join(all_notes)

    return {
        "filename": file.filename,
        "notes": final_notes
    }