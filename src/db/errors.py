# User Defined Error used in Database
from src.common.utils.user_defined_errors import UserErrors


class DatabaseErrors(UserErrors):
    pass


class DataDeletionError(DatabaseErrors):
    def __init__(self, message=None, response_code=None):
        self.message = (
            message if message else "Can't Delete in Data in Database. Try Again"
        )
        self.response_code = response_code if response_code else 503
        self.type = "DataDeletionError"


class DataInjectionError(DatabaseErrors):
    def __init__(self, message=None, response_code=None):
        self.message = (
            message if message else "Can't Insert Data in Database. Try Again"
        )
        self.response_code = response_code if response_code else 503
        self.type = "DataInjectionError"


class DatabaseTypeErrors(DatabaseErrors):
    def __init__(self, message=None, response_code=None):
        self.message = (
            message
            if message
            else "Wrong Data Type. Can't create Database class Object"
        )
        self.response_code = response_code if response_code else 422
        self.type = "DatabaseTypeErrors"


class DatabaseConnectionError(DatabaseErrors):
    def __init__(self, message=None, response_code=None):
        self.message = message if message else "Can't Connect to Database .Try Again"
        self.response_code = response_code if response_code else 503
        self.type = "DatabaseConnectionError"


class ItemNotFound(DatabaseErrors):
    def __init__(self, message=None, response_code=None):
        self.message = message if message else "Item doesn't exist"
        self.response_code = response_code if response_code else 400
        self.type = "ItemNotFound"


class IntegrityError(DatabaseErrors):
    def __init__(self, message=None, response_code=None):
        self.message = message if message else "Assignment ID already exist"
        self.response_code = response_code if response_code else 422
        self.type = "IntegrityError"


class DataExtractionError(DatabaseErrors):
    def __init__(self, message=None, response_code=None):
        self.message = (
            message if message else "Can't Extract Data from Database.Try Again"
        )
        self.response_code = response_code if response_code else 503
        self.type = "DataExtractionError"
