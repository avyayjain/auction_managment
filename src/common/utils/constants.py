import os
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig
from pathlib import Path

load_dotenv()

DB_CONNECTION_LINK = "postgresql://{}:{}@{}/{}".format(
    os.getenv("DATABASE_USER"),
    os.getenv("DATABASE_PASS"),
    os.getenv("DATABASE_URL"),
    os.getenv("DATABASE_DB"),
)

ASYNC_DB_CONNECTION_LINK = "postgresql+asyncpg://{}:{}@{}/{}".format(
    os.getenv("DATABASE_USER"),
    os.getenv("DATABASE_PASS"),
    os.getenv("DATABASE_URL"),
    os.getenv("DATABASE_DB"),
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


CONF = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_TLS=True,
    USE_CREDENTIALS=os.getenv("USE_CREDENTIALS"),
    TEMPLATE_FOLDER=Path("src/bid email").parent
)
