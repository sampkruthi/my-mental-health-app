# scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlmodel import select
from db.session import get_session
from db.models import UserReminder
#from services.reminder_service import list_all_reminders, UserReminder
#from services.reminder_service import send_reminder_notification

scheduler = BackgroundScheduler()

REMINDER_TITLES = {
    "meditation": "🧘 Meditation Time",
    "journaling": "📝 Journaling Reminder", 
    "hydration": "💧 Stay Hydrated",
    "activity": "🏃 Activity Reminder",
}

# Stub: replace this with FCM/APNs or email logic
def send_reminder_notification(user_id: str, message: str):
    """Send push notification for a reminder."""
    from services.push_notification_service import send_push_to_user
    
    title = REMINDER_TITLES.get(reminder_type, "⏰ Reminder")
    
    logger.info(f"[Reminder] Sending to user {user_id}: {message}")
    print(f"[Reminder] To user {user_id}: {message}")
    
    success = send_push_to_user(
        user_id=user_id,
        title=title,
        body=message,
        data={"type": "reminder", "reminder_type": reminder_type}
    )
    
    if success:
        logger.info(f"[Reminder] Notification sent to {user_id}")
    else:
        logger.warning(f"[Reminder] Could not send notification to {user_id}")


def schedule_job(reminder: UserReminder):
    job_id = f"reminder_{reminder.id}"
    # Remove any existing job with this ID
    try:
        scheduler.remove_job(job_id)
    except Exception:
        pass
    # Create a cron trigger at the specified hour and minute every day
    trigger = CronTrigger(hour=reminder.hour, minute=reminder.minute)
    scheduler.add_job(
        func=send_reminder_notification,
        trigger=trigger,
        id=job_id,
        name=job_id,
        args=[reminder.user_id, reminder.message],
        replace_existing=True
    )

def unschedule_job(reminder_id: int):
    job_id = f"reminder_{reminder_id}"
    try:
        scheduler.remove_job(job_id)
        logger.info(f"[Scheduler] Unscheduled reminder {job_id}")
    except Exception:
        pass

def load_all_jobs():
    """
    Load and schedule all existing reminders on startup.
    """
    with get_session() as session:
        reminders = session.exec(select(UserReminder)).all()
        for rem in reminders:
            schedule_job(rem)
        logger.info(f"[Scheduler] Loaded {len(reminders)} reminders")


def start():
    scheduler.start()
    logger.info("[Scheduler] Started")

