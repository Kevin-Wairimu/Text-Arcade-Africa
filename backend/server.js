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

// ✅ Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://text-africa-arcade.netlify.app",
  "https://text-arcade-africa.pages.dev",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

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

// ✅ Simple debug endpoint
app.get("/api/debug", (req, res) => res.json({ message: "API is live ✅" }));

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const __dirnameRoot = path.resolve();
  app.use(express.static(path.join(__dirnameRoot, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirnameRoot, "../frontend/dist", "index.html"));
  });
}


// ✅ 404 fallback for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.message);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
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

    // ✅ Reset daily views once every 24h
    const resetDailyViews = async () => {
      try {
        await Article.updateMany({}, { dailyViews: 0, dailyViewsDate: new Date() });
        console.log("✅ Daily views reset for all articles");
        if (io) io.emit("dailyViewsReset");
      } catch (err) {
        console.error("❌ Failed to reset daily views:", err);
      }
    };

    setInterval(resetDailyViews, 24 * 60 * 60 * 1000);

    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
