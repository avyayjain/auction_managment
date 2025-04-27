import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface BidMessage {
  item_id: number;
  new_bid: number;
  user_id: number;
  status: string;
  error?: string;
}

const BiddingRoom = () => {
  const { item_id } = useParams<{ item_id: string }>();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [messages, setMessages] = useState<BidMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item_id) return;
    const token = localStorage.getItem('token');
    const socket = new WebSocket(`ws://localhost:8000/ws/bid/${item_id}?token=${token}`);

    socket.onopen = () => console.log('Connected to bidding room');
    socket.onmessage = (event) => {
      const data: BidMessage = JSON.parse(event.data);
      if (data.error) {
        setError(data.error);
      } else {
        setError(null);
        setMessages((prev) => [data, ...prev]);
      }
    };
    socket.onclose = () => console.log('Disconnected from bidding room');

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [item_id]);

  const placeBid = () => {
    if (ws && bidAmount > 0) {
      ws.send(JSON.stringify({ amount: bidAmount }));
      setBidAmount(0);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-center mb-6">Bidding Room for Item {item_id}</h1>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Enter your bid"
          />
          <button
            onClick={placeBid}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Place Bid
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <h2 className="text-lg font-semibold mb-2">Bid Updates</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded shadow-sm"
            >
              User {msg.user_id} placed ${msg.new_bid}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BiddingRoom;
