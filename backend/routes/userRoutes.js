const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ GET all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ DELETE a user
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ✅ SUSPEND / UNSUSPEND a user
router.put("/:id/suspend", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.suspended = !user.suspended;
    await user.save();

    res.status(200).json({
      message: `User ${user.suspended ? "suspended" : "unsuspended"} successfully`,
      user,
    });
  } catch (err) {
    console.error("Error updating user status:", err);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

module.exports = router;
