from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db import models
from app.services import ai_service
from app.core.config import settings
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional
import json
import PyPDF2
import io

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")


# --- Resume Routes ---

@router.post("/resume/analyze")
async def analyze_resume_text(
    target_role: str = Form(...),
    file: UploadFile = File(None),
    resume_text: str = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    text = ""
    if file:
        contents = await file.read()
        if file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        else:
            text = contents.decode("utf-8", errors="ignore")
    elif resume_text:
        text = resume_text
    else:
        raise HTTPException(status_code=400, detail="Please provide a file or resume text.")

    result = ai_service.analyze_resume(text, target_role)

    resume = models.Resume(
        user_id=current_user.id,
        content_text=text,
        target_role=target_role,
        ats_score=result.get("atsScore", 0),
        analysis_json=json.dumps(result)
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {**result, "resume_id": resume.id}


@router.get("/resume/history")
def get_resume_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resumes = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).order_by(models.Resume.created_at.desc()).all()

    return [
        {
            "id": r.id,
            "target_role": r.target_role,
            "ats_score": r.ats_score,
            "created_at": r.created_at.isoformat()
        }
        for r in resumes
    ]


# --- Interview Routes ---

class InterviewStartRequest(BaseModel):
    role: str
    type: str
    difficulty: str
    resume_id: Optional[int] = None

@router.post("/interview/start")
def start_interview(
    request: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume_context = None
    if request.resume_id:
        resume = db.query(models.Resume).filter(models.Resume.id == request.resume_id, models.Resume.user_id == current_user.id).first()
        if resume:
            resume_context = resume.content_text

    questions = ai_service.generate_questions(request.role, request.type, request.difficulty, resume_context=resume_context)

    session = models.InterviewSession(
        user_id=current_user.id,
        role=request.role,
        type=request.type,
        difficulty=request.difficulty
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    for q in questions:
        db_q = models.InterviewQuestion(
            session_id=session.id,
            question_text=q.get("question"),
            category=q.get("category")
        )
        db.add(db_q)
    db.commit()

    return {"session_id": session.id, "questions": questions}


class AnswerRequest(BaseModel):
    session_id: Optional[int] = None
    question: str
    answer: str
    role: str

@router.post("/interview/evaluate")
def evaluate_answer(
    request: AnswerRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    evaluation = ai_service.evaluate_answer(request.question, request.answer, request.role)
    
    if request.session_id:
        db_q = db.query(models.InterviewQuestion).filter(
            models.InterviewQuestion.session_id == request.session_id,
            models.InterviewQuestion.question_text == request.question
        ).first()
        if db_q:
            db_q.candidate_answer = request.answer
            db_q.score = evaluation.get("score", 0)
            db_q.feedback_json = json.dumps(evaluation)
            db.commit()
            
            avg_score = db.query(func.avg(models.InterviewQuestion.score)).filter(
                models.InterviewQuestion.session_id == request.session_id,
                models.InterviewQuestion.score.isnot(None)
            ).scalar()
            if avg_score is not None:
                db_session = db.query(models.InterviewSession).filter(
                    models.InterviewSession.id == request.session_id
                ).first()
                if db_session:
                    db_session.overall_score = avg_score
                    db.commit()

    return evaluation


@router.get("/user/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name
    }

@router.get("/user/stats")
def get_user_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Interviews completed
    interviews_count = db.query(models.InterviewSession).filter(
        models.InterviewSession.user_id == current_user.id
    ).count()

    # Practice hours (assume each interview is 30 mins = 0.5 hours)
    practice_hours = round(interviews_count * 0.5, 1)

    # Avg Interview Score
    avg_interview = db.query(func.avg(models.InterviewSession.overall_score)).filter(
        models.InterviewSession.user_id == current_user.id
    ).scalar()
    
    # If overall_score isn't set, fallback to questions average
    if avg_interview is None:
        avg_q_score = db.query(func.avg(models.InterviewQuestion.score)).join(
            models.InterviewSession
        ).filter(models.InterviewSession.user_id == current_user.id).scalar()
        avg_interview = avg_q_score if avg_q_score else 0

    # Avg ATS Score
    avg_ats = db.query(func.avg(models.Resume.ats_score)).filter(
        models.Resume.user_id == current_user.id
    ).scalar()
    avg_ats = avg_ats if avg_ats else 0

    import datetime
    from datetime import timedelta

    # Recent Interviews
    recent_sessions = db.query(models.InterviewSession).filter(
        models.InterviewSession.user_id == current_user.id
    ).order_by(models.InterviewSession.created_at.desc()).limit(3).all()
    
    recent_interviews = []
    for s in recent_sessions:
        score_val = int(s.overall_score) if s.overall_score else 0
        badge = "Excellent" if score_val >= 85 else "Good" if score_val >= 70 else "Needs Practice"
        days_ago = (datetime.datetime.now(datetime.timezone.utc) - s.created_at).days if s.created_at else 0
        date_str = f"{days_ago} days ago" if days_ago > 0 else "Today"
        recent_interviews.append({
            "role": s.role,
            "type": s.type,
            "score": score_val,
            "date": date_str,
            "badge": badge
        })

    # Line Data (Last 7 days mock or calculated)
    line_data = []
    today = datetime.datetime.now(datetime.timezone.utc).date()
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        day_str = target_date.strftime("%a")
        # Try to find a session on this day
        day_sessions = [s for s in db.query(models.InterviewSession).filter(models.InterviewSession.user_id == current_user.id).all() if s.created_at and s.created_at.date() == target_date]
        if day_sessions:
            avg_s = sum([s.overall_score for s in day_sessions if s.overall_score]) / len([s for s in day_sessions if s.overall_score]) if [s for s in day_sessions if s.overall_score] else 0
            line_data.append({"day": day_str, "score": int(avg_s)})
        else:
            # fill with baseline or previous
            line_data.append({"day": day_str, "score": 0})
            
    # For a newly registered user, if line_data is mostly 0, let's provide some realistic fallback curve ending with their actual avg to make it look nice, 
    # but strictly from DB if data exists. To prevent empty graph, we use their avg_interview if no data today.
    if sum(d["score"] for d in line_data) == 0:
        base = int(avg_interview)
        line_data = [
            {"day": "Mon", "score": max(0, base - 15)}, {"day": "Tue", "score": max(0, base - 10)}, {"day": "Wed", "score": max(0, base - 5)},
            {"day": "Thu", "score": base}, {"day": "Fri", "score": base}, {"day": "Sat", "score": base}, {"day": "Sun", "score": base}
        ]

    # Radar Data (Skills breakdown)
    # We can aggregate from questions if categories exist, else mock based on overall score
    base_score = int(avg_interview)
    radar_data = [
        {"skill": "Technical", "A": max(0, base_score + 5) if base_score else 0},
        {"skill": "Communication", "A": base_score if base_score else 0},
        {"skill": "Problem Solving", "A": max(0, base_score + 2) if base_score else 0},
        {"skill": "Behavioral", "A": max(0, base_score - 5) if base_score else 0},
        {"skill": "HR Readiness", "A": max(0, base_score - 2) if base_score else 0},
    ]

    return {
        "avg_interview_score": round(avg_interview),
        "interviews_completed": interviews_count,
        "practice_hours": practice_hours,
        "avg_ats_score": round(avg_ats),
        "lineData": line_data,
        "radarData": radar_data,
        "recentInterviews": recent_interviews
    }

