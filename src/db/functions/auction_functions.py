from datetime import datetime
from src.common.utils.constants import DB_CONNECTION_LINK
from src.common.utils.user_defined_errors import TimeExceedError, LessBidError
from src.db.database import ItemInformation, Users
from src.db.errors import DataInjectionError, DatabaseErrors, DatabaseConnectionError
from src.db.utils import DBConnection


# def add_bid(item_id: int, user_id: int, current_bid: int):
#     try:
#         current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#         with DBConnection(DB_CONNECTION_LINK, False) as db:
#             try:
#                 item = db.session.query(ItemInformation).filter(ItemInformation.item_id == item_id).first()
#                 date = datetime.strptime(item.end_time.strftime("%Y-%m-%d %H:%M:%S"), '%Y-%m-%d %H:%M:%S')
#                 current_time = datetime.strptime(current_time, '%Y-%m-%d %H:%M:%S')
#                 if date <= current_time:
#                     raise TimeExceedError(message="Time Exceed")
#                 elif item.current_bid >= current_bid:
#                     raise LessBidError(message="Current bid is less than previous bid")
#                 else:
#                     item.current_bid = current_bid
#                     item.user_id = user_id
#                     db.session.commit()
#                     return item.item_id, item.current_bid, item.user_id
#
#             except Exception as e:
#                 print(e)
#                 raise DataInjectionError
#             finally:
#                 db.session.close()
#
#     except DatabaseErrors:
#         raise
#     except Exception as e:
#         print(e)
#         raise DatabaseConnectionError


# def item_winner(item_id: int):
#     try:
#         current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#         with DBConnection(DB_CONNECTION_LINK, False) as db:
#             try:
#                 item = db.session.query(ItemInformation).filter(ItemInformation.item_id == item_id).first()
#                 user = db.session.query(Users).filter(Users.user_id == item.user_id).first()
#                 date = datetime.strptime(item.end_time.strftime("%Y-%m-%d %H:%M:%S"), '%Y-%m-%d %H:%M:%S')
#                 current_time = datetime.strptime(current_time, '%Y-%m-%d %H:%M:%S')
#                 print(current_time)
#                 if date <= current_time:
#                     item.won_by = item.user_id
#                     item.status = False
#                     db.session.commit()
#                     item_details = {
#                         "message": "item auction is over",
#                         "Winner": user.name,
#                         "item_id": item.item_id,
#                         "item_name": item.name,
#                         "highest_bid": item.current_bid,
#                     }
#                     return item_details
#                 else:
#                     return {
#                         "message": "item auction is not over"
#                     }
#
#             except Exception as e:
#                 print(e)
#                 raise DataInjectionError
#             finally:
#                 db.session.close()
#
#     except DatabaseErrors:
#         raise
#     except Exception as e:
#         print(e)
#         raise DatabaseConnectionError



