import re
import logging
from sqlalchemy.orm import Session
from app.models.schema import ThreatPattern, ScamKeyword
from app.database import SessionLocal
from app.config import settings

logger = logging.getLogger("CyberShield")

class PatternService:
    """
    Pillar 2: Dynamic Pattern Engine.
    Manages and executes detection heuristics (Regex, Keywords, TLDs).
    """
    def __init__(self):
        self.patterns = {"keyword": [], "regex": [], "tld": [], "domain": []}
        self.is_loaded = False

    def load_from_db(self, db: Session = None):
        """Loads all patterns from database into memory for fast matching."""
        db_created = False
        if db is None:
            db = SessionLocal()
            db_created = True
            
        try:
            # 1. Fetch from ThreatPattern table
            all_patterns = db.query(ThreatPattern).filter(ThreatPattern.is_active == True).all()
            
            # Reset memory cache
            self.patterns = {"keyword": [], "regex": [], "tld": [], "domain": []}
            
            for p in all_patterns:
                if p.pattern_type in self.patterns:
                    self.patterns[p.pattern_type].append({
                        "value": p.value,
                        "risk": p.risk_score,
                        "desc": p.description
                    })

            # 2. Add legacy ScamKeywords as keywords
            legacy = db.query(ScamKeyword).all()
            for l in legacy:
                self.patterns["keyword"].append({
                    "value": l.keyword,
                    "risk": l.weight or 0.1,
                    "desc": "Legacy Scam Keyword"
                })

            # 3. Fallback to settings if DB is empty
            if not all_patterns and not legacy:
                for kw in settings.SCAM_KEYWORDS:
                    self.patterns["keyword"].append({"value": kw, "risk": 0.1, "desc": "Initial Config Keyword"})
                for tld in settings.HIGH_RISK_TLDS:
                    self.patterns["tld"].append({"value": tld, "risk": 0.3, "desc": "Initial Config TLD"})

            self.is_loaded = True
            logger.info(f"Pattern Engine: Loaded {len(all_patterns) + len(legacy)} total rules into memory.")
        except Exception as e:
            logger.error(f"Pattern Engine Load Failure: {e}")
        finally:
            if db_created:
                db.close()

    def analyze_text(self, text: str) -> dict:
        """Runs text through keyword and regex patterns."""
        if not self.is_loaded: self.load_from_db()
        
        matches = []
        total_risk = 0.0
        
        text_lower = text.lower()
        
        # Keyword matching
        for k in self.patterns["keyword"]:
            if k["value"].lower() in text_lower:
                matches.append(k["value"])
                total_risk += k["risk"]

        # Regex matching
        for r in self.patterns["regex"]:
            try:
                if re.search(r["value"], text, re.IGNORECASE):
                    matches.append(f"REGEX:{r['desc'] or r['value']}")
                    total_risk += r["risk"]
            except re.error:
                continue
                
        return {"matches": matches, "risk_score": total_risk}

    def analyze_url(self, url: str) -> dict:
        """
        Runs full URL through TLD, domain, and keyword patterns.
        Accepts full URL to catch path-based bait (e.g., /internship).
        """
        if not self.is_loaded: self.load_from_db()
        
        matches = []
        total_risk = 0.0
        
        # Normalize and split
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            full_path = f"{domain}{parsed.path}".lower()
        except:
            full_path = url.lower()
            domain = url.lower()
        
        # 1. TLD matching
        for t in self.patterns["tld"]:
            if domain.endswith(t["value"]):
                matches.append(f"TLD:{t['value']}")
                total_risk += t["risk"]

        # 2. Blacklisted domains
        for d in self.patterns["domain"]:
            if d["value"].lower() in domain:
                matches.append(f"DOMAIN:{d['value']}")
                total_risk += d["risk"]
        
        # 3. Path & Domain Keywords (The "Bait" Shield)
        # Catch keywords like 'free', 'internship', 'login'
        for k in self.patterns["keyword"]:
            kw = k["value"].lower()
            if kw in full_path:
                matches.append(f"BAIT:{kw}")
                total_risk += k["risk"]
                
        return {"matches": matches, "risk_score": total_risk}

pattern_service = PatternService()
