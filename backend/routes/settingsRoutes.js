const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authMiddleware");

console.log("SERVER: Setting up settings routes...");

// Public route
router.get("/", getSettings);

// Protected route
router.put("/", authMiddleware, updateSettings);

module.exports = router;