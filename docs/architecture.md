# System Architecture

CyberShield-EDU is a modern web application built with a decoupled frontend-backend architecture.

## High-Level Architecture

```mermaid
graph TD
    User([Student/Admin User]) --> Frontend[Vanilla HTML/JS Frontend]
    Frontend -->|REST API HTTP| Backend[FastAPI Backend]

    subgraph Backend Core
        Backend --> DetectText[Text Detector (DistilBERT)]
        Backend --> DetectURL[URL Analyzer (Heuristics)]
        Backend --> DetectPDF[PDF Analyzer (pdfplumber)]
        Backend --> DetectImg[Image OCR (Tesseract)]
        
        Backend <--> Config[Dynamic Configuration]
        Backend <--> Storage[JSON Data Files]
    end
    
    subgraph Frontend Client
        Dashboard[Cyber Dashboard] --> DetectionUI[Detection Views]
        Dashboard --> AwarenessUI[Education Center]
        Dashboard --> AdminUI[Admin Dashboard]
    end
```

## 1. Frontend (Client-Side)
The frontend is a premium, responsive interface built with Vanilla HTML5, CSS3, and JavaScript.
* **Structure**: Modular HTML templates for different views (Detection, Education, Admin).
* **Styling**: Vanilla CSS with a custom "Glassmorphism" design system and multi-theme (Light/Dark) support.
* **State Management**: Local JavaScript variables and `localStorage` to persist recent scans and user preferences.
* **Data Fetching**: Standard `fetch` API and Axios for communication with the FastAPI backend.
* **Navigation**: Direct page-to-page navigation with shared header/footer components for a consistent experience.
* **Data Visualization**: Integrated CSS-based charts and lightweight JS libraries for system statistics in the Admin Panel.

## 2. Backend (Server-Side)
The backend is a high-performance Python server capable of handling asynchronous requests and machine learning inference.
* **Framework**: FastAPI provides asynchronous request handling, automatic OpenAPI (`/docs`) generation, and robust data validation with Pydantic.
* **Text Processing (AI)**:
  * Uses the `transformers` library to run inference on a pre-trained `DistilBERT` model (`distilbert-base-uncased-finetuned-sst-2-english`).
  * Optimized for CPU inference speed to ensure rapid responses to user queries.
* **Vision & Document Processing**:
  * `pdfplumber` is utilized to extract textual content from uploaded PDF documents.
  * `pytesseract` (Python wrapper for Tesseract OCR) extracts text from user-submitted images, facilitated by `Pillow` and `opencv-python`.
* **URL Heuristics**:
  * Utilizes `python-levenshtein` to compute string distances to detect domain typosquatting against known safe brands.
  * Implements Shannon entropy calculations to identify machine-generated or obfuscated URLs.
* **Data Storage**:
  * Currently utilizes localized static configurations (`config.py`) and JSON files (`educational_resources.json`) for data persistence. The modular design allows for future swap-out to a formal PostgreSQL/MongoDB database.
