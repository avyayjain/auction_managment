export const connectWebSocket = (path: string, token?: string) => {
  const ws = new WebSocket(
    `ws://localhost:8000${path}${token ? `?token=${token}` : ""}`
  );
  return ws;
};
