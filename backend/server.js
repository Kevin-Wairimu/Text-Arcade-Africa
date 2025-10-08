require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const uploadRoutes = require("./routes/upload");
const feedbackRoutes = require("./routes/feedbackRoutes");
const contactRoutes = require("./routes/contactRoutes");


const app = express();

// 1. Enable Cross-Origin Resource Sharing
app.use(cors());

// 2. Add middleware to parse JSON request bodies.
// This is the line that will fix your "400 Bad Request" error.
app.use(express.json({ limit: "5mb" }));

// 3. Add middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// 4. Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

// 5. Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  // If you want to see the body, uncomment the next line, but it can be noisy.
  // if (req.method !== 'GET') console.log('Request Body:', req.body);
  next();
});


// =================================================================
// ROUTES
// =================================================================
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);

// =================================================================
// DATABASE & SERVER START
// =================================================================

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/text-arcade", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Catch-all for 404 Not Found errors (must be after all other routes)
app.use((req, res, next) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));