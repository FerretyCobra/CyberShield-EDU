# CyberShield-EDU Demonstration Script

This document provides a step-by-step script for presenting CyberShield-EDU to an audience (e.g., class, professors, hackathon judges).

## Preparation Before Demo
1. Ensure the Backend is running on `http://localhost:8080`.
2. Ensure the Frontend is running on `http://localhost:5173`.
3. Have a sample PDF scam ready (you can create a simple PDF with the text "Congratulations on your internship! Please pay a $100 processing fee to secure your spot.").
4. Have your browser open to the `http://localhost:5173` home screen.

---

## 🎭 The Presentation

### 1. The Introduction (1 Minute)
* **Action:** Start on the Home Page (Text Scan by default).
* **Talking Points:**
  * *"Hi everyone, today I want to present **CyberShield-EDU**, an AI-powered platform designed specifically to protect students from the rising tide of online scams."*
  * *"Students are constantly targeted by fake internships, phishing links disguised as university portals, and textbook scams. CyberShield acts as a personal security assistant."*
  * *"The platform features a modern, accessible interface with four main detection engines, an education hub, and an administrative backend."*

### 2. Live Demo: Text Scan (NLP in Action) (2 Minutes)
* **Action:** Stay on the 'Text Scan' page.
* **Talking Points:**
  * *"Let's look at a common scenario. A student receives a suspicious SMS about a job."*
* **Action:** Type or paste the following text:
  * > "URGENT: You have been selected for the remote data entry position paying $35/hr. Click here to buy your equipment setup kit immediately: http://job-onboarding-fake.com"
* **Action:** Click **"Analyze Message"**.
* **Talking Points:**
  * *"When we analyze this, our backend uses a Natural Language Processing model (DistilBERT) to evaluate the intent."*
  * *(Point to the result)* *"As you can see, the AI flagged this as a **SCAM** with high confidence. Below the result, the system provides a **Reasoning Feed**, explaining exactly *why* it was flagged—in this case, high urgency and money requests."*

### 3. Live Demo: URL Analysis & Typo-squatting (2 Minutes)
* **Action:** Click on 'URL Scan' in the sidebar.
* **Talking Points:**
  * *"Attackers often use fake links that look incredibly similar to real ones. We call this 'typo-squatting'."*
* **Action:** Enter the URL: `http://student-aid-fasa.com` (a typo of FAFSA).
* **Action:** Click **"Analyze Link"**.
* **Talking Points:**
  * *"Our URL engine uses Levenshtein distance algorithms to catch these subtle misspellings against known safe domains, alongside entropy checks to catch machine-generated phishing links."*

### 4. Interactive Education: Building Awareness (1 Minute)
* **Action:** Click on 'Education' in the sidebar.
* **Talking Points:**
  * *"Detection is only half the battle; education is the other. We built an Awareness Center."*
  * *"Here, students can read up on the latest 'Scams of the Week', get wellness tips for dealing with the stress of a cyber incident, and test their knowledge with an interactive quiz."*
* **Action:** Quickly click through one of the quiz questions to demonstrate interactivity.

### 5. The Admin Dashboard: Analytics & Oversight (1.5 Minutes)
* **Action:** Click on 'Admin' in the sidebar.
* **Talking Points:**
  * *"Finally, for university IT teams or administrators, we built a comprehensive Admin Dashboard."*
  * *"We track system health, total scans processed, and threat distributions using real-time charts."*
* **Action:** Scroll down to the Detection Rules section.
* **Talking Points:**
  * *"Admins can dynamically update the global scam keyword rules right here. If a new scam trend emerges on campus, an admin can add a keyword, and the detection engine will immediately start looking for it across all modules, requiring zero code changes."*

### 6. Conclusion
* **Talking Points:**
  * *"CyberShield-EDU represents a proactive, AI-driven approach to campus cybersecurity. By combining robust detection algorithms with student education, we can significantly reduce the success rate of malicious actors."*
  * *"Thank you, I'd be happy to take any questions."*
