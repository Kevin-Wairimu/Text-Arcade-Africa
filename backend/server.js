// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors"); // You already have this! We will now use it.
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

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

// ================================
// ✅ Allowed Frontend Origins
// (This list is perfect, no changes needed)
// ================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://text-africa-arcade.netlify.app",
  "https://text-arcade-africa.pages.dev",
];

// =============================================================================
// ✅ **FIXED:** Replaced custom middleware with the standard `cors` package
// This is more robust and handles all CORS edge cases automatically.
// =============================================================================
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    // and requests from our whitelist.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // This allows cookies and authorization headers
};

// Apply the CORS middleware. This MUST come before your API routes.
app.use(cors(corsOptions));
// The cors package automatically handles OPTIONS pre-flight requests.
// =============================================================================


// ================================
// ✅ Middleware
// ================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("Uploads"));

// ================================
// ✅ API ROUTES
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ================================
// ✅ Health & Warmup Endpoints
// ================================
app.get("/api/debug", (req, res) => res.json({ message: "API is live ✅" }));
app.get("/api/ping", (req, res) => res.json({ status: "awake" }));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, message: "Backend ready", uptime: process.uptime() })
);
app.get("/api/warmup", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ warmed: true, message: "Render backend warmed" });
  } catch (err) {
    res.json({ warmed: false, error: err.message });
  }
});

// ================================
// ✅ 404 Handler
// ================================
app.use((req, res) =>
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` })
);

// ================================
// ✅ Global Error Handler
// ================================
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.message);
  // Hide detailed error messages in production for security
  const errorMessage = process.env.NODE_ENV === 'production'
    ? "Internal Server Error"
    : err.message;
  res.status(500).json({ error: "Internal Server Error", details: errorMessage });
});

// ================================
// ✅ MongoDB Connection
// ================================
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

    const server = http.createServer(app);
    
    // Your socket.io CORS config is already perfect!
    const io = new Server(server, {
      cors: { origin: allowedOrigins, credentials: true },
    });

    // Attach socket.io to requests
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    io.on("connection", (socket) => {
      console.log("🟢 New WebSocket connection:", socket.id);
      socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
    });

    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });