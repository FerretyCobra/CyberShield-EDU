# API Documentation

The CyberShield-EDU backend runs on FastAPI. All core detection routes are prefixed with `/api/v1/detect`. Administrative and data routes have their respective prefixes.

## Detection Endpoints

All detection endpoints return a consistent JSON structure containing a `prediction` (`scam` or `safe`) and a `confidence` score (float between 0 and 1).

### 1. Analyze Text
**Endpoint:** `POST /api/v1/detect/text`
**Description:** Analyzes a text message for scam patterns using DistilBERT.
**Request Body (JSON):**
```json
{
  "text": "Your account is locked. Click here to verify: http://scam.link"
}
```
**Response (200 OK):**
```json
{
  "prediction": "scam",
  "confidence": 0.98,
  "reasoning": [
    "Detected high urgency language.",
    "Contains suspicious URL link."
  ]
}
```

### 2. Analyze URL
**Endpoint:** `POST /api/v1/detect/url`
**Description:** Evaluates a URL for phishing characteristics (typosquatting, high entropy, malicious TLDs).
**Request Body (JSON):**
```json
{
  "url": "http://paypal-support-update-secure.com"
}
```
**Response (200 OK):**
```json
{
  "prediction": "scam",
  "confidence": 0.85,
  "reasoning": [
    "Detected common brand keyword in domain.",
    "Subdomain count is suspiciously high."
  ]
}
```

### 3. Analyze PDF
**Endpoint:** `POST /api/v1/detect/pdf`
**Description:** Extracts text and metadata from a PDF file to check for fraudulent job/scholarship offers.
**Request Headers:** `Content-Type: multipart/form-data`
**Request Body:**
- `file`: The PDF file upload.
**Response (200 OK):**
```json
{
  "prediction": "scam",
  "confidence": 0.92,
  "reasoning": [
    "Contains request for personal bank details.",
    "Poor grammar and spelling detected in text."
  ]
}
```

### 4. Analyze Image (OCR)
**Endpoint:** `POST /api/v1/detect/image`
**Description:** Uses Tesseract OCR to read text from image screenshots and runs it through the Text Detection engine.
**Request Headers:** `Content-Type: multipart/form-data`
**Request Body:**
- `file`: The Image file upload (PNG/JPG).
**Response (200 OK):**
```json
{
  "prediction": "safe",
  "confidence": 0.99,
  "reasoning": [],
  "extracted_text": "Hey Mom, just letting you know I made it to campus safely!"
}
```

## Educational Endpoints

### 5. Get Awareness Content
**Endpoint:** `GET /awareness`
**Description:** Retrieves static educational content, wellness tips, and quiz questions.
**Response (200 OK):**
```json
{
  "tips": [...],
  "wellness": [...],
  "quiz": [...]
}
```

## Admin Endpoints

### 6. Get System Stats
**Endpoint:** `GET /api/v1/admin/stats`
**Description:** Returns current system usage statistics.

### 7. Manage Keywords
**Endpoint (GET):** `GET /api/v1/admin/keywords`
Returns the current list of keywords used across all detection heuristics.

**Endpoint (POST):** `POST /api/v1/admin/keywords`
Updates the global scam keyword list.
**Request Body:**
```json
{
  "keywords": ["urgent", "verify", "password", "crypto"]
}
```
