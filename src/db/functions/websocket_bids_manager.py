from fastapi import HTTPException
from sqlalchemy import select
from starlette.background import BackgroundTasks

from src.common.utils.error_handlers import logger
from src.common.utils.user_defined_errors import NoEntityFound, LessBidError
from src.db.database import Bid, Users, ItemInformation
from src.db.functions.task import send_email_task
from src.db.utils import AsyncDBConnection


async def validate_bid(item, amount: int):
    minimum_bid = item.current_bid or item.start_price
    if amount <= minimum_bid:
        raise LessBidError()


async def notify_previous_bidders(
    db, item_id: int, user_id: int, item_name: str, amount: int, background_tasks: BackgroundTasks
):
    prev_bids = await db.execute(
        select(Bid).where(Bid.item_id == item_id, Bid.user_id != user_id)
    )
    prev_bidder_ids = {b.user_id for b in prev_bids.scalars().all()}

    if prev_bidder_ids:
        users = await db.execute(
            select(Users).where(Users.user_id.in_(prev_bidder_ids))
        )
        user_emails = [u.email_id for u in users.scalars().all()]
        for email in user_emails:
            # Schedule email sending as background task
            background_tasks.add_task(send_email_task, email, item_name, amount)


async def process_bid(item_id: int, user_id: int, amount: int, background_tasks: BackgroundTasks):
    async with AsyncDBConnection(False) as db:
        try:
            item = await db.get(ItemInformation, item_id)
            if not item:
                raise NoEntityFound("Item not found.")

            await validate_bid(item, amount)

            item.current_bid = amount
            item.won_by = user_id

            new_bid = Bid(item_id=item_id, user_id=user_id, bid_amount=amount)
            db.add(new_bid)

            await db.commit()

            await notify_previous_bidders(db, item_id, user_id, item.name, amount, background_tasks)

            return {
                "item_id": item_id,
                "new_bid": amount,
                "user_id": user_id,
                "status": "accepted"
            }

        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Bid processing error: {str(e)}")


async def fetch_active_items():
    try:
        async with AsyncDBConnection(False) as db:
            result = await db.execute(
                select(ItemInformation).where(ItemInformation.status == True)
            )
            items = result.scalars().all()
            return [serialize_item(item) for item in items]
    except Exception as e:
        logger.exception("Error fetching active items from database")
        return []

# Helper to serialize item information
def serialize_item(item: ItemInformation) -> dict:
    return {
        "item_id": item.item_id,
        "name": item.name,
        "current_bid": item.current_bid,
        "end_time": item.end_time.isoformat() if item.end_time else None,
        "start_time": item.start_time.isoformat() if item.start_time else None,
        "status": item.status,
        "start_price": item.start_price,
        "won_by": item.won_by,
    }