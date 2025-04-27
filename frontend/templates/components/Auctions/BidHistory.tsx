import { useEffect, useState } from "react";
import { fetchBidHistory } from "../../api/bids";
import { Bid } from "../../types";

interface Props {
  itemId: number;
}

const BidHistory = ({ itemId }: Props) => {
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    fetchBidHistory(itemId)
        .then(data => {
          setBids(data);
        })
        .catch(error => {
          console.error("Failed to fetch bid history:", error);
        });
  }, [itemId]);

  return (
    <div>
      <h3>Bid History</h3>
      {bids.map((bid) => (
        <div key={bid.bid_id}>
          <p>Bidder ID: {bid.user_id} | Amount: {bid.bid_amount} | Time: {new Date(bid.bid_time).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default BidHistory;
