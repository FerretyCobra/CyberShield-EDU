# API Documentation — CyberShield-EDU

> Complete, in-depth reference for every RESTful API endpoint exposed by the CyberShield-EDU FastAPI backend. This document covers request/response schemas, authentication requirements, rate limiting policies, error codes, and integration examples.

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication & Session Management](#2-authentication--session-management)
3. [Detection Endpoints](#3-detection-endpoints)
4. [Background Task Endpoints](#4-background-task-endpoints)
5. [Gamification & Progress Endpoints](#5-gamification--progress-endpoints)
6. [Awareness & Education Endpoints](#6-awareness--education-endpoints)
7. [Community Reporting Endpoints](#7-community-reporting-endpoints)
8. [Administrative Endpoints](#8-administrative-endpoints)
9. [Public Developer API](#9-public-developer-api)
10. [Error Handling & Response Codes](#10-error-handling--response-codes)

---

## 1. API Overview

### 1.1. Base URL
```
http://localhost:8000
```

### 1.2. API Versioning
All core endpoints are versioned under the `/api/v1/` prefix. The awareness content endpoint is served from the root (`/awareness`) for public accessibility.

### 1.3. Content Types
- **Request:** `application/json` for text/URL analysis, `multipart/form-data` for file uploads, `application/x-www-form-urlencoded` for OAuth2 login
- **Response:** All responses are `application/json`

### 1.4. Authentication
Protected endpoints require a JWT Bearer token in the `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Tokens expire after 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).

### 1.5. Rate Limiting
Detection endpoints are rate-limited to **5 requests per minute per IP address** using SlowAPI. When the limit is exceeded, the API returns:
```json
{
    "error": "Rate limit exceeded",
    "detail": "5 per 1 minute"
}
```
**HTTP Status:** `429 Too Many Requests`

### 1.6. Interactive Documentation
FastAPI automatically generates interactive documentation:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI JSON:** `http://localhost:8000/api/v1/openapi.json`

---

## 2. Authentication & Session Management

### 2.1. User Registration

Creates a new student account with hashed password storage.

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/auth/register` |
| **Auth Required** | No |
| **Rate Limit** | None |
| **Content-Type** | `application/json` |

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
    "user": {
        "id": 4,
        "username": "student_jdoe",
        "role": "student"
    }
}
```

**Error Responses:**
| Status | Condition | Detail |
|:---|:---|:---|
| 400 | Username already exists | `"Username already registered"` |
| 400 | Email already exists | `"Email already registered"` |

**Implementation Notes:**
- Passwords are hashed using PBKDF2-SHA256 via `passlib.CryptContext`
- New users are assigned `role: "student"`, `xp: 0`, `level: 1`, and `badges: []`
- The username and email fields have UNIQUE constraints in the database

---

### 2.2. User Login

Authenticates a user and returns a JWT access token with user profile data.

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Auth Required** | No |
| **Content-Type** | `application/x-www-form-urlencoded` |

**Request Body (Form Data):**
```
username=student_jdoe&password=securepassword123
```

**Response (200 OK):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
        "username": "student_jdoe",
        "role": "student",
        "xp": 150,
        "level": 2
    }
}
```

**JWT Payload Structure:**
```json
{
    "sub": "student_jdoe",
    "role": "student",
    "id": 4,
    "exp": 1744393200
}
```

**Error Responses:**
| Status | Condition | Detail |
|:---|:---|:---|
| 401 | Invalid credentials | `"Incorrect username or password"` |

**Implementation Notes:**
- Uses OAuth2-compatible form data encoding (NOT JSON)
- The JWT is signed with HS256 algorithm using the `SECRET_KEY` from environment
- Token expires after 30 minutes
- The `user` object in the response includes current XP and level for immediate UI display

---

### 2.3. Get Current User Profile

Returns the authenticated user's complete profile data.

| Property | Value |
|:---|:---|
| **Endpoint** | `GET /api/v1/auth/me` |
| **Auth Required** | Yes (Bearer Token) |

**Response (200 OK):**
```json
{
    "id": 4,
    "username": "student_jdoe",
    "email": "jdoe@university.edu",
    "role": "student",
    "xp": 340,
    "level": 4,
    "badges": ["First Response", "Phishing Hunter"]
}
```

---

## 3. Detection Endpoints

### 3.1. Analyze Text (NLP Scam Detection)

Analyzes free-text messages using Multilingual DistilBERT AI, dynamic pattern matching, company impersonation detection, and context-aware social engineering conflict analysis.

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/detect/text` |
| **Auth Required** | Optional (XP awarded if authenticated) |
| **Rate Limit** | 5 requests/minute |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
    "text": "URGENT: Your account is locked. Click http://paypa1-security.com to verify your identity immediately."
}
```

**Response (200 OK) — Scam Detected:**
```json
{
    "prediction": "scam",
    "confidence": 0.97,
    "reasoning": [
        "AI Model: Detected scam intent with 95.2% confidence",
        "Detected Urgency/Pressure language",
        "Context Alert: Detected social engineering pattern",
        "Matched 2 threat patterns in database",
        "⚠️ Impersonation Alert: Text mentions 'PayPal' but link goes to 'paypa1-security.com'"
    ],
    "highlights": [
        "Pattern Hit: 'urgent' → Direct monetary pressure language (Risk: 0.2)"
    ],
    "score_explanation": {
        "ai_analysis": 38.1,
        "patterns": 12.0,
        "impersonation": 35.0,
        "context": 20.0
    },
    "metadata": {
        "has_link": true,
        "has_phone": false
    },
    "insights": {
        "sentiment": "Urgency/Pressure",
        "complexity": "Medium (Standard)",
        "is_context_flagged": true,
        "impersonated_brand": "PayPal"
    },
    "recommendation": "⚠️ Multiple Threat Signals Detected — Do not interact, block the sender."
}
```

**Response (200 OK) — Safe Content:**
```json
{
    "prediction": "safe",
    "confidence": 0.12,
    "reasoning": ["AI model found no significant threat indicators."],
    "highlights": [],
    "score_explanation": {
        "ai_analysis": 0.0,
        "patterns": 0.0,
        "impersonation": 0.0,
        "context": 0.0
    },
    "metadata": {
        "has_link": false,
        "has_phone": false
    },
    "insights": {
        "sentiment": "None",
        "complexity": "Medium (Standard)",
        "is_context_flagged": false,
        "impersonated_brand": null
    },
    "recommendation": "This message appears safe. Standard precautions apply."
}
```

**Analysis Pipeline (Internal):**
1. Input sanitization (HTML stripping, length capping at 3000 chars)
2. Text preprocessing (Unicode normalization, whitespace consolidation)
3. DistilBERT model inference → classification + confidence
4. Dynamic Pattern Engine keyword/regex matching
5. AI sentiment classification (Urgency, Reward, Suspicious)
6. Company impersonation check (brand name vs. link domain)
7. Context conflict detection (role-action social engineering matrix)
8. Linguistic complexity analysis
9. Score aggregation and decision

**XP Award:** +10 XP for authenticated users (persisted via GamificationService)

---

### 3.2. Analyze URL (Phishing Scanner)

Performs deep 9-layer heuristic analysis, external threat intelligence lookup, redirect chain tracking, GeoIP forensics, and AI-powered webpage content scanning.

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/detect/url` |
| **Auth Required** | Optional (XP awarded if authenticated) |
| **Rate Limit** | 5 requests/minute |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
    "url": "http://paypa1-security.com/login"
}
```

**Response (200 OK) — Scam URL:**
```json
{
    "prediction": "scam",
    "confidence": 0.96,
    "scam_score": 0.91,
    "reasoning": [
        "Typosquatting Detected: 'paypa1' closely resembles 'paypal' (Distance: 1)",
        "⚡ Homoglyph Alert: Foreign characters detected mimicking Latin script",
        "Insecure Protocol: HTTP connection without TLS encryption",
        "Suspicious Path Keywords: '/login' detected in URL path",
        "DEEP SCAN: AI detected scam content on the target page (Confidence: 0.89)"
    ],
    "score_explanation": {
        "protocol": 10,
        "obfuscation": 0,
        "typosquatting": 40,
        "entropy": 0,
        "homoglyph": 60,
        "ip_masking": 0,
        "subdomains": 0,
        "external_intel": 0,
        "redirect_risk": 0,
        "redirect_chain": 0,
        "content_ai": 50,
        "patterns": 15
    },
    "forensics": {
        "geo": {
            "country": "Unknown",
            "city": "Unknown",
            "isp": "Unknown",
            "asn": "Unknown",
            "flag": "🏴"
        },
        "trust": {
            "is_trusted_tld": false,
            "is_verified_provider": false,
            "shield_badge": null
        }
    },
    "metadata": {
        "domain": "paypa1-security.com",
        "tld": ".com",
        "entropy": 3.21,
        "has_ip": false,
        "subdomain_count": 1,
        "is_shortened": false,
        "redirect_chain": ["http://paypa1-security.com/login"]
    }
}
```

**Nine Heuristic Analysis Layers:**
| Layer | Check | Risk Penalty |
|:---|:---|:---|
| 1 | Dynamic Pattern Engine (TLD, domain, path keywords) | Variable |
| 2 | Protocol (HTTP vs HTTPS) | +0.10 |
| 3 | URL Shortener detection | +0.20 |
| 4 | Typosquatting (Levenshtein distance ≤ 2) | +0.40 |
| 5 | Shannon Entropy (DGA detection, > 4.0) | +0.25 |
| 6 | Homoglyph attacks (Cyrillic character substitution) | +0.60 |
| 7 | IP address masking | +0.50 |
| 8 | Subdomain abuse (> 4 levels) | +0.30 |
| 9 | Deep Scan (webpage content AI analysis) | +0.50 |

**XP Award:** +15 XP for authenticated users

---

### 3.3. Analyze PDF (Forensic Document Audit)

Performs comprehensive forensic PDF analysis including metadata inspection, encryption detection, digital signature verification, content AI analysis, and recursive scanning of all embedded URLs including hidden annotation-based "ghost links."

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/detect/pdf` |
| **Auth Required** | Optional |
| **Rate Limit** | 5 requests/minute |
| **Content-Type** | `multipart/form-data` |
| **Processing** | Asynchronous (background Celery task) |

**Request:** File upload with field name `file`

**Response (202 Accepted):**
```json
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "message": "PDF forensic analysis started in background. Poll /tasks/status/{task_id} for results."
}
```

**Final Result (via task polling):**
```json
{
    "prediction": "scam",
    "confidence": 0.85,
    "scam_score": 0.78,
    "reasoning": [
        "⚠️ Document is encrypted/password-protected — potential evasion tactic",
        "Suspicious Author: Generic 'admin' detected — not a verified entity",
        "❌ No digital signature found — official offer letters should be signed",
        "AI Content Analysis: Detected scam language in document (Confidence: 0.92)",
        "Keyword Hit: 'registration fee' detected in document text",
        "🔗 2 embedded URLs analyzed — 1 flagged as scam",
        "👻 Ghost Link Found: Hidden annotation URI not visible in document text"
    ],
    "score_explanation": {
        "encryption": 15,
        "metadata": 10,
        "signature": 5,
        "ai_content": 40,
        "keywords": 20,
        "url_analysis": 35,
        "ghost_links": 15,
        "structure": 5
    },
    "metadata": {
        "author": "admin",
        "creator": "Microsoft Word",
        "producer": "macOS Quartz PDFContext",
        "page_count": 2,
        "is_encrypted": true,
        "has_signature": false
    },
    "url_analysis": [
        {
            "url": "http://fake-internship.xyz/apply",
            "prediction": "scam",
            "scam_score": 0.94
        }
    ]
}
```

**Analysis Pipeline:**
1. Encryption/password protection detection
2. Metadata inspection (author, creator, producer)
3. Author trust verification against Verified Providers database
4. Digital signature detection (`/Sig` and `/ByteRange` markers)
5. Full text extraction and AI NLP scam analysis
6. Keyword scanning against scam keyword library
7. Visible URL extraction (regex) and ghost URL extraction (PDF annotations)
8. Recursive URL analysis via URLDetectorService (up to 10 URLs, parallel)
9. Structural anomaly checks (page count, content length)

---

### 3.4. Analyze Image (Forensic Image Audit)

Performs deep forensic analysis on uploaded images including OCR text extraction, EXIF metadata auditing for AI generation signatures, Laplacian Variance texture analysis for synthetic image detection, platform identification, and QR code scanning.

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/detect/image` |
| **Auth Required** | Optional |
| **Rate Limit** | 5 requests/minute |
| **Content-Type** | `multipart/form-data` |
| **Accepted Formats** | `.jpg`, `.jpeg`, `.png`, `.bmp` |

**Request:** File upload with field name `file`

**Response (200 OK):**
```json
{
    "prediction": "scam",
    "confidence": 0.92,
    "reasoning": [
        "AI Texture detected (Suspiciously Smooth — Variance: 85.3)",
        "WhatsApp platform origin identified",
        "OCR Content Analysis: Scam language detected in extracted text",
        "EXIF Software: 'Stable Diffusion' detected — potential AI-generated image"
    ],
    "score_explanation": {
        "ocr_content": 40,
        "url_analysis": 0,
        "texture_integrity": 30,
        "metadata_trust": 20,
        "ai_signature": 25
    },
    "forensic_report": {
        "integrity_score": 42.5,
        "metadata_trust": "low",
        "texture_analysis": "Suspiciously Smooth",
        "texture_variance": 85.3,
        "is_synthetic": true,
        "ai_tool_detected": "Stable Diffusion",
        "platform_detected": "WhatsApp"
    },
    "url_analysis": [
        {
            "url": "http://scam-link.tk/claim",
            "prediction": "scam",
            "score": 0.98
        }
    ]
}
```

**Analysis Pipeline:**
1. Image loading in dual format (OpenCV NumPy array + PIL Image)
2. Tesseract OCR text extraction with advanced preprocessing
3. Platform identification (WhatsApp, Telegram, Email pattern matching)
4. AI content analysis on extracted text via TextDetectorService
5. URL extraction from OCR text → URLDetectorService analysis
6. QR code detection and decoding → URL analysis if found
7. EXIF metadata extraction → AI tool signature detection
8. Laplacian Variance texture analysis → Synthetic smoothing detection
9. Weighted integrity score calculation (40% metadata + 40% texture + 20% AI)

---

### 3.5. Get Scan History

Returns the complete scan history for the authenticated user, ordered by most recent first.

| Property | Value |
|:---|:---|
| **Endpoint** | `GET /api/v1/detect/history` |
| **Auth Required** | Yes (Bearer Token) |

**Response (200 OK):**
```json
[
    {
        "id": 42,
        "scan_type": "text",
        "input_data": "URGENT: Pay registration...",
        "prediction": "scam",
        "confidence": 0.95,
        "reasoning": ["AI Model: Detected scam intent..."],
        "created_at": "2026-04-11T14:30:00"
    },
    {
        "id": 41,
        "scan_type": "url",
        "input_data": "http://paypa1.com",
        "prediction": "scam",
        "confidence": 0.96,
        "reasoning": ["Typosquatting Detected..."],
        "created_at": "2026-04-11T14:25:00"
    }
]
```

---

## 4. Background Task Endpoints

### 4.1. Get Task Status

Polls the status of an asynchronous background task (used for PDF and Image analysis).

| Property | Value |
|:---|:---|
| **Endpoint** | `GET /api/v1/tasks/status/{task_id}` |
| **Auth Required** | No |

**Response (Task Pending/Running):**
```json
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING"
}
```

**Response (Task Completed):**
```json
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "SUCCESS",
    "result": {
        "prediction": "scam",
        "confidence": 0.85,
        "reasoning": [...],
        "metadata": {...}
    }
}
```

**Response (Task Failed):**
```json
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "FAILURE",
    "error": "PDF parsing failed: file is corrupted"
}
```

**Polling Strategy:** The frontend polls every 2 seconds using `tasksApi.pollUntilFinished(taskId, 2000)` which implements a recursive promise-based polling loop that resolves on SUCCESS and rejects on FAILURE.

---

## 5. Gamification & Progress Endpoints

### 5.1. Get Student Profile (Academy Dossier)

Returns the comprehensive gamification profile including XP, level, rank title, earned badges, scan statistics by type, and level progress percentage.

| Property | Value |
|:---|:---|
| **Endpoint** | `GET /api/v1/gamification/profile` |
| **Auth Required** | Yes (Bearer Token) |

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
        "total_scans": 25,
        "url_scans": 12,
        "image_scans": 8,
        "pdf_scans": 5
    },
    "next_level_xp": 400,
    "progress_percent": 85.0
}
```

**Level Calculation:** `level = (xp // 100) + 1`

**Rank Hierarchy:**
| Level | Rank |
|:---|:---|
| 1-2 | Cyber Scout |
| 3-5 | Forensic Guardian |
| 6-10 | Cyber Sentinel |
| 11+ | Grand Protector |

**Badge Milestones:**
| Badge | Condition |
|:---|:---|
| First Response | First scan of any type |
| Phishing Hunter | 10 URL scans completed |

---

## 6. Awareness & Education Endpoints

### 6.1. Get Quiz Questions

Returns a randomized set of quiz questions from the forensic library.

| Property | Value |
|:---|:---|
| **Endpoint** | `GET /api/v1/awareness/questions?limit=5` |
| **Auth Required** | No |

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "content": "You receive a WhatsApp message from a 'HR Manager' offering a remote internship at Google with a salary of 50,000 INR/month. They ask you to pay 500 INR for processing.",
        "content_type": "text",
        "is_scam": true,
        "explanation": "Legitimate companies like Google never use WhatsApp for first-contact recruitment and NEVER ask for money."
    }
]
```

### 6.2. Submit Quiz Completion

Records quiz completion and awards XP to the authenticated user.

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/awareness/submit` |
| **Auth Required** | Yes (Bearer Token) |

