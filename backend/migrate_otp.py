import sys
sys.path.append('.')
from app.db.database import engine
from sqlalchemy import text

def migrate_otp():
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
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

migrate_otp()
