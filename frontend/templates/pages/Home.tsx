import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-5xl font-bold mb-6">Welcome to the Auction Platform</h1>
      <p className="mb-8 text-gray-700">Bid, Win, and Enjoy!</p>
      <div className="flex gap-4">
        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Login
        </Link>
        <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Register
        </Link>
        <Link to="/active-items" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
          View Active Auctions
        </Link>
      </div>
    </div>
  );
}

export default Home;
