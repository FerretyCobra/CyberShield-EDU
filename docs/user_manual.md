# CyberShield-EDU User Manual

Welcome to **CyberShield-EDU**! This guide will help you navigate the platform, utilize its primary scam detection features, and understand the administrative capabilities of the dashboard.

---

## 🧭 Dashboard Navigation

Upon accessing the platform (typically at `http://localhost:5173`), you will see the **Main Sidebar** on the left. This sidebar provides quick access to all the core modules:

1. **Text Scan:** Analyze suspicious messages, emails, or job descriptions.
2. **URL Scan:** Check links for phishing attempts or typo-squatting.
3. **PDF Scanner:** Upload documents (e.g., job offer letters) for text extraction and analysis.
4. **Image OCR:** Upload screenshots of direct messages for AI analysis.
5. **Education Hub:** Access wellness tips, quiz games, and security awareness content.
6. **Dashboard Stats (Admin):** View platform usage analytics and configure detection rules.

*Note: The platform is built as a Single Page Application (SPA), ensuring seamless and rapid transitions between these modules without page reloads.*

---

## 🔍 How to Use the Detection Modules

CyberShield-EDU categorizes threats using advanced machine learning. A response will either be "**Safe**" or flagged as a "**Scam**", accompanied by a **Confidence Score** (%) and **Reasoning** points.

### 1. Text Scan (The NLP Engine)
If you receive a strange SMS, WhatsApp message, or email:
1. Navigate to the **Text Scan** tab.
2. Copy the suspicious text and paste it into the provided text box.
3. Click the **"Analyze Message"** button.
4. Review the result. Look closely at the "Reasoning" section to understand *why* the AI flagged the text (e.g., "High Urgency detected", "Financial request found").

### 2. URL Scan
Before clicking a strange link:
1. Navigate to the **URL Scan** tab.
2. Paste the URL (e.g., `http://xyz.paypa1-secure-login.com`).
3. Click **"Analyze Link"**.
4. The system will check the link's structure, entropy (randomness), and whether it's attempting to impersonate a known brand (like *PayPal* or *Facebook*).

### 3. PDF Scanner
If you receive an unprompted job offer letter or scholarship award document:
1. Navigate to the **PDF Scanner** tab.
2. Drag and drop the `.pdf` file into the upload area, or click to browse your files.
3. Click **"Analyze Document"**.
4. The system will extract the text from the layout and run it through the core text detection engine. It will flag inconsistencies or common fraudulent job offer phrases.

### 4. Image OCR Scanner
Scams frequently occur on platforms where you cannot highlight and copy text (like Instagram DMs or Snapchat).
1. Take a screenshot of the suspicious conversation.
2. Navigate to the **Image OCR** tab.
3. Upload the screenshot (PNG or JPG).
4. Click **"Extract & Analyze Text"**.
5. The Optical Character Recognition (OCR) engine will "read" the image, extract the embedded text, and immediately analyze it for threats.

---

## 🎓 The Education Hub

Prevention is the best form of cybersecurity. The **Education Hub** is designed to build your digital intuition.

* **Daily Wellness Tips:** Short, actionable advice on maintaining digital hygiene and handling the stress associated with potential data breaches.
* **"Spot the Scam" Quiz:** Test your knowledge! You will be presented with real-world scenarios. Choose whether the scenario is a scam or safe, and learn from the post-answer explanations.

---

## 📊 Admin Dashboard

*(Requires Administrator privileges in a production environment)*

The **Dashboard Stats** area provides a high-level overview of system usage.
1. **Analytics:** View interactive charts (built with `recharts`) showing the volume of scans processed over time and the ratio of Safe vs. Scam detections.
2. **Detection Rules Engine:** Administrators can dynamically enhance the platform's heuristics without touching any code. 
   - Scroll to the **"Manage Scaffold Keywords"** section.
   - If a new type of scam starts circulating campus (e.g., involving the word *"venmo-deposit"*), type the keyword and click **"Add Keyword"**.
   - The system immediately incorporates this new rule into all future scans across all modules.

---
*Stay vigilant and always verify out-of-band before sharing sensitive information online.*
