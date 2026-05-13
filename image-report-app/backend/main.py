import os
import base64
import json
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types
from typing import Optional
import re

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"  # free tier model

app = FastAPI(title="Image Report Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOMAIN_PROMPTS = {
    "general": """You are an expert visual analyst. Analyze this image thoroughly and generate a structured report.
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "title": "short descriptive title",
  "summary": "2-3 sentence overview of what the image shows",
  "findings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5", "finding 6"],
  "confidence_scores": [
    {"label": "Image Clarity", "score": 0.0},
    {"label": "Subject Visibility", "score": 0.0},
    {"label": "Detail Level", "score": 0.0},
    {"label": "Analysis Confidence", "score": 0.0}
  ],
  "recommendations": "actionable next steps or observations",
  "tags": ["tag1", "tag2", "tag3"]
}""",

    "medical": """You are a medical imaging assistant (for educational/demo purposes only). Analyze this image and return ONLY a valid JSON:
{
  "title": "imaging report title",
  "summary": "clinical-style description of visible structures and features",
  "findings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5", "finding 6"],
  "confidence_scores": [
    {"label": "Image Quality", "score": 0.0},
    {"label": "Structure Visibility", "score": 0.0},
    {"label": "Anomaly Detection", "score": 0.0},
    {"label": "Diagnostic Confidence", "score": 0.0}
  ],
  "recommendations": "suggested follow-up or clinical notes — add disclaimer this is for demo only",
  "tags": ["tag1", "tag2", "tag3"]
}""",

    "product": """You are a quality control inspector AI. Analyze this product image and return ONLY a valid JSON:
{
  "title": "QC inspection report title",
  "summary": "product description and overall quality assessment",
  "findings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5", "finding 6"],
  "confidence_scores": [
    {"label": "Surface Quality", "score": 0.0},
    {"label": "Defect Detection", "score": 0.0},
    {"label": "Conformance", "score": 0.0},
    {"label": "Pass Probability", "score": 0.0}
  ],
  "recommendations": "QC disposition and recommended action",
  "tags": ["tag1", "tag2", "tag3"]
}""",

    "satellite": """You are a geospatial analyst. Analyze this satellite or aerial image and return ONLY a valid JSON:
{
  "title": "geospatial analysis report title",
  "summary": "description of terrain, land use, and notable features",
  "findings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5", "finding 6"],
  "confidence_scores": [
    {"label": "Image Resolution", "score": 0.0},
    {"label": "Feature Detection", "score": 0.0},
    {"label": "Classification Accuracy", "score": 0.0},
    {"label": "Analysis Confidence", "score": 0.0}
  ],
  "recommendations": "potential use cases or further analysis suggestions",
  "tags": ["tag1", "tag2", "tag3"]
}""",

    "security": """You are a security and surveillance AI analyst. Analyze this image and return ONLY a valid JSON:
{
  "title": "security assessment report title",
  "summary": "scene description, personnel count, activity assessment",
  "findings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5", "finding 6"],
  "confidence_scores": [
    {"label": "Scene Clarity", "score": 0.0},
    {"label": "Activity Detection", "score": 0.0},
    {"label": "Threat Assessment", "score": 0.0},
    {"label": "Detection Confidence", "score": 0.0}
  ],
  "recommendations": "security observations and recommended monitoring actions",
  "tags": ["tag1", "tag2", "tag3"]
}"""
}


@app.get("/")
def root():
    return {"status": "ok", "message": "Image Report Generator API is running (Gemini)"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    domain: Optional[str] = Form("general")
):
    if domain not in DOMAIN_PROMPTS:
        raise HTTPException(status_code=400, detail=f"Invalid domain. Choose from: {list(DOMAIN_PROMPTS.keys())}")

    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    image_data = await file.read()
    if len(image_data) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max size is 20MB.")

    try:
        # Build content parts using new google-genai SDK
        image_part = types.Part.from_bytes(data=image_data, mime_type=file.content_type)
        text_part = types.Part.from_text(text=DOMAIN_PROMPTS[domain])

        response = client.models.generate_content(
            model=MODEL,
            contents=[types.Content(role="user", parts=[image_part, text_part])],
            config=types.GenerateContentConfig(
                max_output_tokens=2048,
                temperature=0.2,
            )
        )

        raw_text = response.text.strip()

        # Strip markdown fences if present
        raw_text = re.sub(r"```json\s*", "", raw_text)
        raw_text = re.sub(r"```\s*", "", raw_text)
        raw_text = raw_text.strip()

        report = json.loads(raw_text)

        return JSONResponse(content={
            "success": True,
            "domain": domain,
            "filename": file.filename,
            "report": report
        })

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse model response as JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
