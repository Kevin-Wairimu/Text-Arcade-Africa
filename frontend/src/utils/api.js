// src/utils/api.js
import axios from "axios";

// ✅ 1. Determine backend URL
let BACKEND_URL = import.meta.env.VITE_API_URL;

if (!BACKEND_URL) {
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    BACKEND_URL = "http://localhost:5000"; // local dev
  } else {
    BACKEND_URL = "https://text-arcade-africa-0dj4.onrender.com"; // deployed
  }
}

// ✅ 2. Create Axios instance with /api prefix
const API = axios.create({
  baseURL: `${BACKEND_URL}/api`, // <-- automatically adds /api
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ 3. Log which API base is used
console.log(`🌍 API base URL: ${API.defaults.baseURL}`);

// ✅ 4. Request interceptor for logging and token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (err) => Promise.reject(err)
);

// ✅ 5. Response interceptor for logging & error handling
API.interceptors.response.use(
  (res) => {
    console.log(`✅ Response ${res.config.method?.toUpperCase()} ${res.config.url}`, res.data);
    return res;
  },
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth"; // redirect to login
    }
    console.error(
      `❌ API error ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
      err.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

export default API;
