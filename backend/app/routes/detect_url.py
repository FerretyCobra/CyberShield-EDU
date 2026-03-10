from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import logger
from app.services.url_detector import url_detector

router = APIRouter()

class URLRequest(BaseModel):
    url: str

@router.post("/url")
async def detect_url(request: URLRequest):
    if not request.url:
        throw_msg = "URL input cannot be empty"
        logger.warning(throw_msg)
        raise HTTPException(status_code=400, detail=throw_msg)
        
    logger.info(f"Received URL for analysis: {request.url}")
    
    try:
        result = await url_detector.analyze(request.url)
        return result
    except Exception as e:
        logger.error(f"URL detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during URL analysis")
