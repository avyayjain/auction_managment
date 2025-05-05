from datetime import datetime
from sqlalchemy import select
from src.db.database import ItemInformation
from src.db.utils import AsyncDBConnection
from src.common.utils.error_handlers import logger

async def update_item_statuses():


    now = datetime.now(datetime.UTC)
    async with AsyncDBConnection(False) as db:
        try:
            result = await db.execute(select(ItemInformation))
            items = result.scalars().all()

            for item in items:
                if item.start_time and item.start_time > now:
                    item.status = "upcoming"
                elif item.end_time and item.end_time < now:
                    item.status = "completed"
                else:
                    item.status = "live"

            await db.commit()
        except Exception as e:
            logger.error(f"Error updating item statuses: {e}")
