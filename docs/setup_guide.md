# Application Setup Guide

This guide details the steps required to set up the CyberShield-EDU project locally.

## 1. System Requirements
- **Python 3.8 or higher** (Backend and AI Models)
- **Node.js 16 or higher** (Frontend React App)
- **Tesseract OCR** (Required for Image Scanning)

## 2. Installing Tesseract OCR (Phase 6 Requirement)
The Image/Screenshot analysis module uses `pytesseract`. The underlying OCR engine must be installed on your operating system.

### Windows
1. Download the Windows installer from [UB-Mannheim Tesseract Wiki](https://github.com/UB-Mannheim/tesseract/wiki).
2. Run the installer. Leave the default installation path (`C:\Program Files\Tesseract-OCR`).
3. **Environment Variable**: You must add `C:\Program Files\Tesseract-OCR` to your System's `PATH` environment variable.
4. Restart your terminal or command prompt.

### macOS
```bash
brew install tesseract
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install tesseract-ocr
```

## 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   - Create a `.env` file in the `backend/` directory.
   - Example configuration:
     ```env
     APP_NAME="CyberShield EDU API"
     SECRET_KEY="your-super-secret-key"
     DEBUG=True
     ALLOWED_ORIGINS="*"
     ```
5. Run the Server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
   ```
   *Note: Upon first launch, the `transformers` library will download the DistilBERT model. This may take a few minutes depending on your internet connection.*

## 4. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Configure API Connection:
   - Ensure the `API_BASE_URL` in `frontend/src/services/api.js` points to your running backend (e.g., `http://localhost:8080/api/v1`).
4. Run the Development Server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.
