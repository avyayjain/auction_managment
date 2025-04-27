import { io } from "socket.io-client";

const SOCKET_URL = "ws://localhost:8000";

export const connectActiveItems = () => {
  return new WebSocket(`${SOCKET_URL}/ws/active-items`);
};

export const connectBid = (itemId: number, token: string) => {
  return new WebSocket(`${SOCKET_URL}/ws/bid/${itemId}?token=${token}`);
};
