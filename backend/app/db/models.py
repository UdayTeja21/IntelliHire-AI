from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content_text = Column(Text)
    target_role = Column(String)
    ats_score = Column(Float)
    analysis_json = Column(Text) # Store JSON of strengths/weaknesses
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)
    type = Column(String)
    difficulty = Column(String)
    overall_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    questions = relationship("InterviewQuestion", back_populates="session")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    question_text = Column(Text)
    category = Column(String)
    candidate_answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback_json = Column(Text, nullable=True)
    
    session = relationship("InterviewSession", back_populates="questions")
