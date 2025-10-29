require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");

// IMPORT ROUTES
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const uploadRoutes = require("./routes/upload");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://text-africa-arcade.netlify.app",
];

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`CORS allowed: ${origin || "no-origin"}`);
        callback(null, true);
      } else {
        console.log(`CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// OPTIONS
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.set({
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Credentials": "true",
    });
    res.status(204).end();
  } else {
    res.status(403).end();
  }
});

// REQUEST LOGGER
app.use((req, res, next) => {
  const method = req.method;
  const icon =
    method === "GET"
      ? "GET"
      : method === "POST"
      ? "POST"
      : method === "PUT"
      ? "PUT"
      : method === "DELETE"
      ? "DELETE"
      : "REQ";
  console.log(
    `${icon} ${req.originalUrl} from ${req.headers.origin || "unknown"}`
  );
  next();
});

// BODY & STATIC
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// DEBUG
app.get("/api/debug", (req, res) => {
  res.json({ message: "API is live", status: "ok" });
});

// MOUNT ROUTES
console.log("Mounting routes...");
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ROOT
app.get("/", (req, res) => {
  res.json({
    message: "Backend API running",
    database: mongoose.connection.name || "not connected",
    status: "ok",
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// ERROR
app.use((err, req, res, next) => {
  console.error(`Server error: ${err.message}`);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message });
});

// DB + SERVER
mongoose.set("strictQuery", true);
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error("MONGO_URI not set in .env");
  process.exit(1);
}

console.log("Connecting to MongoDB Atlas...");

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    console.log("Database:", mongoose.connection.name);

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("Collections:", collections.map((c) => c.name).join(", "));

    const User =
      mongoose.models.User || mongoose.model("User", new mongoose.Schema({}));
    const Article =
      mongoose.models.Article ||
      mongoose.model("Article", new mongoose.Schema({}));
    const Settings =
      mongoose.models.Settings ||
      mongoose.model("Settings", new mongoose.Schema({}));

    const [users, articles, settings] = await Promise.all([
      User.countDocuments(),
      Article.countDocuments(),
      Settings.countDocuments(),
    ]);

    console.log(
      `Data: ${users} users, ${articles} articles, ${settings} settings`
    );

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });
