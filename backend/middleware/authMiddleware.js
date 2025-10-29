// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require("../models/User");

// 1. OPTIONAL AUTH – logs **email (role)** for EVERY request
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    console.log(`API ${req.method} ${req.originalUrl} called by user: unknown`);
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      req.user = null;
      console.log(`API ${req.method} ${req.originalUrl} called by user: unknown (not found)`);
      return next();
    }

    req.user = user;
    console.log(`API ${req.method} ${req.originalUrl} called by user: ${user.email} (${user.role})`);
    next();
  } catch (err) {
    req.user = null;
    console.log(`API ${req.method} ${req.originalUrl} called by user: unknown (invalid token)`);
    next();
  }
};

// 2. REQUIRED AUTH – 401 if no token
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.suspended) return res.status(403).json({ message: "Account suspended." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// 3. ADMIN ONLY
const admin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin")
    return res.status(403).json({ message: "Admin access required" });
  next();
};

module.exports = { authenticateToken, protect, admin };