// src/utils/api.js
import axios from "axios";

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
// 🔥 1. BACKGROUND WAKE-UP PING (non-blocking)
// =============================================
async function warmUpServer() {
  try {
    await fetch(`${BACKEND_URL}/api/health`, { method: "GET" });
    console.log("🔥 Render server warmed");
  } catch (err) {
    console.log("⚠️ Warm-up failed (Render asleep)");
  }
}

// Auto-run warmup every time app loads
warmUpServer();

// =============================================
// 🔥 2. PARALLEL WAKE-UP REQUEST
// (executes at same time as main API request)
// =============================================
async function parallelWakeUp() {
  try {
    fetch(`${BACKEND_URL}/api/health`);
  } catch {}
}

// =============================================
// 🔥 3. SMART AUTO-RETRY SYSTEM
// =============================================
const RETRYABLE_CODES = [408, 429, 500, 502, 503, 504];
const MAX_RETRIES = 4;

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    if (!config) return Promise.reject(err);

    config.retryCount = config.retryCount || 0;

    const status = err.response?.status;

    const retry =
      !err.response || // Timeouts / Render asleep
      RETRYABLE_CODES.includes(status);

    if (retry && config.retryCount < MAX_RETRIES) {
      config.retryCount++;

      const wait = 400 * config.retryCount;

      console.warn(
        `🔄 Retry ${config.retryCount}/${MAX_RETRIES} (${wait}ms)... → ${config.url}`
      );

      // Attempt to wake Render faster
      parallelWakeUp();

      await new Promise((resolve) => setTimeout(resolve, wait));
      return API(config);
    }

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }

    return Promise.reject(err);
  }
);

// =============================================
// 🔐 ADD AUTH TOKEN TO REQUESTS
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
