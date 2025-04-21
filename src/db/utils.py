import datetime

from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from src.common.utils.constants import ASYNC_DB_CONNECTION_LINK


class CustomBaseModel:
    """ Generalize __init__, __repr__ and to_json
        Based on the models columns """

    print_filter = ()
    #
    # def __repr__(self) -> str:
    #     """ Define a base way to print models
    #         Columns inside `print_filter` are excluded """
    #     return "%s(%s)" % (
    #         self.__class__.__name__,
    #         {
    #             column: value
    #             for column, value in self._to_dict().items()
    #             if column not in self.print_filter
    #         },
    #     )

    to_json_filter = ()

    @property
    def json(self) -> dict:
        """ Define a base way to jsonify models
            Columns inside `to_json_filter` are excluded """
        return {
            column: value if not isinstance(value, datetime.date) else value.isoformat()
            for column, value in self._to_dict().items()
            if column not in self.to_json_filter
        }

    def _to_dict(self) -> dict:
        """ This would more or less be the same as a `to_json`
            But putting it in a "private" function
            Allows to_json to be overriden without impacting __repr__
            Or the other way around
            And to add filter lists """
        return {
            column.key: getattr(self, column.key)
            for column in inspect(self.__class__).attrs
        }


class DBConnection:
    """SQLAlchemy database connection"""

    def __init__(self, connection_string, expire_commit=None):
        self.expire_commit = expire_commit if expire_commit is None else True
        self.connection_string = connection_string
        self.session = None

    def __enter__(self):
        self.engine = create_engine(self.connection_string)
        Session = sessionmaker(expire_on_commit=self.expire_commit)
        self.session = Session(bind=self.engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.engine.dispose()
        self.session.close()


engine = create_async_engine(
    ASYNC_DB_CONNECTION_LINK, future=True
)


class AsyncDBConnection:
    def __init__(self, expire_commit: bool = True):
        self.expire_commit = expire_commit

    async def __aenter__(self):
        self.session = AsyncSession(bind=engine, expire_on_commit=self.expire_commit)
        return self.session

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()


def engine_creator(user, passwd, hostname, dbname, dbtype):
    """Creates an sqlalchemy engine using the provided cred arguments"""
    return create_engine(
        "{dbtype}://{user}:{passwd}@{hostname}/{dbname}".format(
            dbtype=dbtype, user=user, passwd=passwd, hostname=hostname, dbname=dbname
        )
    )
