import axios from "axios";

const isProduction = !["localhost", "127.0.0.1"].includes(window.location.hostname);
const BACKEND_URL = isProduction
  ? "https://text-arcade-africa.onrender.com"
  : "http://localhost:5000";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,   // ONE /api only
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

console.log(`API baseURL set to: ${API.defaults.baseURL}`);

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`Sending ${config.method.toUpperCase()} → ${config.baseURL}${config.url}`);
    return config;
  },
  (err) => Promise.reject(err)
);

API.interceptors.response.use(
  (res) => {
    console.log(`Response ${res.config.method.toUpperCase()} ${res.config.url}`, res.data);
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    console.error(`API error ${err.config?.method?.toUpperCase()} ${err.config?.url}`, err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default API;
