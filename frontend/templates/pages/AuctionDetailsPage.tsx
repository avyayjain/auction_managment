import { useParams } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import AuctionDetails from "../components/Auctions/AuctionDetails";

const AuctionDetailsPage = () => {
  const { itemId } = useParams();

  if (!itemId) return <div>Auction not found</div>;

  return (
    <div>
      <Header />
      <AuctionDetails itemId={parseInt(itemId)} />
      <Footer />
    </div>
  );
};

export default AuctionDetailsPage;
