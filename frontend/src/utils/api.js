import axios from "axios";

const isProduction = !["localhost", "127.0.0.1"].includes(window.location.hostname);

// ✅ Prefer environment variable (from Cloudflare)
const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  (isProduction
    ? "https://text-arcade-africa-0dj4.onrender.com" // your Render backend
    : "http://localhost:5000");

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

console.log(`🌍 API base URL: ${API.defaults.baseURL}`);

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`➡️ Sending ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (err) => Promise.reject(err)
);

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    console.error("❌ API error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default API;
