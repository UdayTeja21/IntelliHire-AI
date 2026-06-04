import sys
sys.path.append('.')
from app.db.database import engine
from sqlalchemy import text

def alter_tables():
    with engine.connect() as conn:
        try:
            conn.execute(text('ALTER TABLE resumes ADD COLUMN file_name VARCHAR;'))
            print("Added file_name")
        except Exception as e:
            print("file_name error:", e)

        try:
            conn.execute(text('ALTER TABLE resumes ADD COLUMN recruiter_score FLOAT;'))
            print("Added recruiter_score")
        except Exception as e:
            print("recruiter_score error:", e)
            
        try:
            conn.execute(text('ALTER TABLE resumes ADD COLUMN technical_strength_score FLOAT;'))
            print("Added technical_strength_score")
        except Exception as e:
            print("technical_strength_score error:", e)
            
        try:
            conn.execute(text('ALTER TABLE resumes ADD COLUMN project_quality_score FLOAT;'))
            print("Added project_quality_score")
        except Exception as e:
            print("project_quality_score error:", e)
            
        try:
            conn.execute(text('ALTER TABLE resumes ADD COLUMN hiring_probability FLOAT;'))
            print("Added hiring_probability")
        except Exception as e:
            print("hiring_probability error:", e)

        try:
            conn.execute(text('ALTER TABLE interview_sessions ADD COLUMN overall_score FLOAT;'))
            print("Added overall_score to interview_sessions")
        except Exception as e:
            print("overall_score error:", e)
            
        try:
            conn.execute(text('ALTER TABLE users ADD COLUMN reset_otp VARCHAR;'))
            print("Added reset_otp to users")
        except Exception as e:
            print("reset_otp error:", e)

        try:
            conn.execute(text('ALTER TABLE users ADD COLUMN reset_otp_expires TIMESTAMP WITH TIME ZONE;'))
            print("Added reset_otp_expires to users")
        except Exception as e:
            print("reset_otp_expires error:", e)
            
        conn.commit()

alter_tables()
