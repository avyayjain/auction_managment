from datetime import datetime
from sqlalchemy import select, and_
from starlette.background import BackgroundTasks
from src.db.utils import AsyncDBConnection
from src.db.database import ItemInformation, Bid, Users
from src.db.functions.task import send_email_task, send_winner_email_task


async def declare_auction_winner(item_id: int, background_tasks: BackgroundTasks):
    async with AsyncDBConnection(False) as db:
        item = await db.get(ItemInformation, item_id)
        if not item or item.status is False:
            return  # Auction already inactive or not found

        # Get highest bid
        result = await db.execute(
            select(Bid).where(Bid.item_id == item_id).order_by(Bid.bid_amount.desc())
        )
        bids = result.scalars().all()

        if not bids:
            item.status = False  # No bids placed
            await db.commit()
            return

        # Winner is first in sorted bids
        winning_bid = bids[0]
        item.status = False  # Mark auction as ended
        item.won_by = winning_bid.user_id
        await db.commit()

        # Get winner's email
        winner = await db.get(Users, winning_bid.user_id)
        if winner:
            background_tasks.add_task(send_winner_email_task, winner.email_id, item.name, winning_bid.bid_amount, winner=True)

        # Notify all other bidders
        other_user_ids = {bid.user_id for bid in bids if bid.user_id != winning_bid.user_id}
        if other_user_ids:
            users_result = await db.execute(select(Users).where(Users.user_id.in_(other_user_ids)))
            other_users = users_result.scalars().all()
            for user in other_users:
                background_tasks.add_task(send_winner_email_task, user.email_id, item.name, winning_bid.bid_amount, winner=False)


async def check_and_finalize_ended_auctions(background_tasks: BackgroundTasks):
    async with AsyncDBConnection(False) as db:
        now = datetime.utcnow()
        result = await db.execute(
            select(ItemInformation).where(
                and_(ItemInformation.status == True, ItemInformation.end_time <= now)
            )
        )
        items = result.scalars().all()
        for item in items:
            await declare_auction_winner(item.item_id, background_tasks)

    # Logic to send email...
