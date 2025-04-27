from src.common.utils.send_notification import send_bid_notification_email
from src.db.functions.celery_app import celery


@celery.task
def send_email_task(email: str, item_name: str, bid_amount: int):
    send_bid_notification_email(email, item_name, bid_amount)
