import asyncio
import os
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel

from src.common.utils.constants import FILE_FOLDER_PATH, BYTES_PER_CHUNK
from src.common.utils.user_defined_errors import UserUser
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
async def add_item_details(data: ItemBase, file: UploadFile = File(..., description='Upload a file'),
                           current_user: UserBase = Depends(get_current_active_user)):

    if current_user.user_type == "user":
        raise UserUser(message="Normal User can't add item login as admin")

    file_pointer = 0  # Stores which part of file we're reading currently
    filename = file.filename
    filepath = os.path.join(FILE_FOLDER_PATH, filename)
    data2 = await file.read(BYTES_PER_CHUNK)

    with open(filepath, 'wb+') as f:

        while data2:
            task = asyncio.create_task(file.seek(file_pointer))  # Highly Optional
            f.write(data2)
            file_pointer += BYTES_PER_CHUNK
            await task
            data2 = await file.read(BYTES_PER_CHUNK)

    item = add_item_detail(data.item_name, data.start_time, data.end_time, data.start_price,filepath)

    return {"message": "Item Added", "item_id": item}


@item_router.put("/update_item_details/{item_id}")
async def update_item_details(item_id, data: UpdateItem, current_user: UserBase = Depends(get_current_active_user)):
    if current_user.user_type == "user":
        raise UserUser(message="Normal User can't update item login as admin")
    else:
        item = update_item_detail(item_id, data.item_name, data.start_time, data.end_time, data.start_price,
                                          data.current_bid, data.user_id, data.status, data.won_by)

    return {"message": "Item updated successfully", "item_id": item}


@item_router.get("/get_item_details")
async def get_item_details(current_user: UserBase = Depends(get_current_active_user)):

    if current_user.user_type == "user":
       item = get_item_detail_for_user()
    else:
       item = get_item_detail()

    return {"item on auctions :": item}

@item_router.get("/get_item_details/{item_id}")
async def get_item_details(item_id, current_user: UserBase = Depends(get_current_active_user)
):
    item = get_item_detail_by_id(item_id)

    return {"message": "your searched item is", item_id: item}


@item_router.delete("/delete_item_details/{item_id}")
async def delete_item_details(item_id, current_user: UserBase = Depends(get_current_active_user)):
    if current_user.user_type == "user":
        raise UserUser(message="Normal User can't delete item login as admin")
    else:
        item = delete_item(item_id)

    return item


