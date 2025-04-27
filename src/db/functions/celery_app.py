from celery import Celery
from src.common.utils.send_notification import send_bid_notification_email

celery = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

