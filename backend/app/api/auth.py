from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.db import models
from app.core.security import verify_password, get_password_hash, create_access_token
from pydantic import BaseModel
from typing import Any
import re

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

    @classmethod
    def __get_validators__(cls):
        yield cls.validate_email

    @classmethod
    def validate_email(cls, value: Any) -> str:
        if not isinstance(value, str):
            raise TypeError('email must be a string')
        value = value.strip()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
            raise ValueError('invalid email address')
        return value

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Trigger Welcome Email asynchronously
    import threading
    from app.services.email_service import send_welcome_email
    threading.Thread(
        target=send_welcome_email,
        args=(new_user.email, new_user.full_name)
    ).start()
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name
        }
    }

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }

class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # Don't reveal if email exists, just return ok
        return {"message": "If an account with that email exists, we have sent an OTP."}
    
    from datetime import datetime, timedelta
    import random
    
    otp = str(random.randint(100000, 999999))
    user.reset_otp = otp
    # SQLAlchemy will handle naive datetime to UTC with postgres
    user.reset_otp_expires = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    
    import threading
    from app.services.email_service import send_otp_email
    threading.Thread(
        target=send_otp_email,
        args=(user.email, user.full_name or "User", otp)
    ).start()
    
    return {"message": "If an account with that email exists, we have sent an OTP."}

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not user.reset_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    from datetime import datetime, timezone
    
    # Check expiry
    # Handle both naive and timezone-aware datetimes
    now = datetime.utcnow()
    if user.reset_otp_expires.tzinfo is not None:
        now = datetime.now(timezone.utc)
        
    if now > user.reset_otp_expires:
        raise HTTPException(status_code=400, detail="OTP has expired")
        
    if user.reset_otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    # valid OTP. clear it.
    user.reset_otp = None
    user.reset_otp_expires = None
    db.commit()
    
    from datetime import timedelta
    from jose import jwt
    from app.core.config import settings
    
    expire = datetime.utcnow() + timedelta(minutes=15)
    token = jwt.encode({"reset_email": user.email, "exp": expire}, settings.SECRET_KEY, algorithm="HS256")
    
    return {"token": token, "message": "OTP verified successfully"}

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    from jose import jwt, JWTError
    from app.core.config import settings
    
    try:
        payload = jwt.decode(request.token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("reset_email")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password successfully reset"}

