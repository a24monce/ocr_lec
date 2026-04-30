# OCR Invoice & Delivery Note Checker

A web application that automatically compares a global invoice against delivery notes (DN) using OCR, in order to identify missing documents.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Processing Logic](#processing-logic)
- [Optimizations](#optimizations)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

This project automates the consistency check between a **global invoice** and a set of **delivery notes** (DN). Using OCR, the application extracts DN numbers referenced in the invoice and verifies that a corresponding PDF has been provided — eliminating hours of manual verification.

---

## Features

- Workspace creation and management
- Upload of delivery notes (PDF) and global invoice (PDF)
- Automatic text extraction via OCR
- DN number detection using regex patterns
- Cross-checking between detected and uploaded delivery notes
- Clear identification of missing documents
- Structured results display
- Global invoice replacement without recreating the workspace
- Front-end progress bar during analysis

---

## Project Structure

```
root/
│
├── backend-ocr/              # FastAPI backend
│   ├── app/
│   │   ├── api/              # REST endpoints
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── utils/            # OCR & text extraction
│   │   └── db/               # Database configuration
│   └── uploads/              # Stored PDF files
│
├── front-ocr/                # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── handlers/         # Client-side business logic
│   │   ├── lib/              # Utilities and helpers
│   │   └── pages/            # Main views
│
└── README.md
```

---

## Tech Stack

### Backend

| Technology | Role |
|---|---|
| FastAPI | Async REST API framework |
| SQLAlchemy | ORM for data persistence |
| pytesseract / pdfplumber | OCR and text extraction |
| Docker | Service containerization |

### Frontend

| Technology | Role |
|---|---|
| React (Vite) | Modern reactive UI |
| Tailwind CSS | Utility-first styling |
| Fetch API | Backend communication |

---

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- Tesseract OCR installed on the host machine ([installation guide](https://github.com/tesseract-ocr/tesseract))
- Docker (optional)

### Backend

```bash
cd backend-ocr
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`  
Swagger documentation at `http://localhost:8000/docs`

### Frontend

```bash
cd front-ocr
npm install
npm run dev
```

App available at `http://localhost:5173`

### Docker (optional)

```bash
docker-compose up --build
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/workspaces/{id}/bl/` | Upload a delivery note |
| `POST` | `/workspaces/{id}/facture-globale/` | Upload the global invoice |
| `POST` | `/workspaces/{id}/check-facture-in-bl` | Run the comparison |
| `GET` | `/workspaces/{id}/bl/` | List uploaded delivery notes |
| `GET` | `/workspaces/{id}/facture-globale/` | Get global invoice details |

---

## Processing Logic

```
Invoice (PDF)
     |
     v
OCR text extraction
     |
     v
DN number detection (regex)
     |
     v
OCR text extraction for each uploaded DN
     |
     v
Set comparison
     |
     v
Results report
```

Sample response:

```json
{
  "Detected DN numbers": ["DN-001", "DN-002", "DN-003"],
  "Present delivery notes": ["DN-001", "DN-003"],
  "Missing count": 1,
  "Missing delivery notes": ["DN-002"]
}
```

---

## Optimizations

- **Single OCR pass** — each file is processed once and the result is cached
- **Text normalization** — input cleaning before comparison to reduce false negatives
- **Efficient data structures** — set-based comparisons for O(1) lookups
- **Modular architecture** — clear separation between extraction, comparison, and presentation layers

---

## Roadmap

- [ ] Persistent OCR cache to avoid reprocessing unchanged files
- [ ] Async processing via Celery or FastAPI Background Tasks
- [ ] Real-time progress tracking over WebSocket
- [ ] Cloud deployment with external file storage (S3 / GCS)
- [ ] User authentication with JWT
- [ ] Export results as PDF or Excel report

---

## Author

**Amal Moncer**  
Engineering student — project focused on OCR and document automation.
