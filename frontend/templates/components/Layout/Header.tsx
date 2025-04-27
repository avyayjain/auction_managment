import { getToken, removeToken } from "../../utils/auth";

const Header = () => {
  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };

  return (
    <header>
      <h1>Real-Time Auction</h1>
      {getToken() ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <>
          <a href="/login">Login</a> | <a href="/register">Register</a>
        </>
      )}
    </header>
  );
};

export default Header;
