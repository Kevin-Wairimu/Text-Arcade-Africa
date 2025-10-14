require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Import route modules
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const uploadRoutes = require("./routes/upload");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Initialize express app
const app = express();

// ============================================================
// 🔧 MIDDLEWARE SETUP
// ============================================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Allow your Netlify frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads (for images)
app.use("/uploads", express.static("uploads"));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================================
// 🚏 ROUTES
// ============================================================
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ============================================================
// 🧠 DATABASE CONNECTION
// ============================================================
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/text-arcade", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ============================================================
// 🧩 API ONLY BACKEND (Netlify handles frontend)
// ============================================================

// Root route to verify server status
app.get("/", (req, res) => {
  res.send("✅ Backend API is running successfully on Render!");
});

// ============================================================
// 🚨 404 HANDLER
// ============================================================
app.use((req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// ============================================================
// 🚀 START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