**Response (200 OK):**
```json
{
    "message": "Quiz completed, XP awarded!",
    "xp_gained": 50
}
```

### 6.3. Award Educational XP

Awards XP for completing educational modules, simulations, and interactive scenarios. Includes an anti-abuse cap of 150 XP per request.

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/awareness/reward` |
| **Auth Required** | Yes (Bearer Token) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
    "xp_amount": 30,
    "reason": "Completed Internship Scam Awareness Module"
}
```

**Response (200 OK):**
```json
{
    "status": "success",
    "xp_gained": 30,
    "total_xp": 370,
    "current_level": 4,
    "reason": "Completed Internship Scam Awareness Module"
}
```

**Error Responses:**
| Status | Condition |
|:---|:---|
| 400 | `xp_amount > 150` — "Reward amount exceeds forensic ceiling" |
| 401 | Not authenticated |
| 404 | User account not found |

---

## 7. Community Reporting Endpoints

### 7.1. Submit Scam Report

Allows users to submit reports about newly discovered scam campaigns, including optional evidence file uploads. Supports anonymous reporting.

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/report/reports` |
| **Auth Required** | No |
| **Rate Limit** | 3 requests/minute |
| **Content-Type** | `multipart/form-data` |

**Request (Form Data):**
| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `company_name` | string | Yes | Name of the fraudulent entity |
| `description` | string | Yes | Description of the scam |
| `is_anonymous` | boolean | No (default: true) | Anonymous submission flag |
| `evidence` | file | No | Evidence screenshot/document |

**Response (200 OK):**
```json
{
    "status": "success",
    "message": "Scam report submitted successfully",
    "report_id": 15
}
```

**Implementation Notes:**
- Evidence files are stored in `uploads/reports/` with timestamped filenames
- If file upload succeeds but database save fails, the uploaded file is cleaned up
- Reports are created with `status: "pending"` for admin review

### 7.2. Get Recent Reports

Returns the 5 most recent scam reports for the community ticker.

| Property | Value |
|:---|:---|
| **Endpoint** | `GET /api/v1/report/recent` |
| **Auth Required** | No |

**Response (200 OK):**
```json
[
    {
        "company_name": "FakeTech Solutions",
        "description": "They contacted me on WhatsApp about a data entry job..."
    }
]
```

---

## 8. Administrative Endpoints

> **All admin endpoints require the `admin` role.** Requests from non-admin users receive `403 Forbidden`.

### 8.1. System Statistics

Returns real-time platform analytics including scan volumes, threat detection rates, and category distribution.

| Property | Value |
|:---|:---|
| **Endpoint** | `GET /api/v1/admin/system/stats` |
| **Auth Required** | Yes (Admin Only) |

**Response (200 OK):**
```json
{
    "total_scans": 1250,
    "scams_detected": 487,
    "detection_rate": "38.9%",
    "active_models": 4,
    "active_rules": 42,
    "system_status": "operational",
    "categories": {
        "Academic": 120,
        "Financial": 85,
        "Urgency": 150
    }
}
```

### 8.2. Security Thresholds (Dynamic Sensitivity)

Retrieve or update the system-wide scoring thresholds for safe, suspicious, and scam classifications.

| Property | Value |
|:---|:---|
| **Endpoint** | `GET/PUT /api/v1/admin/config/thresholds` |
| **Auth Required** | Yes (Admin Only) |

**Update Request (PUT):**
```json
{
    "low_threshold": 0.35,
    "high_threshold": 0.75
}
```

**Response (200 OK):**
```json
{
    "status": "success",
    "updated": {
        "low": 0.35,
        "high": 0.75
    }
}
```

### 8.3. Keyword Management (Pillar 2)
        {"date": "2026-04-06", "count": 62},
        {"date": "2026-04-07", "count": 58}
    ],
    "distribution": {
        "text": 520,
        "url": 410,
        "pdf": 180,
        "image": 140
    }
}
```

