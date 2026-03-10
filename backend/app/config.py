import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = os.getenv("APP_NAME", "CyberShield EDU")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Security & CORS
    SECRET_KEY: str = os.getenv("SECRET_KEY", "placeholder-key-for-dev")
    # Parse ALLOWED_ORIGINS from string like "['*']" or "http://localhost:5173"
    ALLOWED_ORIGINS: list = ["*"]
    
    # Scam Detection Config
    SCAM_KEYWORDS: list = [
        "registration fee", "security deposit", "processing fee",
        "whatsapp", "telegram", "pay for internship", "limited seats",
        "congratulations", "selected", "immediate joining", "gpa boost",
        "free certificate", "urgent payment"
    ]
    
    # URL Detection Config
    HIGH_RISK_TLDS: list = [".xyz", ".top", ".pw", ".zip", ".click", ".link", ".bid", ".loan"]
    SUSPICIOUS_URL_KEYWORDS: list = [
        "login", "verify", "secure", "account", "update", "banking", 
        "internship", "job", "career", "scholarship", "free", "pay", 
        "portal", "student", "auth"
    ]
    TRUSTED_DOMAINS: list = [".edu", ".gov", ".ac.in", ".edu.in", "google.com", "microsoft.com", "github.com"]
    POPULAR_DOMAINS: list = ["google.com", "facebook.com", "amazon.com", "apple.com", "microsoft.com", "netflix.com", "github.com", "linkedin.com"]

    # Path Configuration
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH: str = os.path.join(BASE_DIR, "app", "models")

settings = Settings()
