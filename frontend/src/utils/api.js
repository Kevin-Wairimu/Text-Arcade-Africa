// src/utils/api.js
import axios from "axios";

// Determine backend URL
const isProduction = !["localhost", "127.0.0.1"].includes(window.location.hostname);
const BACKEND_URL = isProduction
  ? "https://text-arcade-africa.onrender.com"
  : "http://localhost:5000";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// =============================================
// 🔥 FRONTEND RETRY LOADING STATE
// =============================================
let loadingRetryCallback = null; // will be set by frontend

export const onRetryLoadingChange = (callback) => {
  loadingRetryCallback = callback;
};

function setRetryLoading(state) {
  if (loadingRetryCallback) loadingRetryCallback(state);
}

// =============================================
// 🔥 BACKGROUND WAKE-UP
// =============================================
async function warmUpServer() {
  try {
    await fetch(`${BACKEND_URL}/api/health`, { method: "GET" });
    console.log("🔥 Render server warmed");
  } catch (err) {
    console.log("⚠️ Warm-up failed (Render asleep)");
  }
}

// Auto-run warmup on app load
warmUpServer();

async function parallelWakeUp() {
  try {
    fetch(`${BACKEND_URL}/api/health`);
  } catch {}
}

// =============================================
// 🔥 SMART AUTO-RETRY
// =============================================
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

    const shouldRetry =
      !err.response || // Network error / timeout
      RETRYABLE_CODES.includes(status);

    if (shouldRetry && config.retryCount < MAX_RETRIES) {
      config.retryCount++;
      const wait = 400 * config.retryCount;

      console.warn(
        `🔄 Retry ${config.retryCount}/${MAX_RETRIES} (${wait}ms) → ${config.url}`
      );

      setRetryLoading(true); // show retry indicator

      // Wake Render backend
      parallelWakeUp();

      await new Promise((resolve) => setTimeout(resolve, wait));
      return API(config);
    }

    setRetryLoading(false);

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }

    return Promise.reject(err);
  }
);

// =============================================
// 🔐 ADD AUTH TOKEN
// =============================================
API.interceptors.request.use(
  (config) => {
    parallelWakeUp(); // wake server before request

    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (err) => Promise.reject(err)
);

export default API;
