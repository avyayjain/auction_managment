from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from src.common.utils.constants import CONF


async def send_bid_notification_email(email_to: str, item_name: str, bid_amount: int):
    subject = f"New bid on item you bid: {item_name}"
    body = f"""
    <p>Someone has placed a new bid of {bid_amount} on the item <b>{item_name}</b> that you have previously bid on.</p>
    <p>Visit the auction site to see the latest updates.</p>
    """
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype="html"
    )
    fm = FastMail(CONF)
    await fm.send_message(message)