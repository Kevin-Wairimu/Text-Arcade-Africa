const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");

// ✅ Import the default middleware (your authMiddleware.js exports one function)
const authMiddleware = require("../middleware/authMiddleware");

// Public route (anyone can fetch settings)
router.get("/", getSettings);

// Protected route (requires token)
router.put("/", authMiddleware, updateSettings);

module.exports = router;
