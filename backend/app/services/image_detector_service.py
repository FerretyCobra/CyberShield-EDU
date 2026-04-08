import pytesseract
from PIL import Image
import io
import os
import cv2
import numpy as np
import re
from app.services.text_detector import text_detector
from app.services.url_detector import url_detector
from app.utils.logger import logger

class ImageDetectorService:
    def __init__(self):
        # Configure tesseract path
        self._configure_tesseract()
        
        self.platform_patterns = {
            "WhatsApp": [r"whatsapp", r"status", r"last seen", r"message"],
            "Telegram": [r"telegram", r"channel", r"group", r"join"],
            "Email": [r"from:", r"to:", r"subject:", r"reply"]
        }

    def _configure_tesseract(self):
        common_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Tesseract-OCR", "tesseract.exe")
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                return True
        return False

    async def analyze(self, image_bytes: bytes, filename: str = "image.png"):
        """Performs a comprehensive forensic audit including OCR and Deep-fake detection."""
        logger.info(f"Pillar 5 // Advanced Forensic Audit: {filename}")
        
        reasoning = []
        risk_score = 0.0
        ai_analysis = None
        found_urls = []
        
        try:
            # 1. Image Loading
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            img_pil = Image.open(io.BytesIO(image_bytes))

            # 2. OCR Extraction
            extracted_text = pytesseract.image_to_string(img_pil)
            
            # 3. Platform Identification
            platform = "Unknown"
            lower_text = extracted_text.lower()
            for plat, patterns in self.platform_patterns.items():
                if any(re.search(p, lower_text) for p in patterns):
                    platform = plat
                    reasoning.append(f"Visual artifacts suggest origin: {platform}")

            # 4. Text-based AI Analysis
            if extracted_text.strip():
                ai_res = await text_detector.analyze(extracted_text)
                ai_analysis = {
                    "prediction": ai_res["prediction"],
                    "confidence": ai_res["confidence"],
                    "reasoning": ai_res["reasoning"]
                }
                if ai_res["prediction"] == "scam":
                    risk_score += 0.4
                    reasoning.extend([f"AI Content Alert: {r}" for r in ai_res["reasoning"]])

            # 5. URL Extraction from Image
            text_urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+', extracted_text)
            for url in set(text_urls):
                url_res = await url_detector.analyze(url)
                found_urls.append({
                    "url": url,
                    "prediction": url_res["prediction"],
                    "score": url_res["scam_score"]
                })
                if url_res["prediction"] == "scam":
                    risk_score += 0.4
                    reasoning.append(f"Malicious link found in image: {url}")

            # 6. Metadata (EXIF) Forensics
            exif_data = self._get_exif_metadata(image_bytes)
            
            # 7. Physical Texture/Noise Analysis
            noise_data = self._calculate_noise_integrity(img_cv)

            # 8. Weighted Integrity Calculation
            # Higher score = more 'natural'. Lower score = more 'synthetic'.
            integrity_score = (
                (0.4 * (1.0 if exif_data.get("trust_level") == "high" else 0.5)) +
                (0.4 * noise_data["score"]) +
                (0.2 * (1.0 if not exif_data.get("is_ai_gen") else 0.0))
            )

            risk_score = min(1.0, risk_score + (1.0 - integrity_score) * 0.5)
            prediction = "scam" if risk_score >= 0.45 else "safe"
            
            return {
                "prediction": prediction,
                "confidence": round(risk_score, 2),
                "ai_analysis": ai_analysis,
                "reasoning": list(set(reasoning)),
                "forensic_report": {
                    "integrity_score": round(integrity_score * 100, 1),
                    "metadata_trust": exif_data.get("trust_level"),
                    "texture_analysis": "Suspiciously Smooth" if noise_data["is_suspiciously_smooth"] else "Natural Texture",
                    "is_synthetic": exif_data.get("is_ai_gen", False) or noise_data["is_suspiciously_smooth"]
                },
                "metadata": {
                    "filename": filename,
                    "forensics": {
                        "exif": exif_data,
                        "noise": noise_data,
                        "platform": platform
                    }
                },
                "url_analysis": found_urls[:5]
            }

        except Exception as e:
            logger.error(f"Image Forensic Audit failed: {str(e)}")
            return {
                "prediction": "error",
                "confidence": 0.0,
                "reasoning": [f"Visual forensic engine blackout: {str(e)}"],
                "metadata": {"filename": filename}
            }

    def _get_exif_metadata(self, image_bytes: bytes) -> dict:
        """Extracts deep EXIF metadata to identify source and AI signatures."""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            exif = img._getexif()
            
            TAGS = {271: "make", 272: "model", 305: "software", 306: "datetime", 274: "orientation"}
            
            if not exif:
                return {"status": "Suspicious: No Metadata Found", "trust_level": "low", "is_ai_gen": False}
            
            extracted = {TAGS.get(k, k): v for k, v in exif.items() if k in TAGS}
            
            # AI Signature Detection
            ai_keywords = [
                "stable diffusion", "midjourney", "firefly", "dalle", "civitai", "huggingface", 
                "generative", "ai generated", "gan", "imagine", "adobe firefly"
            ]
            software_str = str(extracted.get("software", "")).lower()
            model_str = str(extracted.get("model", "")).lower()
            
            is_ai_gen = any(k in software_str or k in model_str for k in ai_keywords)
            
            return {
                "tags": extracted,
                "status": "AI Signature Detected" if is_ai_gen else "Natural Image Headers",
                "is_ai_gen": is_ai_gen,
                "trust_level": "high" if "make" in extracted else "medium"
            }
        except:
            return {"status": "Forensic error reading EXIF", "trust_level": "low", "is_ai_gen": False}

    def _calculate_noise_integrity(self, image_np) -> dict:
        """Detects uniform textures (AI skin) using Laplacian Variance."""
        try:
            if len(image_np.shape) == 3:
                gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
            else:
                gray = image_np
                
            variance = cv2.Laplacian(gray, cv2.CV_64F).var()
            # Heuristic: Extremely low texture variance can indicate synthetic smoothing
            is_suspiciously_smooth = variance < 120.0 
            
            return {
                "texture_variance": round(variance, 2),
                "is_suspiciously_smooth": is_suspiciously_smooth,
                "score": 1.0 if not is_suspiciously_smooth else 0.4
            }
        except:
            return {"score": 0.5, "error": "Texture analysis failed"}

    async def analyze_screenshot(self, image_bytes: bytes):
        """Mock/Legacy method for backward compatibility."""
        return await self.analyze(image_bytes)

image_detector = ImageDetectorService()
