from src.common.utils.error_handlers import logger
from src.db.functions.scheduler import update_item_statuses


def job_wrapper():
    try:
        logger.info("Running job: update_item_statuses")
        update_item_statuses()
        logger.info("Job completed: update_item_statuses")
    except Exception as e:
        logger.error(f"Error running update_item_statuses: {e}")