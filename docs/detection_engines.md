# Detection Engines — Technical Deep-Dive

> An exhaustive technical breakdown of every detection engine in CyberShield-EDU, covering algorithms, scoring formulas, threshold constants, worked examples with real math, and internal pipeline architecture. This document is intended for developers, researchers, and technical reviewers who want to understand exactly how each detection decision is made.

---

## Table of Contents

1. [Engine Overview](#1-engine-overview)
2. [Text Detection Engine (Pillar 1)](#2-text-detection-engine-pillar-1)
3. [Pattern Engine (Pillar 2)](#3-pattern-engine-pillar-2)
4. [Shield of Trust Engine (Pillar 3)](#4-shield-of-trust-engine-pillar-3)
5. [URL Detection Engine (Pillar 4)](#5-url-detection-engine-pillar-4)
6. [Image Forensic Engine (Pillar 5)](#6-image-forensic-engine-pillar-5)
7. [PDF Forensic Engine (Pillar 7)](#7-pdf-forensic-engine-pillar-7)
8. [Gamification Engine (Pillar 8)](#8-gamification-engine-pillar-8)
9. [Cross-Engine Orchestration](#9-cross-engine-orchestration)

---

## 1. Engine Overview

CyberShield-EDU employs a **multi-engine, multi-layered** detection architecture where each engine is a standalone service class that can be invoked independently or composed with other engines for cross-vector analysis.

| Engine | File | Lines | Primary Technology | Invocation |
|:---|:---|:---|:---|:---|
| Text Detector | `text_detector.py` | 177 | DistilBERT NLP + Heuristics | Sync (direct call) |
| Pattern Engine | `pattern_service.py` | 160 | Regex + String Matching | Sync (sub-service) |
| Trust Service | `trust_service.py` | 97 | Database Whitelist | Sync (sub-service) |
| URL Detector | `url_detector.py` | 329 | 9-Layer Heuristic + Deep Scan | Async (aiohttp) |
| Image Detector | `image_detector_service.py` | 181 | OpenCV + EXIF + OCR | Async (Celery) |
| Image OCR | `image_ocr.py` | 289 | Tesseract + OpenCV | Sync (sub-service) |
| PDF Analyzer | `pdf_analyzer.py` | 204 | pdfplumber + Recursive URL | Async (Celery) |
| Gamification | `gamification.py` | 98 | Database XP Math | Sync (post-analysis) |

---

## 2. Text Detection Engine (Pillar 1)

**File:** `backend/app/services/text_detector.py`
**Class:** `TextDetectorService`

### 2.1. Pipeline Architecture

```
Input text (up to 3000 chars)
      │
      ▼
┌─────────────────────────────────────────────┐
│ Stage 1: AI Model Inference                  │
│ Model: distilbert-base-multilingual-cased    │
│ Task: text-classification                    │
│ Output: {label, confidence}                  │
│ Threshold: confidence > 0.80 → scam          │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Stage 2: Dynamic Pattern Engine Match        │
│ Source: PatternService (DB-driven rules)      │
│ Check: keyword, regex, TLD matching          │
│ Output: matched_patterns[], highlights[]      │
│ Risk addition: per-pattern risk_score         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Stage 3: AI Sentiment Classification         │
│ Keywords: urgency/pressure vs. reward-based  │
│ Output: sentiment label string               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Stage 4: Company Impersonation Detection     │
│ Source: TrustService.check_impersonation()   │
│ Check: Brand name in text vs. link domain    │
│ Penalty: +0.35 on impersonation match        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Stage 5: Context Conflict Analysis           │
│ Check: Role + Action social engineering      │
│ Penalty: +0.20 per conflict detected         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Stage 6: Multi-Modal Correlation Engine      │
│ Source: CorrelationService                   │
│ Check: Behavioral patterns (Context+Intent)  │
│ Logic: Boosts risk for dangerous combinations │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Stage 7: Decision & Dynamic Thresholding     │
│ Source: SystemConfig (DB-driven limits)      │
│ Threshold: Default: 0.3 (Susp), 0.7 (Scam)  │
│ Output: prediction, confidence, reasoning[]  │
└─────────────────────────────────────────────┘
```

### 2.2. AI Model Details

| Property | Value |
|:---|:---|
| **Model** | `distilbert-base-multilingual-cased` |
| **Parameters** | 66 million |
| **Languages** | 104 (including Hindi, Arabic, Spanish, Mandarin) |
| **Max Input** | 512 tokens (truncated by pipeline) |
| **Task** | `text-classification` |
| **Output Labels** | `LABEL_0` (safe) / `LABEL_1` (scam) |
| **Device Selection** | Auto: GPU (device=0) if CUDA available, else CPU (device=-1) |

**Label Mapping:**
```python
label_map = {
    "LABEL_0": "safe",
    "LABEL_1": "scam"
}
# If using sentiment-analysis pipeline (fallback):
#   "POSITIVE" → "safe"
#   "NEGATIVE" → "scam"
```

### 2.3. Sentiment Classification Logic

The engine classifies text sentiment using keyword-based detection:

```python
URGENCY_KEYWORDS = ["urgent", "immediately", "now", "expire", "last chance",
                     "limited time", "hurry", "deadline", "act now", "warning"]

REWARD_KEYWORDS = ["congratulations", "won", "winner", "selected", "exclusive",
                    "guaranteed", "free", "bonus", "reward", "prize"]

# Logic:
if any(kw in text_lower for kw in URGENCY_KEYWORDS):
    sentiment = "Urgency/Pressure"
elif any(kw in text_lower for kw in REWARD_KEYWORDS):
    sentiment = "Unexpected Reward/Prize"
else:
    sentiment = "None"
```

### 2.4. Context Conflict Detection (Social Engineering Matrix)

This is a **unique innovation** — a role-action conflict matrix that detects social engineering patterns:

**Suspicious Roles:**
```python
ROLES = ["professor", "dean", "registrar", "advisor", "it admin",
         "chancellor", "recruiter", "hr manager", "bank officer"]
```

**Suspicious Actions:**
```python
ACTIONS = ["otp", "password", "credit card", "bank account",
           "social security", "aadhaar", "pin", "transfer funds",
           "gift card", "bitcoin"]
```

**Detection Logic:**
```python
role_found = any(role in text_lower for role in ROLES)
action_found = any(action in text_lower for action in ACTIONS)

if role_found and action_found:
    # Social engineering pattern detected
    confidence += 0.20
    reasoning.append("Context Alert: Authority figure requesting sensitive action")
```

**Example Detection:**
> *"Hi, I'm Dean Williams. Please share your OTP to verify your student account."*
> - Role detected: `"dean"` ✓
> - Action detected: `"otp"` ✓
> → **Context Conflict: "Dean" + "OTP request" = Social Engineering**

### 2.5. Linguistic Complexity Analysis

Text complexity is measured by average word length:
```python
avg_word_length = sum(len(w) for w in words) / len(words)

if avg_word_length > 6:
    complexity = "High (Formal)"
elif avg_word_length > 4:
    complexity = "Medium (Standard)"
else:
    complexity = "Low (Casual)"
```

### 2.6. Score Explanation Breakdown

The `score_explanation` object decomposes the final score into component contributions:

```python
score_explanation = {
    "ai_analysis":    ai_confidence * 40,  # Max 40 points
    "patterns":       pattern_score * 60,  # Max 60 points (12 per pattern)
    "impersonation":  35 if impersonation_detected else 0,  # Binary 35 points
    "context":        20 if context_conflict else 0  # Binary 20 points
}
```

---

## 3. Pattern Engine (Pillar 2)

**File:** `backend/app/services/pattern_service.py`
**Class:** `PatternService`

### 3.1. Architecture

```
Database (threat_patterns table)
       │
       ▼  (Loaded on first call, cached in memory)
┌──────────────────────────────────┐
│ In-Memory Cache                   │
│ ┌──────────────────────────────┐ │
│ │ keywords: [{value, risk}]    │ │
│ │ regexes:  [{compiled, risk}] │ │
│ │ tlds:     [{value, risk}]    │ │
│ │ domains:  [{value, risk}]    │ │
│ └──────────────────────────────┘ │
│                                   │
│ Fallback: Config defaults if      │
│ DB empty or unavailable           │
└──────────────────────────────────┘
```

### 3.2. Pattern Matching Algorithms

**Keyword Matching:**
```python
for pattern in self.keyword_patterns:
    if pattern["value"].lower() in text.lower():
        hits.append(pattern)
        total_risk += pattern["risk_score"]
```

**Regex Matching:**
```python
for pattern in self.regex_patterns:
    compiled = re.compile(pattern["value"], re.IGNORECASE)
    if compiled.search(text):
        hits.append(pattern)
        total_risk += pattern["risk_score"]
```

**TLD Matching (URL-specific):**
```python
parsed = urlparse(url)
domain = parsed.netloc
for pattern in self.tld_patterns:
    if domain.endswith(pattern["value"]):
        hits.append(pattern)
        total_risk += pattern["risk_score"]
```

**URL Path Keyword Scanning (Bait Shield):**
```python
path = parsed.path.lower()
BAIT_KEYWORDS = ["login", "verify", "secure", "account", "update", "banking",
                  "internship", "job", "career", "scholarship", "free", "pay"]
for kw in BAIT_KEYWORDS:
    if kw in path:
        reasoning.append(f"Suspicious Path Keyword: '/{kw}' in URL path")
        risk += 0.15
```

### 3.3. Cache Management

```python
def load_from_db(self, db):
    """Load ALL active patterns from database into memory cache."""
    patterns = db.query(ThreatPattern).filter(
        ThreatPattern.is_active == True
    ).all()

    self.keyword_patterns = [p for p in patterns if p.pattern_type == "keyword"]
    self.regex_patterns = [p for p in patterns if p.pattern_type == "regex"]
    self.tld_patterns = [p for p in patterns if p.pattern_type == "tld"]
    self.domain_patterns = [p for p in patterns if p.pattern_type == "domain"]
    self._loaded = True
```

**Cache Invalidation:** After any admin CRUD operation on patterns, `pattern_service.load_from_db(db)` is called immediately, refreshing the in-memory cache.

---

## 4. Shield of Trust Engine (Pillar 3)

**File:** `backend/app/services/trust_service.py`
**Class:** `TrustService`

### 4.1. Whitelist Verification

```python
def check_domain(self, url: str, db) -> dict:
    domain = urlparse(url).netloc.lower()
    root_domain = ".".join(domain.split(".")[-2:])  # e.g., google.com

    provider = db.query(VerifiedProvider).filter(
        or_(
            VerifiedProvider.official_url.contains(domain),
            VerifiedProvider.official_url.contains(root_domain)
        )
    ).first()

    if provider:
        return {
            "is_verified": True,
            "provider": provider.name,
            "shield_badge": "✅ Shield of Trust",
            "security_tips": provider.security_tips
        }
    return {"is_verified": False}
```

### 4.2. Company Impersonation Detection

**Brand Watchlist (Hardcoded Priority List):**
```python
COMPANY_WATCHLIST = {
    "amazon":    ["amazon.com", "amazon.in", "media-amazon.com"],
    "paypal":    ["paypal.com", "paypal-objects.com"],
    "google":    ["google.com", "gstatic.com", "googleapis.com"],
    "microsoft": ["microsoft.com", "office.com", "outlook.com", "live.com"],
    "apple":     ["apple.com", "icloud.com"],
    "netflix":   ["netflix.com"],
    "facebook":  ["facebook.com", "fb.com", "meta.com"],
    "instagram": ["instagram.com"],
    "linkedin":  ["linkedin.com"],
    "university": [".edu", ".ac.uk", ".edu.au"]
}
```

**Detection Algorithm:**
```python
def check_company_impersonation(self, text: str, urls: list) -> dict:
    text_lower = text.lower()

    for brand, legitimate_domains in COMPANY_WATCHLIST.items():
        if brand in text_lower:
            # Brand mentioned in text — check if any URL matches
            for url in urls:
                domain = urlparse(url).netloc.lower()
                if not any(legit in domain for legit in legitimate_domains):
                    return {
                        "impersonation_detected": True,
                        "brand": brand.title(),
                        "claimed_domain": domain,
                        "legitimate_domains": legitimate_domains,
                        "risk_penalty": 0.35
                    }

    return {"impersonation_detected": False}
```

**Worked Example:**
> Text: *"Your Amazon package is held. Verify at http://amaz0n-verify.xyz"*
>
> 1. Brand "amazon" found in text ✓
> 2. URL domain: `amaz0n-verify.xyz`
> 3. Check: `"amazon.com" in "amaz0n-verify.xyz"` → False
> 4. Check: `"amazon.in" in "amaz0n-verify.xyz"` → False
> 5. **Result: IMPERSONATION DETECTED** — risk += 0.35

---

## 5. URL Detection Engine (Pillar 4)

**File:** `backend/app/services/url_detector.py`
**Class:** `URLDetectorService`

### 5.1. Nine-Layer Analysis Pipeline

```
Layer 1: Pattern Engine Integration
       ↓
Layer 2: Protocol Analysis
       ↓
Layer 3: URL Shortener Detection
       ↓
Layer 4: Typosquatting Detection (Levenshtein Distance)
       ↓
Layer 5: Shannon Entropy Analysis (DGA Detection)
       ↓
Layer 6: Homoglyph Attack Detection (Cyrillic)
       ↓
Layer 7: IP Address Masking Detection
       ↓
Layer 8: Subdomain Abuse Detection
       ↓
Layer 9: Deep Content Scan (Webpage Fetch + AI)
       ↓
Score Aggregation → Decision
```

### 5.2. Layer Details with Formulas

#### Layer 2: Protocol Check
```python
if not url.startswith("https"):
    risk += 0.10
    reasoning.append("Insecure Protocol: HTTP without TLS encryption")
```

#### Layer 3: URL Shortener Detection
```python
SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly"]
if any(shortener in domain for shortener in SHORTENERS):
    risk += 0.20
    metadata["is_shortened"] = True
```

#### Layer 4: Typosquatting — Levenshtein Distance Algorithm
```python
import Levenshtein

POPULAR_DOMAINS = ["google.com", "facebook.com", "amazon.com", "apple.com",
                   "microsoft.com", "netflix.com", "github.com", "linkedin.com"]

domain_name = domain.split(".")[0]  # Extract name part: "paypa1" from "paypa1.com"

for popular in POPULAR_DOMAINS:
    popular_name = popular.split(".")[0]  # "paypal" from "paypal.com"
    distance = Levenshtein.distance(domain_name, popular_name)

    if 0 < distance <= 2:  # Within 2 character edits
        risk += 0.40
        reasoning.append(
            f"Typosquatting Detected: '{domain_name}' resembles '{popular_name}' "
            f"(Distance: {distance})"
        )
```

**Worked Example:**
> Input: `http://paypa1.com/login`
> - `domain_name = "paypa1"`
> - Compare to `"paypal"`: `Levenshtein.distance("paypa1", "paypal") = 1`
> - `0 < 1 <= 2` → **TYPOSQUATTING DETECTED** → risk += 0.40

#### Layer 5: Shannon Entropy — DGA Detection

Shannon entropy measures the randomness of characters in a domain name. Machine-generated domains (Domain Generation Algorithms) produce high-entropy strings.

**Formula:**
```
H(X) = -Σ p(xi) × log₂(p(xi))
```

**Implementation:**
```python
import math
from collections import Counter

def _calculate_entropy(self, text: str) -> float:
    if not text:
        return 0.0
    counts = Counter(text)
    length = len(text)
    entropy = -sum(
        (count / length) * math.log2(count / length)
        for count in counts.values()
    )
    return round(entropy, 2)
```

**Threshold:**
```python
domain_name = domain.split(".")[0]  # "axv12z99phish" from "axv12-z99-phish.xyz"
entropy = self._calculate_entropy(domain_name)

if entropy > 4.0:  # High randomness threshold
    risk += 0.25
    reasoning.append(f"High Entropy: {entropy} — potential DGA domain")
```

**Worked Examples:**
| Domain | Entropy | Verdict |
|:---|:---|:---|
| `google` | 2.25 | Normal — well-known word |
| `paypal` | 2.25 | Normal — recognizable brand |
| `axv12z99phish` | 3.70 | Borderline — somewhat random |
| `kj38xnq9p2m4z` | 4.21 | **Flagged** — likely machine-generated |

#### Layer 6: Homoglyph Detection — Cyrillic Character Substitution

Visual spoofing attacks use non-Latin characters that look identical to Latin characters. For example, Cyrillic `а` (U+0430) is visually identical to Latin `a` (U+0061).

**Character Mapping (14 Cyrillic → Latin pairs):**
```python
HOMOGLYPHS = {
    'а': 'a',  # Cyrillic Small A
    'е': 'e',  # Cyrillic Small IE
    'о': 'o',  # Cyrillic Small O
    'р': 'p',  # Cyrillic Small ER
    'с': 'c',  # Cyrillic Small ES
    'у': 'y',  # Cyrillic Small U
    'х': 'x',  # Cyrillic Small HA
    'А': 'A',  # Cyrillic Capital A
    'Е': 'E',  # Cyrillic Capital IE
    'К': 'K',  # Cyrillic Capital KA
    'М': 'M',  # Cyrillic Capital EM
    'Н': 'H',  # Cyrillic Capital EN
    'О': 'O',  # Cyrillic Capital O
    'Т': 'T',  # Cyrillic Capital TE
}
```

**Detection Logic:**
```python
has_homoglyph = any(char in domain for char in HOMOGLYPHS.keys())
if has_homoglyph:
    risk += 0.60  # Highest single-layer penalty
    reasoning.append("⚡ Homoglyph Alert: Foreign characters detected mimicking Latin script")
```

#### Layer 7: IP Address Masking
```python
import re
ip_pattern = re.compile(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}')
if ip_pattern.match(domain):
    risk += 0.50
    metadata["has_ip"] = True
```

#### Layer 8: Subdomain Abuse
```python
subdomains = domain.split(".")
if len(subdomains) > 4:  # e.g., login.paypal.com.attacker.net
    risk += 0.30
    reasoning.append(f"Subdomain Abuse: {len(subdomains)} levels deep")
```

#### Layer 9: Deep Content Scan

For URLs that are accessible, the engine fetches the page content and runs AI analysis:

```python
async def _deep_scan(self, url: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=10, ssl=False) as response:
            html_content = await response.text()

    # Extract visible text from HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    page_text = soup.get_text(separator=" ", strip=True)[:3000]

    # Run through text detector AI
    text_result = await text_detector.analyze(page_text)

    if text_result["prediction"] == "scam":
        return {
            "content_scam": True,
            "content_confidence": text_result["confidence"],
            "risk_addition": 0.50
        }
```

### 5.3. Score Aggregation & Decision

```python
# Score Capping
final_score = min(risk, 1.0)  # Cap at 1.0

# Decision Threshold
if final_score >= 0.40:
    prediction = "scam"
else:
    prediction = "safe"

# Confidence Calculation
confidence = max(final_score, ai_confidence if deep_scan_result else 0)
```

### 5.4. Maximum Risk Contribution Summary

| Layer | Max Risk Penalty | Condition |
|:---|:---|:---|
| Pattern Engine | Variable | Sum of matched pattern risk_scores |
| Protocol | +0.10 | HTTP without HTTPS |
| URL Shortener | +0.20 | Known shortener domain |
| Typosquatting | +0.40 | Levenshtein distance ≤ 2 |
| Shannon Entropy | +0.25 | Entropy > 4.0 |
| Homoglyph | +0.60 | Any Cyrillic character detected |
| IP Masking | +0.50 | Direct IP address in domain |
| Subdomain Abuse | +0.30 | > 4 subdomain levels |
| Deep Content Scan | +0.50 | AI detects scam on fetched page |
| **Theoretical Maximum** | **~2.85+** | (Capped to 1.0) |

---

## 6. Image Forensic Engine (Pillar 5)

**File:** `backend/app/services/image_detector_service.py`
**Class:** `ImageDetectorService`

### 6.1. Five-Operation Pipeline

```
Image File Upload
       │
       ├── (1) OpenCV Loading → NumPy array
       ├── (2) PIL Loading → PIL Image object
       │
       ▼
┌─────────────────────────────────┐
│ Operation 1: OCR Text Extraction │
│ Tesseract + Adaptive Preprocess  │
│ Output: extracted_text (string)  │
└─────────────┬───────────────────┘
              │
              ├─→ Platform Detection (WhatsApp/Telegram/Email)
              ├─→ TextDetectorService.analyze(text)
              └─→ URL extraction → URLDetectorService.analyze()
              │
              ▼
┌─────────────────────────────────┐
│ Operation 2: EXIF Metadata Audit │
│ PIL.getexif() → key inspection   │
│ Output: ai_tool_detected, camera │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ Operation 3: Texture Analysis    │
│ OpenCV Laplacian Variance        │
│ Output: variance, is_synthetic   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ Operation 4: Integrity Scoring   │
│ 40% metadata + 40% texture +    │
│ 20% AI signature                 │
│ Output: integrity_score (0-100)  │
└─────────────────────────────────┘
```

### 6.2. Laplacian Variance — Texture Analysis Algorithm

The Laplacian operator is a second-order derivative that measures the rate of intensity change in an image. Real photographs have high variance (natural noise from camera sensors). AI-generated images have suspiciously low variance (synthetic smoothing).

**Formula:**
```
Variance = Var(∇²I) = (1/N) × Σ(L(x,y) - μ)²

Where:
  ∇²I = Laplacian of image I
  L(x,y) = Laplacian value at pixel (x,y)
  μ = Mean of all Laplacian values
  N = Total number of pixels
```

**Implementation:**
```python
import cv2
import numpy as np

def _analyze_texture(self, cv_image) -> dict:
    # Convert to grayscale
    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)

    # Apply Laplacian operator (3x3 kernel)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)

    # Calculate variance
    variance = laplacian.var()

    # Classify
    SMOOTHNESS_THRESHOLD = 120.0

    if variance < SMOOTHNESS_THRESHOLD:
        return {
            "texture": "Suspiciously Smooth",
            "variance": round(variance, 2),
            "is_synthetic": True,
            "reasoning": f"AI Texture detected (Variance: {variance:.1f} < {SMOOTHNESS_THRESHOLD})"
        }
    else:
        return {
            "texture": "Natural",
            "variance": round(variance, 2),
            "is_synthetic": False
        }
```

**Reference Values:**
| Source | Typical Variance | Classification |
|:---|:---|:---|
| Smartphone photo | 300-2000 | Natural |
| DSLR photo | 500-5000 | Natural |
| Scanned document | 150-400 | Natural |
| Screenshot (compression) | 100-300 | Borderline |
| Stable Diffusion output | 40-100 | Suspiciously Smooth |
| Midjourney output | 50-120 | Suspiciously Smooth |
| DALL-E output | 60-130 | Borderline-Smooth |

### 6.3. EXIF Metadata AI Signature Detection

```python
AI_SOFTWARE_SIGNATURES = [
    "stable diffusion", "midjourney", "dall-e", "dalle",
    "adobe firefly", "civitai", "hugging face", "huggingface",
    "leonardo.ai", "automatic1111", "comfyui", "novelai"
]

def _check_exif_for_ai(self, pil_image) -> dict:
    exif_data = pil_image.getexif()

    # Check EXIF tag 305 (Software)
    software = exif_data.get(305, "").lower()

    for sig in AI_SOFTWARE_SIGNATURES:
        if sig in software:
            return {
                "ai_detected": True,
                "tool": sig.title(),
                "risk_penalty": 0.25
            }

    return {"ai_detected": False}
```

### 6.4. Integrity Score Calculation

```python
# Component weights
METADATA_WEIGHT = 0.40
TEXTURE_WEIGHT = 0.40
AI_WEIGHT = 0.20

# Component scores (each 0-100)
metadata_score = 100  # Start at full trust
if no_exif_data:
    metadata_score -= 30
if ai_tool_in_exif:
    metadata_score -= 50

texture_score = 100
if variance < 120:
    texture_score = (variance / 120) * 100  # Proportional to threshold

ai_score = 100
if ai_signature_detected:
    ai_score = 0

# Final composite
integrity_score = (metadata_score * METADATA_WEIGHT +
                   texture_score * TEXTURE_WEIGHT +
                   ai_score * AI_WEIGHT)
```

### 6.5. Platform Detection (OCR Post-Processing)

```python
PLATFORM_PATTERNS = {
    "WhatsApp": ["whatsapp", "wa.me", "last seen", "read receipt",
                 "end-to-end encrypted", "blue tick"],
    "Telegram": ["telegram", "t.me", "channel", "bot"],
    "Instagram": ["instagram", "ig", "story", "reels", "followers"],
    "Email":     ["subject:", "from:", "to:", "cc:", "bcc:",
                  "dear sir", "dear madam", "regards"],
    "SMS":       ["txt", "sms", "message received"]
}

def detect_platform(self, text: str) -> str:
    text_lower = text.lower()
    for platform, keywords in PLATFORM_PATTERNS.items():
        if any(kw in text_lower for kw in keywords):
            return platform
    return "Unknown"
```

---

## 7. PDF Forensic Engine (Pillar 7)

**File:** `backend/app/services/pdf_analyzer.py`
**Class:** `PDFAnalyzerService`

### 7.1. Ten-Stage Analysis Pipeline

```
PDF File
   │
   ├── Stage 1: Encryption Detection
   ├── Stage 2: Metadata Extraction (author, creator, producer)
   ├── Stage 3: Author Trust Verification
   ├── Stage 4: Digital Signature Detection
   ├── Stage 5: Text Extraction + AI Analysis
   ├── Stage 6: Scam Keyword Scanning
   ├── Stage 7: Visible URL Extraction (regex)
   ├── Stage 8: Ghost URL Extraction (annotations)
   ├── Stage 9: Recursive URL Analysis (parallel)
   └── Stage 10: Structural Analysis + Score Aggregation
```

### 7.2. Ghost Link Detection Algorithm

Ghost links are hidden URI targets embedded in PDF annotation objects but invisible in the rendered document text.

```python
def _extract_ghost_urls(self, pdf) -> list:
    """Extract annotation-based URIs not visible in document text."""
    ghost_urls = []
    visible_text = ""

    for page in pdf.pages:
        visible_text += page.extract_text() or ""

    # Check PDF annotations for URI actions
    for page in pdf.pages:
        if page.annots:
            for annot in page.annots:
                if isinstance(annot, dict):
                    uri = annot.get("uri", "")
                    if uri and uri not in visible_text:
                        ghost_urls.append(uri)  # URL exists in annotation but NOT in visible text

    return ghost_urls
```

**Why This Matters:**
A PDF can show "Click here to apply" as visible text, while the annotation hyperlink actually points to `http://phishing-site.xyz`. The user sees an innocent button but clicking it navigates to a malicious destination. Our ghost link detection surfaces these hidden URIs.

### 7.3. Digital Signature Detection

```python
def _check_signature(self, file_bytes: bytes) -> bool:
    """Check for cryptographic signature markers in PDF byte stream."""
    # /Sig is the PDF object type for digital signatures
    # /ByteRange specifies the signed byte range
    has_sig = b"/Sig" in file_bytes
    has_byterange = b"/ByteRange" in file_bytes
    return has_sig and has_byterange
```

### 7.4. Recursive URL Scanning

```python
async def _scan_urls(self, urls: list, ghost_urls: list) -> list:
    """Recursively scan all discovered URLs through the URL detector."""
    all_urls = list(set(urls + ghost_urls))  # Deduplicate
    all_urls = all_urls[:10]  # Safety cap at 10 URLs

    # Parallel analysis using asyncio.gather
    tasks = [url_detector.analyze(url) for url in all_urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    url_reports = []
    for url, result in zip(all_urls, results):
        if isinstance(result, dict):
            url_reports.append({
                "url": url,
                "prediction": result["prediction"],
                "scam_score": result.get("scam_score", 0),
                "is_ghost": url in ghost_urls  # Flag ghost links
            })

    return url_reports
```

### 7.5. PDF Score Explanation

```python
score_explanation = {
    "encryption":   15 if is_encrypted else 0,
    "metadata":     10 if suspicious_author else 0,
    "signature":    5 if not has_signature else 0,
    "ai_content":   ai_confidence * 40,     # Max 40
    "keywords":     keyword_count * 10,     # 10 per keyword
    "url_analysis": max_url_scam_score * 35, # Max 35
    "ghost_links":  15 if has_ghost_links else 0,
    "structure":    5 if page_count < 2 else 0
}
```

---

## 8. Gamification Engine (Pillar 8)

**File:** `backend/app/utils/gamification.py`
**Class:** `GamificationService`

### 8.1. XP Award Table

| Event | XP | Where Awarded |
|:---|:---|:---|
| Text scan | +10 | `detect_text.py` route handler |
| URL scan | +15 | `detect_url.py` route handler |
| Quiz completion | +50 | `quiz.py` route handler |
| Educational module | Up to +150 | `awareness.py` route handler |

### 8.2. Level Calculation

```python
def calculate_level(xp: int) -> int:
    return (xp // 100) + 1

# Examples:
#   0 XP   → Level 1
#   99 XP  → Level 1
#   100 XP → Level 2
#   500 XP → Level 6
#   999 XP → Level 10
#   1000 XP → Level 11
```

### 8.3. Rank Hierarchy

```python
def get_rank_title(level: int) -> str:
    if level <= 2:
        return "Cyber Scout"
    elif level <= 5:
        return "Forensic Guardian"
    elif level <= 10:
        return "Cyber Sentinel"
    else:
        return "Grand Protector"
```

### 8.4. Badge Milestone Detection

```python
BADGES = {
    "First Response": lambda stats: stats["total_scans"] >= 1,
    "Phishing Hunter": lambda stats: stats["url_scans"] >= 10,
}

def check_badges(self, user, db):
    stats = self._get_user_stats(user.id, db)
    current_badges = user.badges or []

    for badge_name, condition in BADGES.items():
        if badge_name not in current_badges and condition(stats):
            current_badges.append(badge_name)

    user.badges = current_badges
    db.commit()
```

---

## 9. Cross-Engine Orchestration

### 9.1. Cross-Service Invocation Map

```
TextDetector.analyze()
  ├── PatternService.analyze_text()        ← Pillar 2
  └── TrustService.check_impersonation()   ← Pillar 3

URLDetector.analyze()
  ├── PatternService.analyze_url()         ← Pillar 2
  ├── ExternalIntel.check_urlscan()        ← External API
  ├── TrustService.check_domain()          ← Pillar 3
  └── TextDetector.analyze(page_content)   ← Pillar 1 (deep scan)

PDFAnalyzer.analyze()
  ├── TextDetector.analyze(pdf_text)       ← Pillar 1
  └── URLDetector.analyze(each_url)        ← Pillar 4 (recursive, parallel)

ImageDetector.analyze()
  ├── ImageOCR.extract_text()              ← Sub-engine
  ├── TextDetector.analyze(ocr_text)       ← Pillar 1
  └── URLDetector.analyze(each_url)        ← Pillar 4
```

### 9.2. Maximum Analysis Depth (Recursive)

```
Image Upload
  └── OCR extracts text containing URLs
        └── URL Detector analyzes each URL
              └── Deep Scan fetches page content
                    └── Text Detector AI analyzes page text
                          └── Pattern Engine matches keywords
                          └── Trust Service checks brands

Total pipeline depth: 6 layers deep from original input
```

---

*This document reflects the detection engine implementations as of April 16, 2026 (v2.1.0). For API endpoints, see [api_documentation.md](./api_documentation.md).*

---

## 10. Multi-Modal Correlation Engine (v2.1.0 Upgrade)

**File:** `backend/app/services/correlation_service.py`
**Class:** `CorrelationService`

The Correlation Engine is the "Brain" of CyberShield-EDU v2.1.0. It moves beyond simple additive risk scores (0.1 + 0.1) to **Behavioral Pattern Analysis**. It identifies the dangerous synergy between neutral-looking traits.

### 10.1. Intent & Category Mapping
The `PatternService` has been upgraded to tag findings with semantic labels:

| Mapping | Type | Identified Patterns |
|:---|:---|:---|
| `FINANCIAL` | **Intent** | requests for fees, payments, crypto, bank transfers |
| `URGENCY` | **Intent** | "Limited seats", "Apply now", "Last chance" |
| `OFFICIAL` | **Intent** | Mimicking letters, agreements, or authority figures |
| `DATA_HARVESTING` | **Intent** | "Drop your Gmail", "WhatsApp below" |
| `ACADEMIC` | **Category** | Scholarships, Internships, GPA Boosts |
| `PROFESSIONAL` | **Category** | Job offers, Recruitment, Hiring |

### 10.2. Correlation Rule Table
The engine applies non-linear boosts based on these combinations:

| Pattern Name | Logic (Conditions) | Boost | Reason |
|:---|:---|:---|:---|
| **Academic Financial Fraud** | Intent: `FINANCIAL` + Cat: `ACADEMIC` | +0.40 | Universities rarely ask for crypto/fees for internships. |
| **Social Redirection Scam** | Intent: `URGENCY` + Plat: `WhatsApp/Telegram` | +0.35 | Scammers move to encrypted apps to hide from filters. |
| **Data Harvesting Bait** | Intent: `DATA_HARVESTING` | +0.30 | "Comment baiting" is a classic social media trap. |
| **High-Risk Infrastructure** | Intent: `ACADEMIC` + URL: `suspicious` | +0.25 | Student offers on high-entropy domains are high risk. |

### 10.3. Dynamic Thresholding (v2.1.0)
Final predictions are no longer hardcoded. They are determined by the `SystemConfig` table in the database:
- **`low_threshold`** (Default 0.3): Safe → Suspicious transition.
- **`high_threshold`** (Default 0.7): Suspicious → Scam transition.

---

## 11. Localized & Transliterated Detection

CyberShield-EDU v2.1.0 introduces optimized support for **Roman Urdu and Hindi** to protect South Asian student populations.

### 11.1. Transliteration Logic
The Pattern Engine performs "soft-matching" on transliterated terms. Because spelling varies (e.g., "karwayen" vs "karwaein"), we use a substring-match approach on normalized text.

### 11.2. Intent Mapping for Regional Terms

| Regional Term | Meaning | Mapped Intent |
|:---|:---|:---|
| `jama`, `paise`, `fees` | Deposit / Money / Fees | `FINANCIAL` |
| `jaldi`, `fauran` | Quick / Immediately | `URGENCY` |
| `mubarak ho` | Congratulations | `OFFICIAL` |
| `select ho gaye` | You are selected | `OFFICIAL` |
| `naukri`, `mulazmat` | Job / Work | `PROFESSIONAL` |

### 11.3. Worked Example: Mixed-Language Scam
> Text: *"Assalam o Alaikum, ap internship k liye select ho gaye hain, registration fees jama karwaein."*
> 
> 1. **Detection**: `internship` → `ACADEMIC` Category.
> 2. **Detection**: `fees jama` → `FINANCIAL` Intent.
> 3. **Correlation**: `ACADEMIC` + `FINANCIAL` = **Scam Match** (+0.40 score boost).
> 4. **Verdict**: **SCAM** (The engine sees the *Academic* context and *Financial* intent, even though they are in different languages).
