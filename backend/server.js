require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");

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
const PORT = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://text-africa-arcade.netlify.app",
];

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed: ${origin || "no-origin"}`);
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  })
);

// Handle all OPTIONS preflights
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.set({
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    });
    console.log(`📥 Handled OPTIONS ${req.originalUrl} from ${origin || "unknown"}`);
    res.status(204).end();
  } else {
    console.log(`❌ OPTIONS blocked for ${origin}`);
    res.status(403).end();
  }
});

// Request logger
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl} from ${req.headers.origin || "unknown"}`);
  next();
});

// Normalize URLs with double /api/api/
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/api/')) {
    console.log(`🔄 Redirecting ${req.method} ${req.originalUrl} to ${req.originalUrl.replace('/api/api/', '/api/')}`);
    req.url = req.url.replace('/api/api/', '/api/');
    req.originalUrl = req.originalUrl.replace('/api/api/', '/api/');
  }
  next();
});

// Body parsers and static files
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Debug route
app.get("/api/debug", (req, res) => {
  console.log("📥 API debug route accessed");
  res.json({ message: "API is accessible", status: "ok" });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// Non-prefixed routes for frontend calls
app.use("/users", userRoutes);
app.use("/articles", articleRoutes);
app.use("/settings", settingsRoutes);

// Test email route
app.get("/api/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const verification = await transporter.verify();
    console.log("✅ SMTP connection verified:", verification);

    if (req.query.send === "true") {
      const mailOptions = {
        from: `"TAA Test" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER || "your-personal-email@example.com",
        subject: "✅ Brevo SMTP Test from Render",
        text: "If you received this email, Brevo SMTP works from Render.",
        replyTo: "test@example.com",
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Test email sent:", { ...mailOptions, messageId: info.messageId });
      res.json({ success: true, message: "Email test sent successfully" });
    } else {
      res.json({ success: true, message: "SMTP connection verified" });
    }
  } catch (err) {
    console.error("❌ SMTP test error:", err.message, err.stack);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Root health check
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
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log("📦 Database:", mongoose.connection.name);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections:", collections.map((c) => c.name));

    const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}));
    const Article = mongoose.models.Article || mongoose.model("Article", new mongoose.Schema({}));
    const Settings = mongoose.models.Settings || mongoose.model("Settings", new mongoose.Schema({}));

    const users = await User.countDocuments();
    const articles = await Article.countDocuments();
    const settings = await Settings.countDocuments();

    console.log(`📊 Data: ${users} users, ${articles} articles, ${settings} settings`);

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message, err.stack);
    process.exit(1);
  });