const express = require("express");
const router = express.Router();
const { sendFeedback } = require("../controllers/feedbackController");

// POST /api/feedback
router.post("/", sendFeedback);

module.exports = router;
