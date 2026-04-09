// src/utils/api.js
import axios from "axios";

// ================================
// 🔹 Backend URL
// ================================
const hostname = window.location.hostname;
const isProduction = !["localhost", "127.0.0.1"].includes(hostname);

export const BACKEND_URL = isProduction
  ? "https://text-arcade-africa-0dj4.onrender.com"
  : "http://localhost:5000";

// ================================
// 🔹 Axios Instance
// ================================
const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  // NOTE: withCredentials only needed if using cookies/sessions.
  // Since you use Bearer tokens in Authorization header, this is false.
  // Set to true only if you add cookie-based auth later.
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// ================================
// 🔹 Retry Loading State (optional UI feedback)
// ================================
let loadingRetryCallback = null;

export const onRetryLoadingChange = (callback) => {
  loadingRetryCallback = callback;
};

function setRetryLoading(state) {
  if (loadingRetryCallback) loadingRetryCallback(state);
}

// ================================
// 🔹 Backend Warmup (once on app load)
// ================================
export async function warmUpServer() {
  try {
    await fetch(`${BACKEND_URL}/api/health`, { method: "GET" });
    console.log("🔥 Backend warmed up");
  } catch {
    console.warn("⚠️ Warmup failed — backend may be sleeping");
  }
}

// Run once when the app loads
warmUpServer();

// ================================
// 🔹 Request Interceptor — attach token
// ================================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ================================
// 🔹 Response Interceptor — smart retry
// ================================
const RETRYABLE_CODES = [408, 429, 500, 502, 503, 504];
const MAX_RETRIES = 3;

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

    // Retry on network errors or specific HTTP codes
    const shouldRetry =
      !err.response || // pure network error (ERR_NETWORK, ERR_CONNECTION_REFUSED)
      RETRYABLE_CODES.includes(status);

    if (shouldRetry && config.retryCount < MAX_RETRIES) {
      config.retryCount++;
      const delay = 500 * config.retryCount; // 500ms, 1000ms, 1500ms

      console.warn(`🔄 Retry ${config.retryCount}/${MAX_RETRIES} in ${delay}ms → ${config.url}`);
      setRetryLoading(true);

      // Wake up backend on first retry only (avoid hammering)
      if (config.retryCount === 1) {
        fetch(`${BACKEND_URL}/api/health`).catch(() => {});
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      return API(config);
    }

    setRetryLoading(false);

    // Auto logout on 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default API;