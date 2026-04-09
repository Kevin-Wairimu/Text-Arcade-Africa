// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const supabase = require("./config/supabase");

// ================================
// ROUTES IMPORTS
// ================================
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const uploadRoutes = require("./routes/upload");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ================================
// ✅ ALLOWED ORIGINS
// ================================
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "https://text-arcade-africa.pages.dev",
  "https://text-arcade-africa-0dj4.onrender.com",
];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow server-to-server / curl / Postman
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith("http://localhost")) return true;
  if (origin.endsWith(".text-arcade-africa.pages.dev")) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn("⚠️ Blocked CORS from:", origin);
      callback(new Error(`CORS policy blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200, // fixes IE11 preflight issues
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle all preflight requests

// ================================
// ✅ MIDDLEWARE
// ================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ================================
// ✅ API ROUTES
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ================================
// ✅ HEALTH & WARMUP ENDPOINTS
// ================================
app.get("/api/debug", (req, res) =>
  res.json({ message: "API is live ✅", env: process.env.NODE_ENV })
);

app.get("/api/ping", (req, res) =>
  res.json({ status: "awake", timestamp: new Date().toISOString() })
);

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    message: "Backend ready",
    uptime: Math.round(process.uptime()),
    db: "supabase",
  })
);

app.get("/api/warmup", async (req, res) => {
  try {
    // Simple query to warm up Supabase
    await supabase.from('articles').select('id', { count: 'exact', head: true });
    res.json({ warmed: true, message: "Backend & Supabase warmed ✅" });
  } catch (err) {
    res.status(500).json({ warmed: false, error: err.message });
  }
});

// ================================
// ✅ CLOUDFLARE API PROXY
// ================================
const CF_API_BASE = "https://api.cloudflare.com/client/v4";
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;

const callCloudflareAPI = async (url) => {
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
    throw new Error("⚠️ Cloudflare credentials not set in .env");
  }
  const res = await axios.get(`${CF_API_BASE}${url}`, {
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

app.get("/api/cloudflare/access/apps", async (req, res) => {
  try {
    if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
      return res.status(200).json({ warning: "CF credentials not set.", data: [] });
    }
    const data = await callCloudflareAPI(`/accounts/${CF_ACCOUNT_ID}/access/apps`);
    res.json(data);
  } catch (err) {
    console.error("CF Access Apps error:", err.message);
    res.status(500).json({ error: "Failed to fetch Access Apps" });
  }
});

app.get("/api/cloudflare/access/organizations", async (req, res) => {
  try {
    if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
      return res.status(200).json({ warning: "CF credentials not set.", data: [] });
    }
    const data = await callCloudflareAPI(`/accounts/${CF_ACCOUNT_ID}/access/organizations`);
    res.json(data);
  } catch (err) {
    console.error("CF Access Organizations error:", err.message);
    res.status(500).json({ error: "Failed to fetch Access Organizations" });
  }
});

// ================================
// ✅ 404 HANDLER
// ================================
app.use((req, res) =>
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` })
);

// ================================
// ✅ GLOBAL ERROR HANDLER
// ================================
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.message);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    error: "Internal Server Error",
    details: isProd ? undefined : err.message,
  });
});

// ================================
// ✅ SERVER STARTUP
// ================================
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("❌ Supabase credentials missing from .env — exiting.");
  process.exit(1);
}

const startServer = async () => {
  try {
    console.log("✅ Supabase client initialized");
    
    const server = http.createServer(app);

    // ================================
    // ✅ SOCKET.IO
    // ================================
    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (isOriginAllowed(origin)) callback(null, true);
          else callback(new Error("Socket.IO CORS blocked: " + origin));
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Make io available in all routes via req.io
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    io.on("connection", (socket) => {
      console.log("🟢 Socket connected:", socket.id);
      socket.on("disconnect", () => console.log("🔴 Socket disconnected:", socket.id));
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 ENV: ${process.env.NODE_ENV || "development"}`);
    });

  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
};

startServer();