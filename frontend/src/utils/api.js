import axios from "axios";

// Determine baseURL based on environment
const isProduction =
  window.location.hostname !== "localhost" &&
  !window.location.hostname.includes("127.0.0.1");

const baseURL =
  window.ENV?.REACT_APP_API_URL ||
  (isProduction
    ? "https://text-arcade-africa.onrender.com/api" // Production backend
    : "http://localhost:5000/api"); // Local backend

console.log(`📡 API baseURL set to: ${baseURL}`);

// Create Axios instance
const API = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // Ensure cookies/session if needed
});

// Request interceptor (for debugging and headers)
API.interceptors.request.use(
  (config) => {
    // 🧠 Normalize URL paths — remove double `/api` if accidentally included
    if (config.url.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api/, "");
    }

    console.log(`📡 Sending ${config.method.toUpperCase()} request to ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    console.error(`❌ Response error from ${config?.baseURL}${config?.url}:`, {
      status: response?.status,
      data: response?.data,
    });

    // Graceful message if server not reachable
    if (!response) {
      console.error("⚠️ Server not reachable or CORS blocked.");
    }

    return Promise.reject(error);
  }
);

export default API;
