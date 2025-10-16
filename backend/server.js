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

// ✅ Allow both local dev and production frontends
const allowedOrigins = [
  "http://localhost:5173",
  "https://text-africa-arcade.netlify.app", // ✅ removed trailing slash
  "https://65a0bb6462df.ngrok-free.app"
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`🛰  CORS request from: ${req.headers.origin}`);
  next();
});


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Log every request (for debugging)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
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
mongoose.set("strictQuery", true); // helps avoid deprecation warnings

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/text-arcade", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000,
  })
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    console.log("📦 Connected to DB:", mongoose.connection.name);

    // List all collections in this database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections:", collections.map(c => c.name));

    // ✅ Start the server only after DB is connected
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ============================================================
// 🧩 ROOT CHECK
// ============================================================
app.get("/", (req, res) => {
  res.json({
    message: "✅ Backend API is running successfully on Render!",
    status: "ok",
  });
});

// ============================================================
// 🚨 404 HANDLER
// ============================================================
app.use((req, res) => {
  console.log(`⚠️ Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});
