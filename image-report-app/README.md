# 🖼 Image → Report Generator

An AI-powered full-stack app that analyzes images and generates structured reports using **Claude Vision (claude-opus-4-5)**. Built with **FastAPI** (backend) + **React/Vite** (frontend).

---

## 🗂 Project Structure

```
image-report-app/
├── backend/
│   ├── main.py              # FastAPI app with /analyze endpoint
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # API key template
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Root component + state management
│   │   ├── App.css
│   │   ├── main.jsx          # React entry point
│   │   ├── index.css         # Global styles + CSS variables
│   │   └── components/
│   │       ├── DomainSelector.jsx   # Domain tabs (General / Medical / QC / etc.)
│   │       ├── ImageUploader.jsx    # Drag & drop image uploader
│   │       └── ReportPanel.jsx      # Structured report renderer
│   ├── index.html
│   ├── package.json
│   └── vite.config.js       # Dev proxy → backend:8000
└── README.md
```

---

## ⚙️ Setup & Run

### 1. Clone & enter the project
```bash
cd image-report-app
```

### 2. Backend setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Anthropic API key
cp .env.example .env
# Edit .env → set ANTHROPIC_API_KEY=sk-ant-...

# Start the API server
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup (new terminal)
```bash
cd frontend

npm install
npm run dev
```

### 4. Open the app
Visit **http://localhost:5173**

---

## 🔌 API Reference

### `POST /analyze`
Analyze an image and get a structured JSON report.

**Request** (multipart/form-data):
| Field  | Type   | Required | Description                                      |
|--------|--------|----------|--------------------------------------------------|
| file   | File   | ✅       | Image file (PNG, JPG, WEBP — max 20MB)           |
| domain | string | optional | `general` \| `medical` \| `product` \| `satellite` \| `security` |

**Response:**
```json
{
  "success": true,
  "domain": "general",
  "filename": "photo.jpg",
  "report": {
    "title": "Outdoor Street Scene",
    "summary": "...",
    "findings": ["...", "...", "...", "...", "...", "..."],
    "confidence_scores": [
      { "label": "Image Clarity", "score": 0.91 },
      ...
    ],
    "recommendations": "...",
    "tags": ["urban", "daytime", "pedestrians"]
  }
}
```

---

## 🧠 Domains

| Domain      | Use Case                                   |
|-------------|---------------------------------------------|
| `general`   | Any image — scene description, objects      |
| `medical`   | Imaging/scans — educational demo only       |
| `product`   | QC inspection — defect & conformance check  |
| `satellite` | Aerial/geo imagery — land use analysis      |
| `security`  | Surveillance scenes — activity assessment   |

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|--------------------------------------|
| AI Model  | Claude claude-opus-4-5 (Vision)            |
| Backend   | FastAPI + Uvicorn                    |
| Frontend  | React 18 + Vite                      |
| HTTP      | Axios                                |
| Styling   | Custom CSS (no frameworks)           |

---

## 🔮 Possible Enhancements

- **PDF report export** — generate downloadable reports with `reportlab`
- **Batch processing** — upload and analyze multiple images at once
- **History panel** — store past analyses in SQLite with SQLAlchemy
- **YOLOv8 integration** — add real CV model for object detection before LLM reporting
- **Auth** — add API key / user auth for multi-user deployment
- **Docker** — containerize with `docker-compose` for one-command startup
