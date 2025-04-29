class UserErrors(Exception):
    def __init__(self, message=None, response_code=None):
        self.message = message if message else "Internal Server Error"
        self.response_code = response_code if response_code else 500
        self.type = "UserErrors"


class PermissionDeniedError(UserErrors):
    def __init__(self, message=None, response_code=None):
        self.message = message if message else "Could not validate credentials"
        self.response_code = response_code if response_code else 401
        self.type = "PermissionDeniedError"


class UserUser(UserErrors):
    def __init__(self, message=None, response_code=None):
        self.message = message if message else "user access: Access Denied"
        self.response_code = response_code if response_code else 400
        self.type = "PermissionDeniedError"


class TimeExceedError(UserErrors):
    def __init__(self, message=None, response_code=None):
        self.message = message if message else " The auction time has finished"
        self.response_code = response_code if response_code else 413
        self.type = "TimeExceedError"


class LessBidError(UserErrors):
    def __init__(self, message=None, response_code=None):
        self.message = message if message else "Place bid greater than current bid"
        self.response_code = response_code if response_code else 400
        self.type = "LessBidError"

class DataBaseErrors(Exception):
    pass


class NoEntityFound(DataBaseErrors):
    def __init__(self, message = None, response_code = None):
        self.message = message if message else "No Entity associated to given data found."
        self.response_code = 404 if response_code is None else response_code
        self.type = 'NoEntityFound'

class FileErrors(Exception):
    pass

class FileNotFound(FileErrors):
    def __init__(self, message = None, response_code = None):
        self.message = message if message else "File not Found."
        self.response_code = 404 if response_code is None else response_code
        self.type = 'FileNotFound'