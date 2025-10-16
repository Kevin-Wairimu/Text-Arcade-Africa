// ============================================================
// 🌍 Text Africa Arcade - Backend Server
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// ============================================================
// 🧩 IMPORT ROUTES
// ============================================================
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const uploadRoutes = require("./routes/upload");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// ============================================================
// 🚀 INITIALIZE APP
// ============================================================
const app = express();

// ============================================================
// ⚙️ MIDDLEWARE SETUP
// ============================================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://text-africa-arcade.netlify.app",
  "https://65a0bb6462df.ngrok-free.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow server-to-server or curl
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

// Log CORS requests
app.use((req, res, next) => {
  console.log(`🛰  CORS request from: ${req.headers.origin}`);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Global request logger
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================================
// 🧭 ROUTES
// ============================================================
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ============================================================
// 🧠 DATABASE CONNECTION (MongoDB Atlas)
// ============================================================
mongoose.set("strictQuery", true);

const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error("❌ No MONGO_URI found in environment. Please set it in .env or Render dashboard.");
  process.exit(1);
}

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB Atlas successfully!");
    console.log("📦 Database:", mongoose.connection.name);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections:", collections.map((c) => c.name));

    // Start server only after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Atlas connection error:", err.message);
    process.exit(1);
  });

// ============================================================
// ✅ ROOT CHECK
// ============================================================
app.get("/", (req, res) => {
  res.json({
    message: "✅ Backend API is running successfully on Render!",
    database: mongoose.connection.name,
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
