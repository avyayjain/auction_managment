import logging

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from src.common.utils.generate_error_details import generate_details
from src.common.utils.user_defined_errors import UserErrors
from src.db.functions.auction_functions import add_bid, item_winner
from src.resources.token import UserBase, get_current_active_user

auction_router = APIRouter()


class Auction(BaseModel):
    user_bid: int


@auction_router.post("/user_bid/{item_id}")
async def user_bid(item_id, data: Auction, current_user: UserBase = Depends(get_current_active_user)):
    try:
        if current_user.user_type == "admin":
            return {"message": "Admin cannot bid"}
        try:
            item = add_bid(item_id, current_user.user_id, data.user_bid)
        except UserErrors as e:
            error_msg = (
                    "\n item  {} \n ".format(str(item_id)) + "\n" + e.message
            )
            logging.warning(error_msg, exc_info=True)
            with open("error.log", "a") as f:
                f.write(
                    "================================================================== \n"
                )
            details = generate_details(e.message, e.type)
            raise HTTPException(status_code=e.response_code, detail=details)
    except UserErrors as e:
        error_msg = (
                "\n item  {} \n ".format(str(item_id)) + "\n" + e.message
        )
        logging.warning(error_msg, exc_info=True)
        with open("error.log", "a") as f:
            f.write(
                "================================================================== \n"
            )
        details = generate_details(e.message, e.type)
        raise HTTPException(status_code=e.response_code, detail=details)

    except Exception:
        error_msg = "Item" + str(item_id) + "\n"
        logging.warning(error_msg, exc_info=True)
        with open("error.log", "a") as f:
            f.write(
                "================================================================== \n"
            )
        details = generate_details("Internal Server Error", "InternalServerError")
        raise HTTPException(status_code=500, detail=details)
    return {"message": "You have placed bid for ", "item details": item}


@auction_router.get("/get_auction_winner/{item_id}")
async def get_auction_winner(
        item_id, current_user: UserBase = Depends(get_current_active_user)
):
    try:
        try:
            item = item_winner(item_id)
        except UserErrors as e:
            error_msg = (
                    "\n item  {} \n ".format(str(item_id)) + "\n" + e.message
            )
            logging.warning(error_msg, exc_info=True)
            with open("error.log", "a") as f:
                f.write(
                    "================================================================== \n"
                )
            details = generate_details(e.message, e.type)
            raise HTTPException(status_code=e.response_code, detail=details)
    except UserErrors as e:
        error_msg = (
                "\n item  {} \n ".format(str(item_id)) + "\n" + e.message
        )
        logging.warning(error_msg, exc_info=True)
        with open("error.log", "a") as f:
            f.write(
                "================================================================== \n"
            )
        details = generate_details(e.message, e.type)
        raise HTTPException(status_code=e.response_code, detail=details)

    except Exception:
        error_msg = "Item" + str(item_id) + "\n"
        logging.warning(error_msg, exc_info=True)
        with open("error.log", "a") as f:
            f.write(
                "================================================================== \n"
            )
        details = generate_details("Internal Server Error", "InternalServerError")
        raise HTTPException(status_code=500, detail=details)
    return item
