import sys
sys.path.append('.')
from app.db.database import SessionLocal
from app.db.models import Resume

db = SessionLocal()
try:
    resume = Resume(
        user_id=1,
        content_text="Sample text",
        target_role="Software Engineer",
        ats_score=86,
        recruiter_score=81,
        technical_strength_score=0,
        project_quality_score=0,
        hiring_probability=76,
        analysis_json='{"test": 123}'
    )
    db.add(resume)
    db.commit()
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