### 8.2. List Threat Patterns

| Property | Value |
|:---|:---|
| **Endpoint** | `GET /api/v1/admin/patterns` |
| **Auth Required** | Yes (Admin Only) |

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "pattern_type": "keyword",
        "value": "registration fee",
        "risk_score": 0.2,
        "description": "Direct monetary pressure language",
        "is_active": true
    },
    {
        "id": 5,
        "pattern_type": "tld",
        "value": ".xyz",
        "risk_score": 0.15,
        "description": "High-risk TLD associated with phishing",
        "is_active": true
    }
]
```

### 8.3. Create Threat Pattern

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/admin/patterns` |
| **Auth Required** | Yes (Admin Only) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
    "pattern_type": "regex",
    "value": "\\b(pay|send)\\s+(now|immediately|today)\\b",
    "risk_score": 0.3,
    "description": "Urgency-based payment language"
}
```

**Implementation Note:** After creation, the Pattern Engine's in-memory cache is immediately reloaded via `pattern_service.load_from_db(db)`, making the new pattern active for all subsequent analyses without restart.

### 8.4. List/Add Scam Keywords

| **List Keywords** | `GET /api/v1/admin/keywords` |
|:---|:---|
| **Add Keyword** | `POST /api/v1/admin/keywords` |

**Add Request:** `{"keyword": "processing charge"}`

---

## 9. Public Developer API

External applications can integrate CyberShield detection via API keys.

### 9.1. Authentication

All requests must include an `X-API-Key` header:
```
X-API-Key: cs_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Sandbox Mode:** Add `X-Sandbox: true` header to bypass authentication and receive simulated results (for integration testing).

