from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schema import ScanRecord, ScamKeyword, ThreatPattern
from app.utils.auth import get_current_admin
from app.config import settings
from app.services.awareness_service import awareness_service
import os
import json
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func

router = APIRouter(dependencies=[Depends(get_current_admin)])

class KeywordUpdate(BaseModel):
    keyword: str

class ResourceUpdate(BaseModel):
    content: dict

@router.get("/system/stats")
async def get_stats(db: Session = Depends(get_db)):
    total_scans = db.query(ScanRecord).count()
    scams_detected = db.query(ScanRecord).filter(ScanRecord.prediction == "scam").count()
    total_keywords = db.query(ScamKeyword).count()
    
    # Calculate time-series data for the last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_stats = db.query(
        func.date(ScanRecord.created_at).label('date'),
        func.count(ScanRecord.id).label('count')
    ).filter(ScanRecord.created_at >= seven_days_ago).group_by(func.date(ScanRecord.created_at)).all()
    
    # Format for frontend (Chart.js)
    history_data = [{"date": str(s.date), "count": s.count} for s in daily_stats]
    
    # Scan type distribution
    type_distribution = db.query(
        ScanRecord.scan_type,
        func.count(ScanRecord.id)
    ).group_by(ScanRecord.scan_type).all()
    
    type_data = {t[0]: t[1] for t in type_distribution}
    
    return {
        "total_scans": total_scans,
        "scams_detected": scams_detected,
        "active_models": 4,
        "active_rules": total_keywords,
        "system_status": "Healthy",
        "trends": history_data,
        "distribution": type_data
    }

@router.get("/patterns")
async def get_patterns(db: Session = Depends(get_db)):
    patterns = db.query(ThreatPattern).all()
    return {"patterns": patterns}

@router.post("/patterns")
async def create_pattern(data: dict, db: Session = Depends(get_db)):
    new_p = ThreatPattern(
        pattern_type=data.get("type", "keyword"),
        value=data.get("value"),
        risk_score=data.get("risk", 0.2),
        description=data.get("description", "Admin added pattern")
    )
    db.add(new_p)
    db.commit()
    # Reload engine memory
    from app.services.pattern_service import pattern_service
    pattern_service.load_from_db(db)
    return {"message": "Dynamic pattern added and deployed."}

@router.get("/keywords")
async def get_keywords(db: Session = Depends(get_db)):
    keywords = db.query(ScamKeyword).all()
    return {"keywords": [k.keyword for k in keywords]}

@router.post("/keywords")
async def add_keyword(data: dict, db: Session = Depends(get_db)):
    kw = data.get("keyword")
    if kw:
        db_kw = ScamKeyword(keyword=kw)
        db.add(db_kw)
        db.commit()
        # Sync with pattern engine
        from app.services.pattern_service import pattern_service
        pattern_service.load_from_db(db)
    return {"message": "Keyword added."}

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
