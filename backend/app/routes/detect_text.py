from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import logger
from app.services.text_detector import text_detector

router = APIRouter()

class TextRequest(BaseModel):
    text: str

@router.post("/text")
async def detect_text(request: TextRequest):
    if not request.text:
        throw_msg = "Text input cannot be empty"
        logger.warning(throw_msg)
        raise HTTPException(status_code=400, detail=throw_msg)
        
    logger.info(f"Received text for analysis: {request.text[:100]}...")
    
    try:
        result = await text_detector.analyze(request.text)
        return result
    except Exception as e:
        logger.error(f"Text detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during text analysis")