### 9.2. Public Text Detection

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/public/detect/text` |
| **Auth** | API Key (X-API-Key header) |
| **Rate Limit** | 1,000 requests/day per key |

**Request Body:**
```json
{
    "text": "Alert: Your package requires customs payment..."
}
```

### 9.3. Public URL Detection

| Property | Value |
|:---|:---|
| **Endpoint** | `POST /api/v1/public/detect/url` |
| **Auth** | API Key (X-API-Key header) |
| **Rate Limit** | 1,000 requests/day per key |

**Request Body:**
```json
{
    "url": "http://suspicious-link.xyz"
}
```

---

## 10. Error Handling & Response Codes

### 10.1. Standard HTTP Status Codes

| Status | Meaning | When Used |
|:---|:---|:---|
| 200 | OK | Successful request |
| 202 | Accepted | Background task dispatched (PDF/Image) |
| 400 | Bad Request | Invalid input or exceeded limits |
| 401 | Unauthorized | Missing/invalid JWT token or API key |
| 403 | Forbidden | Insufficient role (non-admin on admin route) |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled server exception |

### 10.2. Error Response Format
All errors follow a consistent JSON structure:
```json
{
    "detail": "Human-readable error message"
}
```

### 10.3. Global Exception Handler
Unhandled exceptions are caught by the global handler in `main.py`, which:
1. Logs the exception with the request path context
2. Returns a generic `500` response without exposing internal stack traces
3. Preserves the error in `logs/app.log` for debugging

---

*This API documentation is auto-supplemented by FastAPI's interactive Swagger UI at `/docs`. For live testing, use the Swagger interface or tools like Postman/cURL.*
