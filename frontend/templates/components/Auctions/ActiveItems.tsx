import { useEffect, useState } from "react";
import { fetchActiveItems } from "../../api/bids";
import { Item } from "../../types";

const ActiveItems = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchActiveItems()
        .then(data => {
          setItems(data);
        })
        .catch(err => {
          console.error("Failed to fetch active items:", err);
        });
  }, []);

  return (
    <div>
      <h2>Active Auctions</h2>
      {items.map((item) => (
        <div key={item.item_id}>
          <h3>{item.name}</h3>
          <p>Current Bid: {item.current_bid || item.start_price}</p>
          <a href={`/item/${item.item_id}`}>View & Bid</a>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ActiveItems;
