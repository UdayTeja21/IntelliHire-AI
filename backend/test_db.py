from app.db.database import SessionLocal
from app.db import models

try:
    db = SessionLocal()
    # test query
    res = db.query(models.User).all()
    print("Success:", res)
except Exception as e:
    print("Database Error:", e)
