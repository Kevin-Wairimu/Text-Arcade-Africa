// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

// ================================
// ROUTES
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
// ✅ Allowed Frontend Origins
// ================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://text-arcade-africa.pages.dev",
  "https://text-arcade-africa-0dj4.onrender.com",
];

// ================================
// ✅ CORS Middleware
// ================================
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// ================================
// ✅ Middleware
// ================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("Uploads"));

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
// ✅ Health & Warmup Endpoints
// ================================
app.get("/api/debug", (req, res) => res.json({ message: "API is live ✅" }));
app.get("/api/ping", (req, res) => res.json({ status: "awake" }));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, message: "Backend ready", uptime: process.uptime() })
);
app.get("/api/warmup", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ warmed: true, message: "Backend warmed" });
  } catch (err) {
    res.json({ warmed: false, error: err.message });
  }
});

// ================================
// ✅ Cloudflare API Proxy (Safe)
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
      return res.status(200).json({
        warning:
          "CF_API_TOKEN or CF_ACCOUNT_ID not set. This endpoint will not fetch real data.",
        data: [],
      });
    }
    const data = await callCloudflareAPI(`/accounts/${CF_ACCOUNT_ID}/access/apps`);
    res.json(data);
  } catch (err) {
    console.error("Cloudflare Access Apps API error:", err.message);
    res.status(500).json({ error: "Failed to fetch Access Apps" });
  }
});

app.get("/api/cloudflare/access/organizations", async (req, res) => {
  try {
    if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
      return res.status(200).json({
        warning:
          "CF_API_TOKEN or CF_ACCOUNT_ID not set. This endpoint will not fetch real data.",
        data: [],
      });
    }
    const data = await callCloudflareAPI(
      `/accounts/${CF_ACCOUNT_ID}/access/organizations`
    );
    res.json(data);
  } catch (err) {
    console.error("Cloudflare Access Organizations API error:", err.message);
    res.status(500).json({ error: "Failed to fetch Access Organizations" });
  }
});

// ================================
// ✅ 404 Handler
// ================================
app.use((req, res) =>
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` })
);

// ================================
// ✅ Global Error Handler
// ================================
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.message);
  const errorMessage =
    process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message;
  res.status(500).json({ error: "Internal Server Error", details: errorMessage });
});

// ================================
// ✅ MongoDB Connection
// ================================
mongoose.set("strictQuery", true);

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: { origin: allowedOrigins, credentials: true },
    });

    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    io.on("connection", (socket) => {
      console.log("🟢 New WebSocket connection:", socket.id);
      socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
    });

    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
