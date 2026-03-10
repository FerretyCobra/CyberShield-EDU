from fastapi import APIRouter, File, UploadFile, HTTPException
from app.utils.logger import logger
from app.services.image_ocr import image_ocr

router = APIRouter()

@router.post("/image")
async def detect_image(file: UploadFile = File(...)):
    # Validate file extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".bmp"}
    if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
        throw_msg = f"Unsupported image format. Allowed: {', '.join(allowed_extensions)}"
        logger.warning(throw_msg)
        raise HTTPException(status_code=400, detail=throw_msg)
        
    logger.info(f"Received image for OCR analysis: {file.filename}")
    
    try:
        content = await file.read()
        result = await image_ocr.analyze(content, file.filename)
        return result
    except Exception as e:
        logger.error(f"Image detection route failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during image OCR analysis")
    finally:
        await file.close()
