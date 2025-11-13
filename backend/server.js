require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const Article = require("./models/Article");

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

// ✅ Allowed origins for CORS (Production + Preview + Local)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  /\.text-arcade-africa\.pages\.dev$/, // ✅ allow all Cloudflare preview URLs
  "https://text-arcade-africa-0dj4.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((allowed) =>
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      );
      if (allowed) return callback(null, true);
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


// ✅ Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ Debug route
app.get("/api/debug", (req, res) => res.json({ message: "API is live ✅" }));

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const __dirnameRoot = path.resolve();
  app.use(express.static(path.join(__dirnameRoot, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirnameRoot, "../frontend/dist", "index.html"));
  });
}

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message,
  });
});

// ✅ MongoDB connection
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

    // ✅ Setup HTTP + WebSocket server
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (
            !origin ||
            allowedOrigins.includes(origin) ||
            /\.text-arcade-africa\.pages\.dev$/.test(origin)
          ) {
            return callback(null, true);
          }
          console.log("❌ Socket.IO Blocked by CORS:", origin);
          return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // ✅ Make `io` available to routes
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // ✅ WebSocket handlers
    io.on("connection", (socket) => {
      console.log("🟢 New WebSocket connection:", socket.id);
      socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
    });

    // ✅ Reset daily views once every 24 hours
    const resetDailyViews = async () => {
      try {
        await Article.updateMany({}, { dailyViews: 0, dailyViewsDate: new Date() });
        console.log("✅ Daily views reset for all articles");
        if (io) io.emit("dailyViewsReset");
      } catch (err) {
        console.error("❌ Failed to reset daily views:", err);
      }
    };

    // Run every 24 hours
    setInterval(resetDailyViews, 24 * 60 * 60 * 1000);

    // ✅ Start server
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
