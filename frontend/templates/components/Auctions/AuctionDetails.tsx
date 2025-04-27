import { useEffect, useState } from "react";
import api from "../../api/api";

const AuctionDetails = ({ itemId }: { itemId: number }) => {
  const [item, setItem] = useState<any>(null);

    useEffect(() => {
        const fetchItem = () => {
            api.get(`/items/${itemId}`)
                .then(response => {
                    setItem(response.data);
                })
                .catch(error => {
                    console.error("Error fetching auction details", error);
                });
        };
        fetchItem();
    }, [itemId]);

  if (!item) return <div>Loading...</div>;

  return (
    <div>
      <h2>{item.name}</h2>
      <p><strong>Start Price:</strong> {item.start_price}</p>
      <p><strong>Current Bid:</strong> {item.current_bid}</p>
      <p><strong>Status:</strong> {item.status ? "Active" : "Ended"}</p>
      <p><strong>Start Time:</strong> {item.start_time}</p>
      <p><strong>End Time:</strong> {item.end_time}</p>
      <p><strong>Winner:</strong> {item.won_by || "No winner yet"}</p>
    </div>
  );
};

export default AuctionDetails;
