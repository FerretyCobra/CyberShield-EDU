from transformers import pipeline
from app.utils.logger import logger
from app.utils.text_cleaner import clean_text, extract_metadata
from app.config import settings
from app.services.pattern_service import pattern_service
import torch
import os


class TextDetectorService:
    def __init__(self):
        self._classifier = None


    def load_model(self):
        """Explicitly load the model during startup to avoid first-run latency."""
        if self._classifier is None:
            # Path to the fine-tuned model
            local_model_path = os.path.join(os.path.dirname(__file__), "..", "ai_models", "scam_detector_v1")
            
            if os.path.exists(local_model_path):
                logger.info(f"🚀 INITIALIZING SPECIALIZED STUDENT BRAIN (v1) from {local_model_path}")
                model_to_load = local_model_path
            else:
                logger.info("Initializing fallback: Multilingual DistilBERT (Zero-Shot)...")
                model_to_load = "distilbert-base-multilingual-cased"

            device = 0 if torch.cuda.is_available() else -1
            self._classifier = pipeline(
                "text-classification", 
                model=model_to_load,
                device=device,
                truncation=True,
                max_length=512
            )
        return self._classifier

    @property
    def classifier(self):
        return self.load_model()

    async def analyze(self, raw_text: str):
        cleaned = clean_text(raw_text)
        metadata = extract_metadata(raw_text)
        
        # Prevent massive payloads from destroying RAM before it even hits the tokenizer
        # Average English word is ~5 chars. 512 tokens is roughly ~2500 chars. We'll slice at 3000 to be safe.
        safe_text = cleaned[:3000]
        
        # 1. AI Analysis
        ai_result = self.classifier(safe_text)[0]
        ai_label = ai_result['label']
        ai_score = ai_result['score']
        
        # 2. Dynamic Pattern Analysis (Pillar 2)
        pattern_data = pattern_service.analyze_text(cleaned)
        keyword_hits = pattern_data["matches"]
        reasoning = []
        
        # 3. Decision Logic & Reasoning
        is_suspicious = False
        
        if ai_result['score'] > 0.6: # Moderate confidence baseline
            is_suspicious = True
            reasoning.append(f"AI Model detected suspicious sentiment (Confidence: {ai_result['score']:.2f})")
        
        if len(keyword_hits) > 0:
            is_suspicious = True
            reasoning.append(f"Detected heuristic threat patterns: {', '.join(keyword_hits)}")
            
        if metadata.get("has_link") and is_suspicious:
            reasoning.append("Message contains a suspicious link combined with threat patterns")

            
        # 4. Context-Aware social engineering detection
        context_flag = self._check_context_conflicts(cleaned)
        if context_flag:
            is_suspicious = True
            reasoning.append(context_flag)
            ai_score = max(ai_score, 0.95) # Boost confidence for explicit context matches
            
        final_prediction = "scam" if is_suspicious else "safe"
        
        # Adjust confidence
        confidence = ai_score
        if is_suspicious and len(keyword_hits) > 1:
            confidence = min(0.99, confidence + 0.15)

        logger.info(f"Analysis Complete: Label={final_prediction}, Confidence={confidence:.2f}")
        
        return {
            "prediction": final_prediction,
            "confidence": float(confidence),
            "reasoning": reasoning,
            "highlights": keyword_hits,
            "metadata": metadata,
            "insights": {
                "sentiment": ai_label,
                "complexity": self._calculate_complexity(safe_text),
                "is_context_flagged": bool(context_flag)
            },
            "recommendation": self._get_recommendation(final_prediction, keyword_hits)
        }

    def _calculate_complexity(self, text: str) -> str:
        """Rough heuristic for linguistic complexity/sophistication."""
        words = text.split()
        if not words: return "N/A"
        avg_len = sum(len(w) for w in words) / len(words)
        if avg_len > 6: return "High (Professional/Sophisticated)"
        if avg_len > 4: return "Medium (Standard)"
        return "Low (Casual/Slang)"

    def _check_context_conflicts(self, text: str) -> str:
        """Detects if a role (e.g. Professor) is performing an unusual action (e.g. asking for OTP)."""
        text = text.lower()
        
        roles = {
            "professor": ["professor", "teacher", "faculty", "dean", "lecturer"],
            "admin": ["admin", "administrator", "it support", "system access", "registrar"],
            "recruiter": ["recruiter", "hr manager", "hiring", "talent acquisition"]
        }
        
        suspicious_actions = {
            "otp_request": ["otp", "verification code", "6-digit", "security code", "pass code"],
            "payment": ["registration fee", "security deposit", "processing fee", "bank transfer"],
            "password": ["password", "login details", "credentials", "sign in info"]
        }
        
        detected_role = None
        for role, keywords in roles.items():
            if any(k in text for k in keywords):
                detected_role = role
                break
        
        if detected_role:
            for action, keywords in suspicious_actions.items():
                if any(k in text for k in keywords):
                    return f"CONTEXT ALERT: A '{detected_role}' would typically never ask for '{action.replace('_', ' ')}' via message."
        
        return None

    def _get_recommendation(self, prediction: str, keywords: list) -> str:
        if prediction == "scam":
            if "registration fee" in keywords or "security deposit" in keywords:
                return "CRITICAL: Legitimate internships NEVER ask for money. This is a scam."
            return "WARNING: This message matches profiles of known student scams. Do not engage."
        return "Looks relatively safe, but always verify the source and never share OTPs."

text_detector = TextDetectorService()
