// src/utils/api.js
import axios from "axios";

// ================================
// 🔹 Determine Backend URL
// ================================
const hostname = window.location.hostname;
const isProduction = !["localhost", "127.0.0.1"].includes(hostname);
const BACKEND_URL = isProduction
  ? "https://text-arcade-africa-0dj4.onrender.com" // Render backend
  : "http://localhost:5000";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  withCredentials: true, // ✅ for cookies / JWT in cross-origin
  headers: { "Content-Type": "application/json" },
});

// ================================
// 🔹 Frontend Retry Loading State
// ================================
let loadingRetryCallback = null; // will be set by frontend

export const onRetryLoadingChange = (callback) => {
  loadingRetryCallback = callback;
};

function setRetryLoading(state) {
  if (loadingRetryCallback) loadingRetryCallback(state);
}

// ================================
// 🔹 Backend Warmup
// ================================
async function warmUpServer() {
  try {
    await fetch(`${BACKEND_URL}/api/health`, { method: "GET", credentials: "include" });
    console.log("🔥 Backend warmed");
  } catch (err) {
    console.warn("⚠️ Warm-up failed (backend asleep or network issue)");
  }
}

// Auto-run warmup on app load
warmUpServer();

function parallelWakeUp() {
  try {
    fetch(`${BACKEND_URL}/api/health`, { credentials: "include" });
  } catch {}
}

// ================================
// 🔹 Smart Auto-Retry
// ================================
const RETRYABLE_CODES = [408, 429, 500, 502, 503, 504];
const MAX_RETRIES = 4;

API.interceptors.response.use(
  (res) => {
    setRetryLoading(false);
    return res;
  },
  async (err) => {
    const config = err.config;
    if (!config) return Promise.reject(err);

    config.retryCount = config.retryCount || 0;
    const status = err.response?.status;

    const shouldRetry = !err.response || RETRYABLE_CODES.includes(status);

    if (shouldRetry && config.retryCount < MAX_RETRIES) {
      config.retryCount++;
      const wait = 400 * config.retryCount;

      console.warn(
        `🔄 Retry ${config.retryCount}/${MAX_RETRIES} (${wait}ms) → ${config.url}`
      );

      setRetryLoading(true);
      parallelWakeUp();
      await new Promise((resolve) => setTimeout(resolve, wait));
      return API(config);
    }

    setRetryLoading(false);

    // Force logout if unauthorized
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }

    return Promise.reject(err);
  }
);

// ================================
// 🔹 Add Auth Token to Requests
// ================================
API.interceptors.request.use(
  (config) => {
    parallelWakeUp();

    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (err) => Promise.reject(err)
);

export default API;
