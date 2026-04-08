import logging
from sqlalchemy.orm import Session
from app.models.schema import VerifiedProvider
from app.database import SessionLocal
from urllib.parse import urlparse

logger = logging.getLogger("CyberShield")

class TrustService:
    """
    Pillar 3: The Shield of Trust (Whitelist Engine).
    Proactively identifies and badges legitimate career portals and institutional partners.
    """

    def check_domain(self, domain: str) -> dict:
        """
        Cross-references a domain against the institutional trust registry.
        Supports subdomain matching (e.g., jobs.lever.co -> lever.co).
        """
        if not domain:
            return None
            
        db = SessionLocal()
        try:
            # Normalize domain
            domain = domain.lower().strip()
            
            # 1. Exact Match
            provider = db.query(VerifiedProvider).filter(VerifiedProvider.official_url.contains(domain)).first()
            
            # 2. Subdomain/Root Match Loop
            if not provider:
                parts = domain.split('.')
                # We check root-level domains (e.g., lever.co) if we are on a subdomain
                if len(parts) > 2:
                    root_domain = ".".join(parts[-2:])
                    provider = db.query(VerifiedProvider).filter(VerifiedProvider.official_url.contains(root_domain)).first()

            if provider:
                logger.info(f"SHIELD OF TRUST: Domain {domain} verified via {provider.name}")
                return {
                    "name": provider.name,
                    "category": provider.category,
                    "security_tips": provider.security_tips,
                    "verified_at": provider.verified_at.isoformat() if provider.verified_at else None
                }
            
            return None
        except Exception as e:
            logger.error(f"Trust lookup failed: {e}")
            return None
        finally:
            db.close()

trust_service = TrustService()
