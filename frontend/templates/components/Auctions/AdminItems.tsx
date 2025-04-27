import { useEffect, useState } from "react";
import api from "../../api/api"; // Axios setup

const AdminItems = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = () => {
      api.get("/admin/items")
          .then(response => {
            setItems(response.data);
          })
          .catch(error => {
            console.error("Error fetching admin items", error);
          });
    };
    fetchItems();
  }, []);

  return (
    <div>
      <h3>Items List</h3>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Current Bid</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.item_id}>
              <td>{item.name}</td>
              <td>{item.current_bid || item.start_price}</td>
              <td>{item.status ? "Active" : "Ended"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminItems;
