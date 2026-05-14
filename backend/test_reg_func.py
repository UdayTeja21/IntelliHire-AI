from app.db.database import SessionLocal
from app.db import models
from app.api.auth import register, UserCreate

db = SessionLocal()
try:
    user_data = UserCreate(email="test2@example.com", password="password123", full_name="Test User 2")
    res = register(user_data, db=db)
    print("Success:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
