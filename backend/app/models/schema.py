from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(20), default="student")
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    badges = Column(JSON, default=list) # List of badge names
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    scan_type = Column(String(20)) # text, url, pdf, image
    input_data = Column(Text)
    prediction = Column(String(20))
    confidence = Column(Float)
    reasoning = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ScamKeyword(Base):
    __tablename__ = "scam_keywords"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(100), unique=True, index=True)
    added_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AwarenessContent(Base):
    __tablename__ = "awareness_content"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50))
    title = Column(String(255))
    description = Column(Text)
    difficulty = Column(String(20))
    link = Column(String(500))
    examples = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text) # Text or image URL
    content_type = Column(String(20)) # text, image
    is_scam = Column(Boolean)
    explanation = Column(Text)
    difficulty = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
