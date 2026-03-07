import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Rainbow Valley Broadband</h1>
      <p>MERN migration baseline is now active.</p>

      {!user ? (
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span>
            Signed in as <strong>{user.name}</strong> ({user.role})
          </span>
          {user.role === "admin" && <Link to="/admin">Admin</Link>}
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </main>
  );
}

export default HomePage;
