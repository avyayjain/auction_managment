import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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

def winner_email_template(item_name: str, amount: int, user_name: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #2e6c80;">🎉 Congratulations, {user_name}!</h2>
        <p>You have <strong>won</strong> the auction for:</p>
        <ul>
            <li><strong>Item:</strong> {item_name}</li>
            <li><strong>Winning Bid:</strong> ₹{amount}</li>
        </ul>
        <p style="margin-top:20px;">Thank you for participating. We’ll be in touch with delivery details soon!</p>
    </body>
    </html>
    """

def loser_email_template(item_name: str, amount: int, user_name: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #d9534f;">Auction Ended: {item_name}</h2>
        <p>Hi {user_name},</p>
        <p>The auction has ended. Unfortunately, your bid was not the highest.</p>
        <ul>
            <li><strong>Winning Bid:</strong> ₹{amount}</li>
        </ul>
        <p>Better luck next time! Feel free to explore other active auctions.</p>
    </body>
    </html>
    """


def send_email(to: str, subject: str, html_body: str):
    from_email = os.getenv("MAIL_FROM")
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to

    part = MIMEText(html_body, "html")
    msg.attach(part)

    with smtplib.SMTP("smtp.yourprovider.com", 587) as server:
        server.starttls()
        server.login("your_username", "your_password")
        server.sendmail(from_email, to, msg.as_string())