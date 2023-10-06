from sqlalchemy import create_engine
from src.common.utils.constants import DB_CONNECTION_LINK
import src.db.database as db
from src.common.utils.pwd_helper import get_password_hash
from src.db.errors import (
    DatabaseErrors,
    DatabaseConnectionError,
    DataInjectionError,
    ItemNotFound,
)
from src.db.utils import DBConnection
from src.db.database import Users


def user_login(user_email: str):
    """

    :param user_email: User Email
    :return: None
    """
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:
                data = (
                    db.session.query(Users).filter(Users.email_id == user_email).first()
                )
                if not data:
                    raise ItemNotFound
                data.logout = False
                db.session.commit()
            except:
                raise DataInjectionError
            finally:
                db.session.close()
    except DatabaseErrors:
        raise
    except Exception:
        raise DatabaseConnectionError


def user_logout(user_email: str):
    """

    :param user_email: User Email
    :return: None
    """
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:
                data = (
                    db.session.query(Users).filter(Users.email_id == user_email).first()
                )
                if not data:
                    raise ItemNotFound
                data.logout = True
                db.session.commit()
            except:
                raise DataInjectionError
            finally:
                db.session.close()
    except DatabaseErrors:
        raise
    except Exception:
        raise DatabaseConnectionError
