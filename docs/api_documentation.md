# API Documentation

The CyberShield-EDU backend runs on FastAPI. Core detection routes are prefixed with `/api/v1/detect`. Administrative and data routes have their respective prefixes.

## 🔓 Authentication Endpoints
Secure access control for student and admin sessions.

### 1. User Registration
**Endpoint:** `POST /auth/register`
**Request Body:**
```json
{
  "username": "student_jdoe",
  "email": "jdoe@university.edu",
  "password": "securepassword123"
}
```
**Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "user": { "id": 4, "username": "student_jdoe", "role": "student" }
}
```

### 2. User Login
**Endpoint:** `POST /auth/login`
**Request Body (Form Data):**
`username=student_jdoe&password=securepassword123`
**Response (200 OK):**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "user": { "username": "student_jdoe", "role": "student", "xp": 150, "level": 2 }
}
```

---

## 🎮 Gamification & Progress
Endpoints for tracking student security mastery.

### 3. Get Student Profile
**Endpoint:** `GET /gamification/profile`
**Headers:** `Authorization: Bearer <token>`
**Response (200 OK):**
```json
{
  "username": "student_jdoe",
  "email": "jdoe@university.edu",
  "xp": 340,
  "level": 4,
  "rank": "Forensic Guardian",
  "badges": ["First Response", "Phishing Hunter"],
  "stats": {
    "total_scans": 15,
    "url_scans": 10,
    "image_scans": 3,
    "pdf_scans": 2
  },
  "next_level_xp": 400,
  "progress_percent": 85.0
}
```

### 4. Complete Module
**Endpoint:** `POST /gamification/complete`
**Request Body:** `{"module_id": "scam-0"}`
**Response:**
```json
{
  "xp_gained": 30,
  "new_total_xp": 370,
  "level_up": false
}
```

---

## 🔍 Detection Endpoints
ML-powered analysis for disparate threat vectors.

### 5. Analyze Text
**Endpoint:** `POST /api/v1/detect/text`
**Description:** Analyzes messages for scam patterns using Multilingual DistilBERT.
**Request Body:** `{"text": "Your account is locked. Click here..."}`
**Response:**
```json
{
  "prediction": "scam",
  "confidence": 0.98,
  "reasoning": ["Detected high urgency language", "Suspicious URL"]
}
```### 6. Forensic Image Audit
**Endpoint:** `POST /api/v1/detect/image`
**Description:** Performs deep forensic analysis on screenshots or photo evidence.
**Form Data:** `file` (Image binary)
**Response (200 OK):**
```json
{
  "prediction": "scam",
  "confidence": 0.92,
  "reasoning": ["AI Texture detected (Suspiciously Smooth)", "WhatsApp origin identified"],
  "forensic_report": {
    "integrity_score": 42.5,
    "metadata_trust": "low",
    "texture_analysis": "Suspiciously Smooth",
    "is_synthetic": true
  },
  "url_analysis": [
    { "url": "http://scam-link.tk", "prediction": "scam", "score": 0.98 }
  ]
}
```



---

## 🎓 Awareness Hub Endpoints

### 7. Get Educational Content
**Endpoint:** `GET /awareness`
**Description:** Returns dynamic modules, wellness tips, and quiz questions from the database.
**Response:**
```json
{
  "modules": [
    {
      "id": 1,
      "title": "Internship Scams",
      "category": "Threat Type",
      "difficulty": "Beginner",
      "path_id": "scam-0",
      "examples": [...]
    }
  ],
  "wellness_tips": [...],
  "quiz_questions": [...]
}
```

---

## 🔌 Public Developer API
Requires an `X-API-Key` for external integration.

### 8. Public Detect
**Endpoint:** `POST /api/v1/public/detect/text`
**Headers:** `X-API-Key: YOUR_KEY`
**Sandbox:** `X-Sandbox: true` to bypass quota for testing.

---

## 📊 Admin Endpoints

### 9. System Analytics
**Endpoint:** `GET /api/v1/admin/stats`
**Description:** Real-time metrics for total scans, threat detection rates, and user engagement.

### 10. Keyword Management
**Endpoint:** `POST /api/v1/admin/keywords`
**Description:** Dynamically add or remove keywords from the heuristic engine.
