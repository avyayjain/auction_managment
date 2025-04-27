import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import AdminItems from "../components/Auctions/AdminItems";

const AdminItemsPage = () => {
  return (
    <div>
      <Header />
      <h2>Admin: Manage Items</h2>
      <AdminItems />
      <Footer />
    </div>
  );
};

export default AdminItemsPage;
