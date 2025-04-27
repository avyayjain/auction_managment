import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./pages/Profile";
import ActiveItems from "./components/Auctions/ActiveItems";
import BidItem from "./components/Auctions/BidItem";
import AdminItems from "./pages/AdminItemsPage";
import AuctionDetails from "./pages/AuctionDetailsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/active-items" element={<ActiveItems />} />
      <Route path="/bid/:itemId" element={<BidItem itemId={0} endTime={""} />} />
      <Route path="/admin/items" element={<AdminItems />} />
      <Route path="/auction/:itemId" element={<AuctionDetails />} />
    </Routes>
  );
}

export default App;
