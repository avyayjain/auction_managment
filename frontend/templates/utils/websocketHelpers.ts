export const setupWebSocket = (ws: WebSocket, onMessage: (data: any) => void) => {
  ws.onopen = () => console.log("WebSocket connected!");
  ws.onclose = () => console.log("WebSocket disconnected.");
  ws.onerror = (error) => console.error("WebSocket error:", error);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
};
