from sqlalchemy.sql.functions import now
from src.common.utils.constants import DB_CONNECTION_LINK
from src.db.database import ItemInformation
from src.db.errors import DataInjectionError, DatabaseErrors, DatabaseConnectionError
from src.db.utils import DBConnection


def add_item_detail(item_name: str, start_time, end_time, start_price: int, filepath: str):
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:

                if start_time and start_time > now:
                    status = "upcoming"
                elif end_time and end_time < now:
                    status = "completed"
                else:
                    status = "live"

                item = ItemInformation(
                    name=item_name,
                    start_time=start_time,
                    end_time=end_time,
                    status=status,
                    start_price=start_price,
                    current_bid=start_price,
                    user_id=None,
                    won_by=None,
                    filepath=filepath
                )
                db.session.add(item)
                db.session.commit()
                return item.item_id
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


def update_item_detail(item_id: int, item_name: str, start_time, end_time, start_price: int, current_bid: int,
                       user_id: int, status: bool, won_by):
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:
                item = db.session.query(ItemInformation).filter(ItemInformation.item_id == item_id).first()

                item.name = item_name
                item.start_time = start_time
                item.end_time = end_time
                item.start_price = start_price
                item.current_bid = current_bid
                item.user_id = user_id
                item.status = status
                item.won_by = won_by
                db.session.commit()
                return item.item_id
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


def get_item_detail():
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:
                item = db.session.query(ItemInformation).all()
                output = []
                if item:
                    for item in item:
                        output.append({
                            "item_id": item.item_id,
                            "item_name": item.name,
                            "start_time": item.start_time,
                            "end_time": item.end_time,
                            "start_price": item.start_price,
                            "current_bid": item.current_bid,
                            "user_id": item.user_id,
                            "status": item.status,
                            "won_by": item.won_by
                        })
                return output if output else {
                    "message": "No item found"
                }
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


def get_item_detail_for_user():
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:
                item = db.session.query(ItemInformation).filter(ItemInformation.status == True).all()
                output = []
                if item:
                    for item in item:
                        output.append({
                            "item_id": item.item_id,
                            "item_name": item.name,
                            "start_time": item.start_time,
                            "end_time": item.end_time,
                            "start_price": item.start_price,
                            "current_bid": item.current_bid,
                            "user_id": item.user_id,
                            "status": item.status,
                            "won_by": item.won_by
                        })
                else:
                    return output if output else {
                        "message": "No item found"
                    }
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


def get_item_detail_by_id(item_id):
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:
                item = db.session.query(ItemInformation).filter(ItemInformation.item_id == item_id).first()

                if item:
                    print(type(item.start_price))
                    return {
                        "item_id": item.item_id,
                        "item_name": item.name,
                        "start_time": item.start_time.strftime("%Y-%m-%d %H:%M:%S"),
                        "end_time": item.end_time.strftime("%Y-%m-%d %H:%M:%S"),
                        "start_price": item.start_price,
                        "current_bid": item.current_bid,
                        "user_id": item.user_id,
                        "status": item.status,
                        "won_by": item.won_by
                    }

                else:
                    return {
                        "message": "No item found"
                    }

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


def delete_item(item_id):
    try:
        with DBConnection(DB_CONNECTION_LINK, False) as db:
            try:
                item = db.session.query(ItemInformation).filter(ItemInformation.item_id == item_id).first()

                if item:
                    db.session.delete(item)
                    db.session.commit()
                    return {
                        "message": "Item deleted successfully"
                    }

                else:
                    return {
                        "message": "No item found"
                    }

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
