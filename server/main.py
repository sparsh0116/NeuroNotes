from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import requests

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_notes(text):
    prompt = f"""
You are an expert study assistant.

Create professional study notes in MARKDOWN format.

Structure:

# Topic Title

## Key Concepts
- Important concepts
- Important concepts

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
            timeout=120
        )

        if response.status_code != 200:
            return "Error generating notes."

        data = response.json()

        return data.get("response", "No response generated.")

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
            text = text.replace("\n", " ")
            extracted_text += text + "\n"

    if not extracted_text.strip():
        return {
            "filename": file.filename,
            "notes": "No readable text found in PDF."
        }

    notes = generate_notes(
        extracted_text[:6000]
    )

    return {
        "filename": file.filename,
        "notes": notes
    }