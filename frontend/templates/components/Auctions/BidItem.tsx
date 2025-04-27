import { useState, useEffect } from "react";
import { connectWebSocket } from "../../api/websocket";
import { getToken } from "../../utils/auth";
import { formatCountdown } from "../../utils/formatTime";

interface BidItemProps {
  itemId: number;
  endTime: string;
}

const BidItem = ({ itemId, endTime }: BidItemProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const ws = connectWebSocket(`/ws/bid/${itemId}`, getToken() || undefined);
    setSocket(ws);

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages((prev) => [...prev, msg]);
    };

    return () => {
      ws.close();
    };
  }, [itemId]);

  const sendBid = () => {
    if (socket && bidAmount) {
      socket.send(JSON.stringify({ amount: parseInt(bidAmount) }));
      setBidAmount("");
    }
  };

  return (
    <div>
      <h2>Bid Item</h2>
      <div>
        <input
          type="number"
          placeholder="Enter your bid"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
        />
        <button onClick={sendBid}>Place Bid</button>
      </div>
      <h3>Countdown: {formatCountdown(endTime)}</h3>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.error ? (
              <p style={{ color: "red" }}>{msg.error}</p>
            ) : (
              <p>New Bid: {msg.new_bid}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BidItem;
