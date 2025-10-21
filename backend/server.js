require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const uploadRoutes = require("./routes/upload");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Initialize app
const app = express();

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://text-africa-arcade.netlify.app",
  "https://text-arcade-africa.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed: ${origin || "no-origin"}`);
        return callback(null, true);
      }
      console.log(`❌ CORS blocked: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Request logger
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl} from ${req.headers.origin || "unknown"}`);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debug route
app.get("/api/debug", (req, res) => {
  console.log("📥 API debug route accessed");
  res.json({ message: "API is accessible", status: "ok", baseUrl: req.baseUrl, url: req.url });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// Error middleware
app.use((err, req, res, next) => {
  console.error(`❌ Server error: ${err.message}`, err.stack);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// Database connection
mongoose.set("strictQuery", true);
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log("📦 Database:", mongoose.connection.name);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections:", collections.map((c) => c.name));
    const users = await mongoose.model("User").countDocuments();
    const articles = await mongoose.model("Article").countDocuments();
    const settings = await mongoose.model("Settings").countDocuments();
    console.log(`📊 Data: ${users} users, ${articles} articles, ${settings} settings`);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message, err.stack);
    process.exit(1);
  });

// Root check
app.get("/", (req, res) => {
  res.json({
    message: "✅ Backend API running on Render",
    database: mongoose.connection.name,
    status: "ok",
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`⚠️ Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});