import axios from "axios";

const isProduction = !["localhost", "127.0.0.1"].includes(window.location.hostname);

const baseURL = isProduction
  ? "https://text-arcade-africa.onrender.com" // Production backend, no /api
  : "http://localhost:5000";                  // Local backend, no /api

console.log(`📡 API baseURL set to: ${baseURL}`);

const API = axios.create({
  baseURL,                // No /api in baseURL
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request logging
API.interceptors.request.use(
  (config) => {
    console.log(`📤 Sending ${config.method.toUpperCase()} to ${config.baseURL}${config.url}`);
    return config;
  },
  (err) => Promise.reject(err)
);

// Response logging
API.interceptors.response.use(
  (res) => {
    console.log(`✅ Response from ${res.config.url}:`, res.data);
    return res;
  },
  (err) => {
    console.error(`❌ Response error from ${err.config?.url}:`, err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default API;