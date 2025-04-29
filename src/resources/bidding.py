import json
from typing import List
from src.common.utils.user_defined_errors import UserErrors, NoEntityFound, PermissionDeniedError
from src.common.utils.webocket_connection import BidManager, ActiveItemsManager
from fastapi import APIRouter
from pydantic import BaseModel, ValidationError
from starlette import status
from starlette.background import BackgroundTasks
from starlette.websockets import WebSocket, WebSocketDisconnect
from src.db.functions.websocket_bids_manager import process_bid
from src.resources.token import get_websocket_user

router = APIRouter()
active_connections: List[WebSocket] = []


class BidRequest(BaseModel):
    amount: int


class ActiveItemResponse(BaseModel):
    item_id: int
    name: str
    current_bid: int
    end_time: str


# Initialize managers
active_items_manager = ActiveItemsManager()
bid_manager = BidManager()


@router.websocket("/ws/active-items")
async def active_items_endpoint(websocket: WebSocket):
    await websocket.accept()
    await active_items_manager.connect(websocket)

    try:
        await active_items_manager.broadcast_active_items()
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        active_items_manager.disconnect(websocket)
    except Exception as e:
        print(f"Error in active_items_endpoint: {str(e)}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)

"""
sample output for the active items endpoint


[
  {
    "item_id": 1,
    "name": "Antique Vase",
    "current_bid": 500,
    "end_time": "2025-04-29T18:00:00",
    "start_time": "2025-04-29T10:00:00",
    "status": true,
    "start_price": 100,
    "won_by": 3
  },
  {
    "item_id": 2,
    "name": "Vintage Watch",
    "current_bid": 800,
    "end_time": "2025-04-30T20:00:00",
    "start_time": "2025-04-29T09:00:00",
    "status": true,
    "start_price": 300,
    "won_by": 2
  }
]

"""



@router.websocket("/ws/bid/{item_id}")
async def bid_endpoint(websocket: WebSocket, item_id: int, background_tasks: BackgroundTasks):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        current_user = await get_websocket_user(token)

    except PermissionDeniedError as e:
        await websocket.send_json({"error": e.message, "type": e.type})
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if current_user is "admin":
        await websocket.send_json({"error": "Admin cannot place bids", "type": "PermissionDeniedError"})
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    await bid_manager.connect(websocket, item_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                bid_data = BidRequest.parse_raw(data)

                result = await process_bid(
                    item_id=item_id,
                    user_id=current_user.user_id,
                    amount=bid_data.amount,
                    background_tasks=background_tasks,
                )

                if isinstance(result, dict) and "error" in result:
                    await websocket.send_json(result)
                else:
                    await bid_manager.broadcast_bid(item_id, result)
                    await active_items_manager.broadcast_active_items()

            except ValidationError:
                await websocket.send_json({"error": "Invalid bid format", "type": "ValidationError"})
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON format", "type": "JSONDecodeError"})
            except UserErrors as e:
                await websocket.send_json({"error": e.message, "type": e.type})
            except NoEntityFound as e:
                await websocket.send_json({"error": e.message, "type": e.type})


    except WebSocketDisconnect:
        bid_manager.disconnect(websocket, item_id)
    except Exception as e:
        print(f"Unexpected error in bid endpoint: {str(e)}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)


"""
sample input for the bid endpoint

{
  "amount": 1000
}


sample output for the bid endpoint

{
  "item_id": 2,
  "new_bid": 900,
  "user_id": 4,
  "status": "accepted"
}


sample output for the bid endpoint when the bid is not bidder

{
  "item_id": 2,
  "new_bid": 900,
  "user_id": 4,
  "status": "accepted"
}


"""