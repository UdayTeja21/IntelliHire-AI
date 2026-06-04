from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db import models
from app.services.ai import core as ai_service
from app.core.config import settings
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional
import json
import PyPDF2
import io
import datetime
from datetime import timedelta
import logging

# Configure logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

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


def extract_text_from_pdf(file_bytes: bytes, max_chars: int = 15000) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"
            if len(text) > max_chars:
                logger.warning(f"PDF exceeds {max_chars} chars. Truncating to prevent API overload.")
                text = text[:max_chars]
                break
        return text.strip()
    except Exception as e:
        logger.error(f"Failed to parse PDF: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")


# --- Resume Routes ---

@router.post("/resume/analyze")
async def analyze_resume_text(
    target_role: str = Form(...),
    experience_level: str = Form("Fresher (0-1 years)"),
    file: UploadFile = File(None),
    resume_text: str = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    MAX_FILE_SIZE_MB = 5
    MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

    text = ""
    file_name = None
    if file:
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            logger.warning(f"File size exceeded {MAX_FILE_SIZE_MB}MB limit.")
            raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB.")
            
        file_name = file.filename
        if file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        else:
            text = contents.decode("utf-8", errors="ignore")
    elif resume_text:
        text = resume_text
    else:
        raise HTTPException(status_code=400, detail="Please provide a file or resume text.")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Extracted text is empty. Please provide a valid resume.")

    logger.info(f"Starting resume analysis for user {current_user.email} (Role: {target_role})")
    
    start_time = datetime.datetime.now()
    # Run the synchronous, blocking AI service in a threadpool to prevent the FastAPI event loop from freezing
    result = await run_in_threadpool(ai_service.analyze_resume, text, target_role, experience_level)
    elapsed = (datetime.datetime.now() - start_time).total_seconds()
    
    logger.info(f"Resume analysis completed in {elapsed:.2f} seconds.")

    # Note: New metrics (communication, skillRelevance, resumeStructure) are stored in analysis_json
    resume = models.Resume(
        user_id=current_user.id,
        file_name=file_name,
        content_text=text,
        target_role=target_role,
        ats_score=result.get("atsScore", 0),
        recruiter_score=result.get("recruiterScore", 0),
        technical_strength_score=result.get("technicalStrengthScore", 0),
        project_quality_score=result.get("projectQualityScore", 0),
        hiring_probability=result.get("hiringProbability", 0),
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

    # Expand the history to include the new metrics from analysis_json
    response_data = []
    for r in resumes:
        analysis = json.loads(r.analysis_json) if r.analysis_json else {}
        response_data.append({
            "id": r.id,
            "file_name": r.file_name,
            "target_role": r.target_role,
            "ats_score": r.ats_score,
            "recruiter_score": r.recruiter_score,
            "technical_strength_score": r.technical_strength_score,
            "project_quality_score": r.project_quality_score,
            "hiring_probability": r.hiring_probability,
            "communication": analysis.get("communication", 0),
            "skill_relevance": analysis.get("skillRelevance", 0),
            "resume_structure": analysis.get("resumeStructure", 0),
            "created_at": r.created_at.isoformat()
        })
    return response_data


# --- Interview Routes ---

@router.post("/interview/start")
async def start_interview(
    role: str = Form(...),
    type: str = Form(...),
    difficulty: str = Form(...),
    experience: str = Form("Junior (1-3 yrs)"),
    domain: str = Form("General / Tech"),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    combined_role = f"{role} | Experience: {experience} | Domain: {domain}"
    resume_context = None
    if file:
        contents = await file.read()
        if file.filename.endswith(".pdf"):
            resume_context = extract_text_from_pdf(contents)
        else:
            resume_context = contents.decode("utf-8", errors="ignore")
    else:
        # Fetch the most recent resume for the user if no new file is uploaded
        latest_resume = db.query(models.Resume).filter(
            models.Resume.user_id == current_user.id
        ).order_by(models.Resume.created_at.desc()).first()
        if latest_resume:
            resume_context = latest_resume.content_text

    # Fetch past questions for this user/role/type to avoid repetition
    past_sessions = db.query(models.InterviewSession.id).filter(
        models.InterviewSession.user_id == current_user.id,
        models.InterviewSession.role == combined_role,
        models.InterviewSession.type == type
    ).order_by(models.InterviewSession.created_at.desc()).limit(50).all()
    
    avoid_questions = []
    if past_sessions:
        session_ids = [s[0] for s in past_sessions]
        past_qs = db.query(models.InterviewQuestion.question_text).filter(
            models.InterviewQuestion.session_id.in_(session_ids)
        ).order_by(models.InterviewQuestion.id.desc()).limit(500).all()
        avoid_questions = [q[0] for q in past_qs]

    # Generate only the first question
    questions = ai_service.generate_questions(combined_role, type, difficulty, count=1, resume_context=resume_context, avoid_questions=avoid_questions)
    questions = questions[:1] # Force exactly 1 question to prevent count logic drift

    session = models.InterviewSession(
        user_id=current_user.id,
        role=combined_role,
        type=type,
        difficulty=difficulty,
        resume_text=resume_context
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


@router.post("/interview/transcribe")
async def transcribe_speech(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    from app.services.ai import groq_service
    contents = await file.read()
    text = await run_in_threadpool(groq_service.transcribe_audio, contents, file.filename)
    return {"text": text}


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
    
    next_question = None
    if request.session_id:
        # Save candidate's answer and score
        db_q = db.query(models.InterviewQuestion).filter(
            models.InterviewQuestion.session_id == request.session_id,
            models.InterviewQuestion.question_text == request.question
        ).first()
        if db_q:
            db_q.candidate_answer = request.answer
            db_q.score = evaluation.get("score", 0)
            db_q.feedback_json = json.dumps(evaluation)
            db.commit()
            
            # Update overall session score
            avg_score = db.query(func.avg(models.InterviewQuestion.score)).filter(
                models.InterviewQuestion.session_id == request.session_id,
                models.InterviewQuestion.score.isnot(None)
            ).scalar()
            
            db_session = db.query(models.InterviewSession).filter(
                models.InterviewSession.id == request.session_id
            ).first()
            
            if db_session:
                if avg_score is not None:
                    db_session.overall_score = avg_score
                    db.commit()
                
                # Fetch all questions in this session for history
                all_qs = db.query(models.InterviewQuestion).filter(
                    models.InterviewQuestion.session_id == request.session_id
                ).order_by(models.InterviewQuestion.id).all()
                
                history = [
                    {"question": q.question_text, "answer": q.candidate_answer}
                    for q in all_qs if q.candidate_answer is not None
                ]
                
                # We limit the interview to 10 questions total.
                # If we have less than 10 questions in history, generate a new one.
                if len(history) < 10:
                    try:
                        next_q_data = ai_service.generate_next_question(
                            role=db_session.role,
                            type=db_session.type,
                            difficulty=db_session.difficulty,
                            history=history,
                            resume_context=db_session.resume_text
                        )
                        next_question = next_q_data
                        
                        # Save the new question to DB immediately
                        new_db_q = models.InterviewQuestion(
                            session_id=db_session.id,
                            question_text=next_q_data.get("question"),
                            category=next_q_data.get("category")
                        )
                        db.add(new_db_q)
                        db.commit()
                    except Exception as e:
                        logger.error(f"Failed to generate next question: {str(e)}")
                else:
                    # Interview completed (10 questions reached)
                    import threading
                    from app.services.pdf_service import generate_interview_pdf
                    from app.services.email_service import send_completion_email
                    
                    prefs = {}
                    if current_user.preferences_json:
                        try:
                            prefs = json.loads(current_user.preferences_json)
                        except:
                            pass
                            
                    if prefs.get("emailAlerts", True):
                        try:
                            pdf_bytes = generate_interview_pdf(db_session, all_qs)
                            threading.Thread(
                                target=send_completion_email,
                                args=(current_user.email, current_user.full_name or "Candidate", pdf_bytes)
                            ).start()
                        except Exception as e:
                            logger.error(f"Failed to send completion email: {str(e)}")

    return {"evaluation": evaluation, "next_question": next_question}


@router.get("/user/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    prefs = {}
    if current_user.preferences_json:
        try:
            prefs = json.loads(current_user.preferences_json)
        except:
            pass
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "target_role": current_user.target_role,
        "preferences": prefs
    }

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    preferences: Optional[dict] = None

@router.put("/user/profile")
def update_user_profile(
    request: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if request.full_name is not None:
        current_user.full_name = request.full_name
    if request.target_role is not None:
        current_user.target_role = request.target_role
    if request.preferences is not None:
        current_user.preferences_json = json.dumps(request.preferences)
    
    db.commit()
    return {"message": "Profile updated successfully"}

class UserPasswordUpdate(BaseModel):
    new_password: str

@router.put("/user/password")
def update_password(
    request: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    from app.core.security import get_password_hash
    
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    # Trigger Password Change Security Email asynchronously
    import threading
    from app.services.email_service import send_password_change_email
    threading.Thread(
        target=send_password_change_email,
        args=(current_user.email, current_user.full_name or "User")
    ).start()
    
    return {"message": "Password updated successfully"}

@router.get("/interview/history")
def get_interview_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    sessions = db.query(models.InterviewSession).filter(
        models.InterviewSession.user_id == current_user.id
    ).order_by(models.InterviewSession.created_at.desc()).all()
    
    response_data = []
    for s in sessions:
        score_val = int(s.overall_score) if s.overall_score else 0
        response_data.append({
            "id": s.id,
            "role": s.role,
            "type": s.type,
            "difficulty": s.difficulty,
            "score": score_val,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })
    return response_data

@router.get("/interview/{session_id}/report")
def generate_interview_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = db.query(models.InterviewSession).filter(
        models.InterviewSession.id == session_id,
        models.InterviewSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    questions = db.query(models.InterviewQuestion).filter(
        models.InterviewQuestion.session_id == session_id
    ).order_by(models.InterviewQuestion.id).all()
    
    q_data = []
    total_score = 0
    answered_count = 0
    
    for q in questions:
        if q.score:
            total_score += q.score
            answered_count += 1
        
        evaluation = json.loads(q.feedback_json) if q.feedback_json else {}
        
        q_data.append({
            "question": q.question_text,
            "category": q.category,
            "answer": q.candidate_answer,
            "score": q.score,
            "evaluation": evaluation
        })
    
    avg_score = total_score / answered_count if answered_count > 0 else 0
    
    # Calculate overall confidence
    confidences = [q["evaluation"].get("confidenceScore", 0) for q in q_data if q.get("evaluation")]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0

    report = {
        "user_info": {
            "name": current_user.full_name,
            "email": current_user.email
        },
        "interview_info": {
            "role": session.role,
            "type": session.type,
            "difficulty": session.difficulty,
            "created_at": session.created_at.isoformat(),
            "overall_score": session.overall_score,
            "overall_confidence": round(avg_confidence, 1)
        },
        "performance": {
            "average_score": round(avg_score, 1),
            "questions_answered": answered_count,
            "total_questions": len(questions),
            "completion_rate": round((answered_count / len(questions)) * 100, 1) if questions else 0
        },
        "questions": q_data,
        "strengths": [],
        "weaknesses": [],
        "recommendations": []
    }
    
    all_strengths = []
    all_weaknesses = []
    
    for q in q_data:
        if q["evaluation"]:
            all_strengths.extend(q["evaluation"].get("strengths", []))
            all_weaknesses.extend(q["evaluation"].get("weaknesses", []))
    
    from collections import Counter
    report["strengths"] = [item for item, count in Counter(all_strengths).most_common(3)]
    report["weaknesses"] = [item for item, count in Counter(all_weaknesses).most_common(3)]
    report["recommendations"] = ["Practice more technical questions", "Work on communication clarity", "Focus on problem-solving approach"]
    
    return report

@router.get("/resume/{resume_id}/report")
def generate_resume_report(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    analysis = json.loads(resume.analysis_json) if resume.analysis_json else {}
    
    report = {
        "user_info": {
            "name": current_user.full_name,
            "email": current_user.email
        },
        "resume_info": {
            "target_role": resume.target_role,
            "created_at": resume.created_at.isoformat(),
            "word_count": len(resume.content_text.split())
        },
        "scores": {
            "ats_score": resume.ats_score,
            "recruiter_score": resume.recruiter_score,
            "technical_strength": resume.technical_strength_score,
            "project_quality": resume.project_quality_score,
            "communication": analysis.get("communication", 0),
            "skill_relevance": analysis.get("skillRelevance", 0),
            "resume_structure": analysis.get("resumeStructure", 0),
            "hiring_probability": resume.hiring_probability
        },
        "analysis": analysis,
        "recommendations": analysis.get("improvementRoadmap", []),
        "learning_path": analysis.get("learningPath", [])
    }
    
    return report

@router.get("/user/stats")
def get_user_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interviews_count = db.query(models.InterviewSession).filter(
        models.InterviewSession.user_id == current_user.id
    ).count()

    practice_hours = round(interviews_count * 0.5, 1)

    avg_interview = db.query(func.avg(models.InterviewSession.overall_score)).filter(
        models.InterviewSession.user_id == current_user.id
    ).scalar()
    
    if avg_interview is None:
        avg_q_score = db.query(func.avg(models.InterviewQuestion.score)).join(
            models.InterviewSession
        ).filter(models.InterviewSession.user_id == current_user.id).scalar()
        avg_interview = avg_q_score if avg_q_score else 0

    avg_technical = db.query(func.avg(models.Resume.technical_strength_score)).filter(
        models.Resume.user_id == current_user.id
    ).scalar()
    avg_technical = avg_technical if avg_technical else 0

    avg_ats = db.query(func.avg(models.Resume.ats_score)).filter(
        models.Resume.user_id == current_user.id
    ).scalar()
    avg_ats = avg_ats if avg_ats else 0

    avg_project = db.query(func.avg(models.Resume.project_quality_score)).filter(
        models.Resume.user_id == current_user.id
    ).scalar()
    avg_project = avg_project if avg_project else 0

    avg_hiring = db.query(func.avg(models.Resume.hiring_probability)).filter(
        models.Resume.user_id == current_user.id
    ).scalar()
    avg_hiring = avg_hiring if avg_hiring else 0

    # For new metrics, we compute avg from JSON (a bit slow but works for this scale)
    all_resumes = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).all()
    avg_comm, avg_skill = 0, 0
    extracted_skills = []
    missing_skills = []
    
    if all_resumes:
        comm_sum, skill_sum, count = 0, 0, 0
        
        # Get skills from the most recent resume that has analysis_json
        for r in all_resumes:
            if r.analysis_json:
                data = json.loads(r.analysis_json)
                if "skillAnalysis" in data and not extracted_skills:
                    extracted_skills = data["skillAnalysis"].get("technicalSkills", [])
                    missing_skills = data["skillAnalysis"].get("missingCriticalSkills", [])
                
                comm_sum += data.get("communication", 0)
                skill_sum += data.get("skillRelevance", 0)
                count += 1
        if count > 0:
            avg_comm = comm_sum / count
            avg_skill = skill_sum / count

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

    line_data = []
    today = datetime.datetime.now(datetime.timezone.utc).date()
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        day_str = target_date.strftime("%a")
        day_sessions = [s for s in db.query(models.InterviewSession).filter(models.InterviewSession.user_id == current_user.id).all() if s.created_at and s.created_at.date() == target_date]
        if day_sessions:
            avg_s = sum([s.overall_score for s in day_sessions if s.overall_score]) / len([s for s in day_sessions if s.overall_score]) if [s for s in day_sessions if s.overall_score] else 0
            line_data.append({"day": day_str, "score": int(avg_s)})
        else:
            line_data.append({"day": day_str, "score": 0})
            
    if sum(d["score"] for d in line_data) == 0:
        base = int(avg_interview)
        line_data = [
            {"day": "Mon", "score": max(0, base - 15)}, {"day": "Tue", "score": max(0, base - 10)}, {"day": "Wed", "score": max(0, base - 5)},
            {"day": "Thu", "score": base}, {"day": "Fri", "score": base}, {"day": "Sat", "score": base}, {"day": "Sun", "score": base}
        ]

    base_score = int(avg_interview)
    radar_data = [
        {"skill": "Technical", "A": max(0, int(avg_technical))},
        {"skill": "Communication", "A": int(avg_comm) if avg_comm else (base_score if base_score else 0)},
        {"skill": "Skill Match", "A": int(avg_skill) if avg_skill else max(0, base_score + 2) if base_score else 0},
        {"skill": "Project Quality", "A": max(0, int(avg_project))},
        {"skill": "Hiring Readiness", "A": max(0, int(avg_hiring))},
    ]

    technical_trend = []
    project_trend = []
    hiring_trend = []
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        day_str = target_date.strftime("%a")
        
        day_technical = db.query(func.avg(models.Resume.technical_strength_score)).filter(
            models.Resume.user_id == current_user.id,
            func.date(models.Resume.created_at) == target_date
        ).scalar()
        technical_trend.append({"day": day_str, "score": int(day_technical) if day_technical else 0})
        
        day_project = db.query(func.avg(models.Resume.project_quality_score)).filter(
            models.Resume.user_id == current_user.id,
            func.date(models.Resume.created_at) == target_date
        ).scalar()
        project_trend.append({"day": day_str, "score": int(day_project) if day_project else 0})
        
        day_hiring = db.query(func.avg(models.Resume.hiring_probability)).filter(
            models.Resume.user_id == current_user.id,
            func.date(models.Resume.created_at) == target_date
        ).scalar()
        hiring_trend.append({"day": day_str, "score": int(day_hiring) if day_hiring else 0})

    return {
        "avg_interview_score": round(avg_interview),
        "interviews_completed": interviews_count,
        "practice_hours": practice_hours,
        "avg_ats_score": round(avg_ats),
        "avg_technical_score": round(avg_technical),
        "avg_project_score": round(avg_project),
        "avg_hiring_probability": round(avg_hiring),
        "avg_communication_score": round(avg_comm),
        "avg_skill_relevance": round(avg_skill),
        "lineData": line_data,
        "radarData": radar_data,
        "technicalTrend": technical_trend,
        "projectTrend": project_trend,
        "hiringTrend": hiring_trend,
        "recentInterviews": recent_interviews,
        "extractedSkills": extracted_skills,
        "missingSkills": missing_skills
    }

