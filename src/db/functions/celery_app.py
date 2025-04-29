from celery import Celery

celery_app = Celery(
    "auction_tasks",
    broker="redis://localhost:6379/0",  # update if needed
    backend="redis://localhost:6379/0"
)

celery_app.conf.task_routes = {
    "app.tasks.email.send_email_task": {"queue": "emails"}
}
