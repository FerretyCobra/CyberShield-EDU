from fastapi import APIRouter, File, UploadFile, HTTPException
from app.utils.logger import logger
from app.services.pdf_analyzer import pdf_analyzer

router = APIRouter()

@router.post("/pdf")
async def detect_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        throw_msg = "Only PDF files are supported"
        logger.warning(throw_msg)
        raise HTTPException(status_code=400, detail=throw_msg)
        
    logger.info(f"Received PDF for analysis: {file.filename}")
    
    try:
        content = await file.read()
        result = await pdf_analyzer.analyze(content, file.filename)
        return result
    except Exception as e:
        logger.error(f"PDF detection route failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during PDF document analysis")
    finally:
        await file.close()
