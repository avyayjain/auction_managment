import os
from dotenv import load_dotenv

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



