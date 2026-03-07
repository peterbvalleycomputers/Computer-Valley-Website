import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [statsData, usersData] = await Promise.all([
          authApi.apiRequest("/api/admin/stats", { method: "GET" }),
          authApi.apiRequest("/api/admin/users", { method: "GET" }),
        ]);

        if (!active) return;
        setStats(statsData);
        setUsers(usersData.users || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load admin data.");
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Admin Dashboard</h1>
      <p>
        Signed in as <strong>{user?.name}</strong>
      </p>
      <p>
        <Link to="/">Back to home</Link>
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {stats && (
        <section>
          <h2>Stats</h2>
          <ul>
            <li>Total users: {stats.totalUsers}</li>
            <li>Admin users: {stats.adminUsers}</li>
            <li>Regular users: {stats.regularUsers}</li>
          </ul>
        </section>
      )}

      <section>
        <h2>Users</h2>
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              {u.name} — {u.email} ({u.role})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default AdminPage;
