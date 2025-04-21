import json
from typing import List, Dict

from fastapi import Depends, APIRouter, HTTPException
from jose import jwt, JWTError
from pydantic import BaseModel, ValidationError, EmailStr
from sqlalchemy import select
from starlette import status
from starlette.websockets import WebSocket, WebSocketDisconnect

from src.common.utils.constants import DB_CONNECTION_LINK, ASYNC_DB_CONNECTION_LINK, SECRET_KEY, ALGORITHM
from src.db.database import Bid, ItemInformation, Users
from src.db.utils import DBConnection, AsyncDBConnection
from src.resources.token import get_current_user, UserBase

router = APIRouter()
active_connections: List[WebSocket] = []


class BidRequest(BaseModel):
    amount: int


class ActiveItemResponse(BaseModel):
    item_id: int
    name: str
    current_bid: int
    end_time: str


async def get_websocket_user(token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: EmailStr = payload.get("sub")
        if email is None:
            raise credentials_exception

        # Corrected: Use the session within the context manager
        async with AsyncDBConnection(False) as db:
            result = await db.execute(select(Users).where(Users.email_id == email))
            user = result.scalar_one_or_none()
            if user is None:
                raise credentials_exception
            print(user.user_id, user.email_id, user.user_type)  # Debug
            return user  # Return user INSIDE the context manager

    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        raise credentials_exception


# --- Connection Managers ---
class ActiveItemsManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        # await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_active_items(self):
        active_items = await self.get_active_items()
        for connection in self.active_connections:
            await connection.send_json(active_items)

    async def get_active_items(self):
        async with AsyncDBConnection(False) as db:
            result = await db.execute(
                select(ItemInformation).where(ItemInformation.status == True)
            )
            items = result.scalars().all()
            # Manual dict construction for each item
            return [
                {
                    "item_id": item.item_id,
                    "name": item.name,
                    "current_bid": item.current_bid,
                    "end_time": item.end_time.isoformat() if item.end_time else None,
                    "start_time": item.start_time.isoformat() if item.start_time else None,
                    "status": item.status,
                    "start_price": item.start_price,
                    "won_by": item.won_by,
                }
                for item in items
            ]


class BidManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, item_id: int):
        # await websocket.accept()
        if item_id not in self.active_connections:
            self.active_connections[item_id] = []
        self.active_connections[item_id].append(websocket)

    def disconnect(self, websocket: WebSocket, item_id: int):
        self.active_connections[item_id].remove(websocket)
        if not self.active_connections[item_id]:
            del self.active_connections[item_id]

    async def broadcast_bid(self, item_id: int, message: dict):
        if item_id in self.active_connections:
            for connection in self.active_connections[item_id]:
                await connection.send_json(message)

    async def process_bid(self, item_id: int, user_id: int, amount: int):
        async with AsyncDBConnection(False) as db:
            try:
                # 1. Get the item
                item = await db.get(ItemInformation, item_id)
                if not item:
                    return {"error": "Item not found"}

                # 2. Validate bid amount
                minimum_bid = item.current_bid or item.start_price
                if amount <= minimum_bid:
                    return {"error": f"Bid must be higher than {minimum_bid}"}

                # 3. Update item
                item.current_bid = amount
                item.won_by = user_id

                # 4. Create bid record
                new_bid = Bid(
                    item_id=item_id,
                    user_id=user_id,
                    bid_amount=amount
                )
                db.add(new_bid)

                await db.commit()

                # 5. Return success response
                return {
                    "item_id": item_id,
                    "new_bid": amount,
                    "user_id": user_id,
                    "status": "accepted"
                }

            except Exception as e:
                await db.rollback()
                return {"error": str(e)}


# Initialize managers
active_items_manager = ActiveItemsManager()
bid_manager = BidManager()


@router.websocket("/ws/active-items")
async def active_items_endpoint(websocket: WebSocket):
    await websocket.accept()
    await active_items_manager.connect(websocket)
    try:
        # Send initial active items
        await active_items_manager.broadcast_active_items()
        while True:
            # Keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_items_manager.disconnect(websocket)


@router.websocket("/ws/bid/{item_id}")
async def bid_endpoint(websocket: WebSocket, item_id: int):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        current_user = await get_websocket_user(token)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()  # ✅ Accept WebSocket before using it
    await bid_manager.connect(websocket, item_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                bid_data = BidRequest.parse_raw(data)
                result = await bid_manager.process_bid(
                    item_id,
                    current_user.user_id,
                    bid_data.amount
                )
                if "error" in result:
                    await websocket.send_json(result)
                else:
                    await bid_manager.broadcast_bid(item_id, result)
                    await active_items_manager.broadcast_active_items()

            except ValidationError:
                await websocket.send_json({"error": "Invalid bid format"})
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON format"})

    except WebSocketDisconnect:
        bid_manager.disconnect(websocket, item_id)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)