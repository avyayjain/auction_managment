from fastapi_mail import FastMail, MessageSchema
from src.common.utils.constants import CONF


async def send_bid_notification_email(email_to: str, item_name: str, bid_amount: int):
    message = MessageSchema(
        subject=f"New bid on item you bid: {item_name}",
        recipients=[email_to],
        template_body={
            "item_name": item_name,
            "bid_amount": bid_amount
        },
        subtype="html"
    )
    fm = FastMail(CONF)
    await fm.send_message(message, template_name="bid_email.html")

