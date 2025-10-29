// routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { authenticateToken, protect, admin } = require("../middleware/authMiddleware");

console.log("SERVER: Setting up settings routes...");

// PUBLIC: GET /api/settings (logs "admin" or "unknown")
router.get("/", authenticateToken, getSettings);

// ADMIN-ONLY: PUT /api/settings
router.put("/", protect, admin, updateSettings);

module.exports = router;