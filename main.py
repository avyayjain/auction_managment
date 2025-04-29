from imp import reload
import uvicorn
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware

from src.common.utils.user_defined_errors import DataBaseErrors, FileErrors
from src.resources import bidding, bid_history
from src.resources.auction import auction_router
from src.resources.item import item_router
from src.resources.sign_up import add_user_router
from src.resources.token import token_router
from src.common.utils.error_handlers import (
    database_error_handler,
    global_exception_handler,
    validation_error_handler,
    file_error_handler
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(add_user_router, prefix="/api/user/sign-up")
app.include_router(token_router, prefix="/api/token")
app.include_router(item_router, prefix="/api/item")
app.include_router(auction_router, prefix="/api/auction")
app.include_router(bidding.router, prefix="/api/bidding")
app.include_router(bid_history.router, prefix="/api/bid-history", tags=["Bid History"])

app.add_exception_handler(DataBaseErrors, database_error_handler)
app.add_exception_handler(FileErrors, file_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.middleware('http')(global_exception_handler)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000,reload = True)

