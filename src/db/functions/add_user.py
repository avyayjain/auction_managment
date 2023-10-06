from src.common.utils.constants import DB_CONNECTION_LINK
from src.common.utils.pwd_helper import get_password_hash
from src.db.database import Users
from src.db.errors import DataInjectionError, DatabaseErrors, DatabaseConnectionError
from src.db.utils import DBConnection


def create_user(user_type: str, user_email: str, password: str, user_name: str):
    """
    :param user_type: type of user admin or user
    :param user_email: User Email
    :param password: User Password
    :return: None
    """
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:
                user = Users(
                    name=user_name,
                    email_id=user_email,
                    hashed_password=get_password_hash(password),
                    user_type=user_type,
                    logout=True,
                )
                db.session.add(user)
                db.session.commit()
                return {"message": "user added successfully"}
            except Exception as e:
                print(e)
                raise DataInjectionError
            finally:
                db.session.close()

    except DatabaseErrors:
        raise
    except Exception as e:
        print(e)
        raise DatabaseConnectionError


# def find_user_id(email_id: str):
#     try:
#         with DBConnection(DB_CONNECTION_LINK, False) as db:
#             try:
#                 user = (db.session.query(Users).filter(Users.email_id == email_id).first())
#
#                 user_id = user.user_id
#                 return user_id
#
#             finally:
#                 db.session.close()
#     except Exception as e:
#         print(e)
#         raise DataInjectionError
#
#     except DatabaseErrors:
#         raise
#     except Exception as e:
#         print(e)
#         raise DatabaseConnectionError
