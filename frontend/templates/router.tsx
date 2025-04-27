import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuctionDetailsPage from "./pages/AuctionDetailsPage";
import Profile from "./pages/Profile";
import AdminItemsPage from "./pages/AdminItemsPage";
import Navbar from "./components/Navbar";

export default function Router() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auction/:itemId" element={<AuctionDetailsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminItemsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
