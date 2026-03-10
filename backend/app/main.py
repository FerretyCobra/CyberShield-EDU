from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routes import detect_text, detect_url, detect_pdf, detect_image, admin
from app.config import settings
from app.utils.logger import logger

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend for student scam detection platform",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {exc} | Path: {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Our team has been notified."},
    )

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(detect_text.router, prefix=f"{settings.API_V1_STR}/detect", tags=["detection"])
app.include_router(detect_url.router, prefix=f"{settings.API_V1_STR}/detect", tags=["detection"])
app.include_router(detect_pdf.router, prefix=f"{settings.API_V1_STR}/detect", tags=["detection"])
app.include_router(detect_image.router, prefix=f"{settings.API_V1_STR}/detect", tags=["detection"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])

from app.services.awareness_service import awareness_service

@app.get("/", tags=["Health"])
async def root():
    return {"message": "CyberShield EDU API is running", "version": "1.0.0"}

@app.get("/awareness", tags=["Awareness"])
async def get_awareness_content():
    """Return educational content and wellness tips for students."""
    content_dict = awareness_service.get_all_content()
    # The frontend expects an array to .map() over, so we convert the dict mapping
    content_list = []
    for key, value in content_dict.items():
        item = value.copy()
        item["id"] = key
        content_list.append(item)
    return content_list

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
