import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "https://65a0bb6462df.ngrok-free.app" // 👈 ngrok URL for local frontend
      : "https://text-arcade-africa.onrender.com"), // 👈 Render backend for Netlify
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
