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
// ✅ CORS Setup
// ================================
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",")
  : ["http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked CORS request from:", origin);
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
// ✅ API Routes
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ================================
// ✅ Health & Warmup
// ================================
app.get("/api/health", (req, res) =>
  res.json({ ok: true, message: "Backend ready", uptime: process.uptime() })
);

// ================================
// ✅ Cloudflare API Proxy (Optional)
// ================================
const CF_API_BASE = "https://api.cloudflare.com/client/v4";
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;

async function callCloudflareAPI(url) {
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID) throw new Error("Cloudflare credentials missing");
  const res = await axios.get(`${CF_API_BASE}${url}`, {
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

app.get("/api/cloudflare/access/apps", async (req, res) => {
  try {
    if (!CF_API_TOKEN || !CF_ACCOUNT_ID)
      return res.json({ warning: "CF credentials missing", data: [] });
    const data = await callCloudflareAPI(`/accounts/${CF_ACCOUNT_ID}/access/apps`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Access Apps" });
  }
});

app.get("/api/cloudflare/access/organizations", async (req, res) => {
  try {
    if (!CF_API_TOKEN || !CF_ACCOUNT_ID)
      return res.json({ warning: "CF credentials missing", data: [] });
    const data = await callCloudflareAPI(`/accounts/${CF_ACCOUNT_ID}/access/organizations`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Access Organizations" });
  }
});

// ================================
// ✅ 404 Handler
// ================================
app.use((req, res) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

// ================================
// ✅ Global Error Handler
// ================================
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.message);
  const errorMessage = process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message;
  res.status(500).json({ error: "Internal Server Error", details: errorMessage });
});

// ================================
// ✅ MongoDB Connection + Socket.io
// ================================
mongoose.set("strictQuery", true);
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
