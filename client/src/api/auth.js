const TOKEN_KEY = "rbv_auth_token";
const USER_KEY = "rbv_auth_user";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredUser() {
  try {
    const userRaw = localStorage.getItem(USER_KEY);
    return userRaw ? JSON.parse(userRaw) : null;
  } catch {
    return null;
  }
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

async function register(payload) {
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setSession(data.token, data.user);
  return data.user;
}

async function login(payload) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setSession(data.token, data.user);
  return data.user;
}

async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const data = await apiRequest("/api/auth/me", { method: "GET" });
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  } catch {
    clearSession();
    return null;
  }
}

async function logout() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } finally {
    clearSession();
  }
}

export const authApi = {
  getStoredUser,
  getCurrentUser,
  login,
  register,
  logout,
  apiRequest,
};
