const express = require("express");
const router = express.Router();
const { sendContactMessage } = require("../controllers/contactController");

console.log("SERVER: Setting up contact routes...");

router.get("/test", (req, res) => {
  console.log("📡 Contact test route hit!");
  res.json({ message: "✅ Contact route is reachable." });
});

// ✅ POST /api/contact — main contact form endpoint
router.post("/", sendContactMessage);

// ✅ Optional: GET /api/contact/test — check Brevo connectivity
router.get("/test", async (req, res) => {
  res.json({ message: "✅ Contact route is reachable." });
});

module.exports = router;
