from fastapi import HTTPException
from sqlalchemy import select
from src.db.database import Bid, ItemInformation, Users
from src.db.utils import AsyncDBConnection

async def fetch_user_bids(user_id: int):
    try:
        async with AsyncDBConnection(False) as db:
            result = await db.execute(
                select(Bid, ItemInformation)
                .join(ItemInformation, Bid.item_id == ItemInformation.item_id)
                .where(Bid.user_id == user_id)
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

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_items_bids(item_id: int):
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


