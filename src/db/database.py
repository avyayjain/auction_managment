from sqlalchemy import (
    ARRAY,
    JSON,
    TEXT,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String, Sequence,
)

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import backref, relationship
from sqlalchemy.sql import func

from src.db.utils import CustomBaseModel

Base = declarative_base(cls=CustomBaseModel)


class Users(Base):
    __tablename__ = "user_info"

    user_id = Column(
        Integer,
        primary_key=True,
        unique=True,
    )
    email_id = Column(String, unique=True, nullable=False)  # foreign key missing
    user_type = Column(String, nullable=True)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    logout = Column(Boolean, nullable=False)


class ItemInformation(Base):
    __tablename__ = "item_information"
    # __table_args__ = {"useexisting": True}

    item_id = Column(
        Integer,
        primary_key=True,
        unique=True,
    )
    name = Column(String, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    current_bid = Column(Integer, nullable=True)
    user_id = Column(
        Integer,
        ForeignKey("user_info.user_id"),
        nullable=True,
    )
    status = Column(Boolean, nullable=False)
    start_price = Column(Integer, nullable=True)
    won_by = Column(Integer, nullable=True)




