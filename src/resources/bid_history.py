from fastapi import APIRouter, Depends, HTTPException
from src.db.functions.bids import fetch_user_bids, get_items_bids
from src.resources.token import get_current_user, UserBase

router = APIRouter()

@router.get("/user/bids")
async def get_user_bids(current_user: UserBase = Depends(get_current_user)):

    if current_user.user_type == "admin":
        raise HTTPException(status_code=403, detail="Admin cannot place bids")

    bid = await fetch_user_bids(current_user.user_id)

    return {"message": "your bids are", "bid": bid}





@router.get("/item/{item_id}/bids")
async def get_item_bids(item_id: int):

    item_bid = await get_items_bids(item_id)

    return {"message": "your bids are", "bid": item_bid}
