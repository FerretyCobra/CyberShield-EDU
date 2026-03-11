# CyberShield-EDU 🛡️

**An advanced, AI-powered cybersecurity protection platform designed specifically to help students detect and avoid online scams, phishing links, and fraudulent documents.**

![CyberShield Overview](https://img.shields.io/badge/Status-Active-brightgreen)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB)
![ML](https://img.shields.io/badge/AI-DistilBERT-FF9900)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📌 Executive Summary

Students globally are frequently targeted by sophisticated cyber scams involving fake internships, fraudulent scholarships, housing deposit theft, and phishing links. **CyberShield-EDU** provides a comprehensive, unified, and easy-to-use digital safety dashboard powered by Machine Learning and heuristic analysis. By proactively analyzing suspicious content at the source, CyberShield-EDU aims to elevate digital literacy and prevent financial and data loss among student populations.

## ✨ Core Capabilities & Features

Our platform employs a multi-layered approach to threat detection, ensuring users are protected across various digital communication channels:

### 1. 📝 Text Scam Detection (NLP)
Analyzes SMS, WhatsApp messages, or emails using an advanced Natural Language Processing model (`DistilBERT` fine-tuned for sequence classification). It identifies signs of:
- Artificial urgency or pressure tactics.
- Suspicious financial requests (e.g., gift cards, unexpected fees).
- Common scam patterns specific to student targeting.

### 2. 🔗 URL Phishing Scanner
Proactively checks raw URLs for malicious intent before the user clicks:
- **Typosquatting Check:** Calculates Levenshtein distance against known safe brands (e.g., `paypal.com` vs `paypa1.com`).
- **Domain Analysis:** Flags suspicious Top-Level Domains (TLDs) often used by threat actors.
- **Entropy Calculation:** Identifies randomly generated or highly obfuscated URLs indicative of malware hosting.

### 3. 📄 PDF Document Analysis
Defends against fake offer letters and fraudulent scholarship documents.
- Extracts text, metadata, and embedded artifacts using `pdfplumber`.
- Scans for known fraudulent signatures, altered creation dates, and suspicious formatting inconsistencies.

### 4. 📸 Image OCR Scanner
Many scams occur via social media DMs where text cannot be easily copied. 
- Uses robust Optical Character Recognition (`pytesseract` & `OpenCV`) to extract text from screenshots of suspicious conversations.
- Feeds extracted text directly into the NLP engine for threat analysis.

### 5. 🎓 Education & Awareness Hub
Prevention is better than cure. The platform includes an interactive learning center:
- **Daily Wellness Tips:** Bite-sized cybersecurity advice tailored for students.
- **"Spot the Scam" Quizzes:** Gamified learning modules testing users against real-world scam examples.

### 6. 📊 Admin & Analytics Dashboard
For university IT administrators and researchers:
- Real-time threat analytics and scan statistics.
- Interactive charts built with `recharts`.
- Dynamic keyword and threat-signature management.

---

## 🏗️ System Architecture

CyberShield-EDU is engineered with a modern, decoupled frontend-backend architecture to ensure scalability, responsiveness, and clean separation of concerns.

- **Frontend Configuration:** The primary client interface is a premium Vanilla HTML/JS/CSS implementation located in `frontend_vanilla`. It features a sleek, Glassmorphism-inspired UI with full responsive support and a multi-theme system. It communicates securely with the backend via RESTful APIs using Axios. (A legacy React version is also available in `frontend`).
- **Backend Configuration:** A high-performance Python server built on the FastAPI framework. It handles asynchronous requests, orchestrates machine learning inference using Hugging Face Transformers, validates schemas with Pydantic, and generates automated OpenAPI documentation.

For a deep dive, see the [Architecture Overview](./docs/architecture.md).

---

## 🚀 Quick Start Guide

Follow these steps to get a local instance of CyberShield-EDU running on your machine.

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Python 3.8+** (Required for the FastAPI backend and ML models)
- **Node.js 16+** (Required for the React frontend)
- **Git** (For version control)
- **Tesseract OCR engine** (Crucial for the Image Scanner module)

### 2. Setup the Backend Environment
Open your terminal and execute the following:

```bash
# Navigate to the backend directory
cd backend

# Create a localized Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install all required Python dependencies
pip install -r requirements.txt

# Start the FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```
*The API will be live at `http://localhost:8080` and interactive API docs at `http://localhost:8080/docs`.*

### 3. Setup the Frontend Environment
Open a **new** terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```
*The Dashboard interface will be accessible in your browser at `http://localhost:5173`.*

---

## � Project Structure

```text
CyberShield-EDU/
├── backend/                  # FastAPI Python Server & ML Logic
│   ├── app/                  # Main application code (routes, models, utils)
│   ├── venv/                 # Local Python environment
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React 18 SPA (Primary Interface)
│   ├── src/                  # React components, pages, and API services
│   └── package.json          # Node dependencies
├── frontend_vanilla/         # Alternative Vanilla JS Implementation
├── docs/                     # Comprehensive Project Documentation
├── data/                     # Static JSON datasets (e.g., educational info)
└── README.md                 # Project Overview (You are here)
```

---

## 🛠️ Technology Stack

CyberShield-EDU leverages industry-standard open-source technologies:

### Client-Side (Frontend)
- **Primary:** React 18, Vite, Tailwind CSS, Framer Motion (Animations), Recharts (Data Viz), Axios, React Router API.
- **Alternative:** Vanilla JavaScript, HTML5, CSS3.

### Server-Side (Backend)
- **Framework:** Python 3, FastAPI, Pydantic, Uvicorn.
- **AI & Data Processing Engine:**
  - Hugging Face Transformers (`DistilBERT` sequence classification)
  - PyTorch (Tensor operations)
  - `pdfplumber` (Document parsing)
  - `OpenCV` (`cv2`) & `Pillow` (Image manipulation)
  - `pytesseract` (Optical Character Recognition)

---

## 📚 Detailed Documentation

Expand your knowledge regarding the platform's inner workings by exploring the `/docs` directory:

- 📖 **[Setup & Installation Guide](./docs/setup_guide.md)**: Deep dive into environment variables and troubleshooting.
- 🏗️ **[Architecture Overview](./docs/architecture.md)**: Explore the Mermaid diagrams and system design principles.
- 🔌 **[API Documentation](./docs/api_documentation.md)**: A complete reference for the RESTful endpoints available.

---

## 📄 License & Disclaimer

This software is distributed under the [MIT License](LICENSE).

**Disclaimer:** *CyberShield-EDU is developed purely for educational purposes to enhance cybersecurity awareness among student populations. It does not replace professional anti-virus or endpoint protection software. The creators assume no liability for any reliance on this tool.*
