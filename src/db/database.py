import sqlalchemy
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Enum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import backref, relationship
from sqlalchemy.sql import func
from src.db.utils import CustomBaseModel
import enum

Base = declarative_base(cls=CustomBaseModel)

class ItemStatus(enum.Enum):
    UPCOMING = "upcoming"
    LIVE = "live"
    COMPLETED = "completed"


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
    status = Column(Enum(ItemStatus, name="itemtype"), nullable=False, default=ItemStatus.UPCOMING)
    start_price = Column(Integer, nullable=True)
    won_by = Column(Integer, nullable=True)
    filepath = Column(String, nullable=True)


class Bid(Base):
    __tablename__ = "bids"

    bid_id = Column(Integer, primary_key=True)
    item_id = Column(Integer, ForeignKey("item_information.item_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user_info.user_id"), nullable=False)
    bid_amount = Column(Integer, nullable=False)
    bid_time = Column(DateTime(timezone=True), server_default=func.now())
    item = relationship("ItemInformation", backref="bids")
    user = relationship("Users", backref="bids")


