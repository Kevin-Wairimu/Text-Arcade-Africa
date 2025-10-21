
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
  timeout: 15000, // Match previous timeout
  withCredentials: true, // Align with server.js credentials: true
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
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
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    const { config, response } = error;
    console.error(`❌ Response error from ${config?.baseURL}${config?.url}:`, {
      status: response?.status,
      data: response?.data,
      message: error.message,
    });

    // Specific error messages
    if (!response) {
      console.warn("⚠️ Network error or CORS issue. Check backend CORS for OPTIONS /api/contact.");
    } else if (response.status === 404) {
      console.error("⚠️ Endpoint not found. Verify /api/contact POST handler.");
    } else if (response.status === 400) {
      console.error("⚠️ Bad request. Check payload: ", config.data);
    } else if (response.status === 403) {
      console.error("⚠️ Forbidden. Check CORS credentials or authentication.");
    }

    return Promise.reject(error);
  }
);

export default API;
