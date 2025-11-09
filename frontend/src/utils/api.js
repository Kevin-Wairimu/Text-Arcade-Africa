// src/utils/api.js
import axios from "axios";

const isProduction = !["localhost", "127.0.0.1"].includes(window.location.hostname);

const BACKEND_URL = isProduction
  ? "https://text-arcade-africa.onrender.com" // ✅ Your Render backend
  : "http://localhost:5000"; // ✅ Local backend

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`, // Ensure single /api
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
  (res) => {
    console.log(`✅ Response ${res.config.method.toUpperCase()} ${res.config.url}`, res.data);
    return res;
  },
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth"; // Redirect to login if unauthorized
    }
    console.error(
      `❌ API error ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
      err.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

export default API;
