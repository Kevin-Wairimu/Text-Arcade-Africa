// routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { sendContactMessage } = require("../controllers/contactController");

console.log("SERVER: Setting up contact routes...");

// ✅ POST /api/contact
router.post("/", sendContactMessage);

module.exports = router;
