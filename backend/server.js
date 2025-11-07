require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// ROUTES
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const uploadRoutes = require("./routes/upload");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://text-africa-arcade.netlify.app",
  "https://text-arcade-africa.pages.dev",
  // "https://textarcade.africa" // ⬅️ add custom domain here later
];

// ✅ CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed: ${origin || "no-origin"}`);
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ✅ Handle OPTIONS preflight globally
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return res.status(204).end();
  }
  return res.status(403).end();
});

// ✅ Request Logger
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${
      req.headers.origin || "server"
    }`
  );
  next();
});

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// ✅ Health Check
app.get("/api/debug", (req, res) => {
  res.json({ message: "✅ API is live", status: "ok" });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ Root Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🌍 Backend API running successfully",
    database: mongoose.connection.name || "not connected",
    status: "ok",
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.message);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ MongoDB Connection
// ✅ MongoDB Connection
mongoose.set("strictQuery", true);
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error("❌ MONGO_URI missing in .env file");
  process.exit(1);
}

console.log("⏳ Connecting to MongoDB Atlas...");

const http = require("http");
const { Server } = require("socket.io");

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log("📦 Database:", mongoose.connection.name);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📚 Collections:", collections.map(c => c.name).join(", ") || "none");

    // ✅ Setup HTTP + WebSocket
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
    });

    // Middleware to attach io instance to every request
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    io.on("connection", (socket) => {
      console.log("🟢 New WebSocket connection:", socket.id);
      socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
    });

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Public URL: https://text-arcade-africa.onrender.com`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });
