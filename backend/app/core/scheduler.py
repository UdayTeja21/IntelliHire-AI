from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import User
from app.services.email_service import send_consistency_email
from datetime import datetime, timezone
import json

scheduler = BackgroundScheduler()

def send_daily_reminders():
    print("Running daily consistency reminder job...")
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        now = datetime.now(timezone.utc)
        for user in users:
            # Check preferences
            prefs = {}
            if user.preferences_json:
                try:
                    prefs = json.loads(user.preferences_json)
                except:
                    pass
            
            # Default to true if not set, or check if explicitly true
            wants_reminders = prefs.get('interviewReminders', True)
            if not wants_reminders:
                continue
            
            # Calculate consistency streak (days since signup)
            if user.created_at:
                # Assuming created_at is timezone-aware
                try:
                    delta = now.date() - user.created_at.date()
                except TypeError:
                    # In case of naive vs aware offset issues
                    delta = now.replace(tzinfo=None).date() - user.created_at.replace(tzinfo=None).date()
                streak_days = delta.days + 1
            else:
                streak_days = 1
                
            send_consistency_email(user.email, user.full_name or "Candidate", streak_days)
    except Exception as e:
        print(f"Error in daily reminders: {e}")
    finally:
        db.close()

def start_scheduler():
    # Run every day at 9:00 AM
    scheduler.add_job(
        send_daily_reminders,
        trigger=CronTrigger(hour=9, minute=0),
        id="daily_consistency_reminders",
        name="Send daily interview prep reminders",
        replace_existing=True
    )
    scheduler.start()
    print("Background scheduler started.")
