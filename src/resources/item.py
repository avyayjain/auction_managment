from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from src.common.utils.user_defined_errors import UserErrors, UserUser
from src.common.utils.generate_error_details import generate_details
from src.common.utils.generate_logs import logging
from src.db.functions.item import update_item_detail, add_item_detail, get_item_detail, get_item_detail_by_id, \
    get_item_detail_for_user, delete_item
from src.resources.token import UserBase, get_current_active_user

item_router = APIRouter()


class ItemBase(BaseModel):
    item_name: str
    start_time: datetime
    end_time: datetime
    start_price: int


class UpdateItem(BaseModel):
    item_name: str
    start_time: datetime
    end_time: datetime
    start_price: int
    current_bid: int
    user_id: int
    status: bool
    won_by: Optional[int] = None


@item_router.post("/add_item_details")
async def add_item_details(
        data: ItemBase, current_user: UserBase = Depends(get_current_active_user)
):
    try:
        if current_user.user_type == "user":
            raise UserUser(message="Normal User can't add item login as admin")
        try:
            item = add_item_detail(data.item_name, data.start_time, data.end_time, data.start_price)
        except UserErrors as e:
            error_msg = (
                    "\n item  {} \n ".format(str(data.item_name)) + "\n" + e.message
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
                "\n item  {} \n ".format(str(data.item_name)) + "\n" + e.message
        )
        logging.warning(error_msg, exc_info=True)
        with open("error.log", "a") as f:
            f.write(
                "================================================================== \n"
            )
        details = generate_details(e.message, e.type)
        raise HTTPException(status_code=e.response_code, detail=details)

    except Exception:
        error_msg = "Item" + str(data.item_name) + "\n"
        logging.warning(error_msg, exc_info=True)
        with open("error.log", "a") as f:
            f.write(
                "================================================================== \n"
            )
        details = generate_details("Internal Server Error", "InternalServerError")
        raise HTTPException(status_code=500, detail=details)
    return {"message": "Item Added", "item_id": item}


@item_router.put("/update_item_details/{item_id}")
async def update_item_details(
        item_id, data: UpdateItem, current_user: UserBase = Depends(get_current_active_user)
):
    try:
        try:
            if current_user.user_type == "user":
                raise UserUser(message="Normal User can't update item login as admin")
            else:
                item = update_item_detail(item_id, data.item_name, data.start_time, data.end_time, data.start_price,
                                          data.current_bid, data.user_id, data.status, data.won_by)
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
    return {"message": "Item updated successfully", "item_id": item}


@item_router.get("/get_item_details")
async def get_item_details(current_user: UserBase = Depends(get_current_active_user)):
    try:
        if current_user.user_type == "user":
            item = get_item_detail_for_user()
        else:
            item = get_item_detail()
    except Exception as e:
        error_msg = (
            f"error +  + {e.message}"
        )
        logging.warning(error_msg, exc_info=True)
        with open("error.log", "a") as f:
            f.write(
                "================================================================== \n"
            )
        details = generate_details(e.message, e.type)
        raise HTTPException(status_code=e.response_code, detail=details)

    return {
        "item on auctions :": item
    }

@item_router.get("/get_item_details/{item_id}")
async def get_item_details(
        item_id, current_user: UserBase = Depends(get_current_active_user)
):
    try:
        try:
            item = get_item_detail_by_id(item_id)
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
    return {"message": "your searched item is", item_id: item}


@item_router.delete("/delete_item_details/{item_id}")
async def delete_item_details(
        item_id, current_user: UserBase = Depends(get_current_active_user)
):
    try:
        try:
            if current_user.user_type == "user":
                raise UserUser(message="Normal User can't delete item login as admin")
            else:
                item = delete_item(item_id)
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


