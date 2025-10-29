// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

console.log("SERVER: Setting up user routes...");

// GET /api/users
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/suspend
router.put("/:id/suspend", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.suspended = req.body.suspended ?? !user.suspended;
    await user.save();

    res.json({ message: "Status updated", suspended: user.suspended });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;  // MUST BE router, NOT { ... }