from src.common.utils.send_notification import send_bid_notification_email, winner_email_template, loser_email_template, \
    send_email
from src.db.functions.celery_app import celery_app

@celery_app.task
def send_email_task(email: str, item_name: str, bid_amount: int):
    # Simulated email logic (replace with actual)
    send_bid_notification_email(email, item_name, bid_amount)
    print(f"Sending email to {email}: New bid of ₹{bid_amount} on item {item_name}")


@celery_app.task
def send_winner_email_task(email: str, item_name: str, amount: int, user_name: str, winner: bool = False):
    subject = "🎉 You won the auction!" if winner else f"Auction ended: {item_name}"
    html_content = (
        winner_email_template(item_name, amount, user_name)
        if winner else
        loser_email_template(item_name, amount, user_name)
    )

    # This function must handle sending email with HTML body
    send_email(to=email, subject=subject, html_body=html_content)