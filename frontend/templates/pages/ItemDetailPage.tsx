import { useParams } from "react-router-dom";
import BidItem from "../components/Auctions/BidItem";
import BidHistory from "../components/Auctions/BidHistory";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const ItemDetailPage = () => {
  const { itemId } = useParams();

  if (!itemId) return <div>Item not found</div>;

  return (
    <div>
      <Header />
      <h2>Item Detail Page</h2>
      <BidItem itemId={parseInt(itemId)} endTime={new Date().toISOString()} />
      <BidHistory itemId={parseInt(itemId)} />
      <Footer />
    </div>
  );
};

export default ItemDetailPage;
