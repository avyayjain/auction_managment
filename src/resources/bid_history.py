from fastapi import APIRouter, Depends
from sqlalchemy import select
from src.db.database import Bid, Users, ItemInformation
from src.db.utils import AsyncDBConnection
from src.resources.token import get_current_user, UserBase

router = APIRouter()


@router.get("/user/bids")
async def get_user_bids(current_user: UserBase = Depends(get_current_user)):
    async with AsyncDBConnection(False) as db:
        result = await db.execute(
            select(Bid, ItemInformation)
            .join(ItemInformation, Bid.item_id == ItemInformation.item_id)
            .where(Bid.user_id == current_user.user_id)
        )
        bids = result.all()
        return [
            {
                "item_name": item.name,
                "bid_amount": bid.bid_amount,
                "timestamp": bid.created_at.isoformat(),
            }
            for bid, item in bids
        ]


@router.get("/item/{item_id}/bids")
async def get_item_bids(item_id: int):
    async with AsyncDBConnection(False) as db:
        result = await db.execute(
            select(Bid, Users)
            .join(Users, Bid.user_id == Users.user_id)
            .where(Bid.item_id == item_id)
            .order_by(Bid.created_at.desc())
        )
        bids = result.all()
        return [
            {
                "user_email": user.email_id,
                "bid_amount": bid.bid_amount,
                "timestamp": bid.created_at.isoformat(),
            }
            for bid, user in bids
        ]
