from typing import Dict, List
from fastapi import WebSocket
from src.common.utils.error_handlers import logger
from src.db.functions.websocket_bids_manager import fetch_active_items


class BidManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, item_id: int):
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


class ActiveItemsManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_active_items(self):
        try:
            active_items = await fetch_active_items()
            for connection in self.active_connections:
                await connection.send_json(active_items)
        except Exception as e:
            logger.error(f"Failed to broadcast active items: {str(e)}")