from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings
from app.services.awareness_service import awareness_service
import json
import os

router = APIRouter()

class KeywordUpdate(BaseModel):
    keywords: list

class ResourceUpdate(BaseModel):
    content: dict

@router.get("/system/stats")
async def get_stats():
    # Placeholder for usage statistics
    return {
        "total_scans": 1542,
        "scams_detected": 842,
        "active_models": 4, # Text, URL, Image, PDF
        "active_rules": len(settings.SCAM_KEYWORDS),
        "system_status": "Healthy"
    }

@router.get("/keywords")
async def get_keywords():
    return {
        "total_keywords": len(settings.SCAM_KEYWORDS),
        "keywords": settings.SCAM_KEYWORDS
    }

@router.post("/keywords")
async def update_keywords(data: dict):
    # Expecting {"keyword": "something"} from app.js
    new_keyword = data.get("keyword")
    if new_keyword and new_keyword not in settings.SCAM_KEYWORDS:
        settings.SCAM_KEYWORDS.append(new_keyword)
    return {"message": "Keywords updated successfully", "total_keywords": len(settings.SCAM_KEYWORDS)}

@router.post("/resources")
async def update_resources(data: ResourceUpdate):
    try:
        path = os.path.join(settings.BASE_DIR, "..", "data", "educational_resources.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data.content, f, indent=2)
        # Reload service content
        awareness_service.content = data.content
        return {"message": "Educational resources updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
