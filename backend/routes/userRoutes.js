const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

console.log("SERVER: Setting up user routes...");

/**
 * ✅ GET all users (Admin only)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("📥 GET /api/users called by:", req.user?.email || "unknown");

    // Check if authMiddleware didn’t populate req.user
    if (!req.user) {
      console.warn("⚠️ No authenticated user found in request");
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }

    // Restrict access to Admin users
    if (req.user.role !== "Admin") {
      console.warn(`🚫 Access denied for non-admin user: ${req.user.email}`);
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const users = await User.find().select("-password").lean();
    console.log(`✅ Found ${users.length} users`);
    res.status(200).json({ users });
  } catch (err) {
    console.error("❌ Error fetching users:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

/**
 * ✅ DELETE a user (Admin only)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    console.log(`📥 DELETE /api/users/${req.params.id} by:`, req.user?.email || "unknown");

    if (!req.user) {
      console.warn("⚠️ Unauthorized delete attempt: No req.user found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "Admin") {
      console.warn(`🚫 Delete denied for non-admin user: ${req.user.email}`);
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const user = await User.findByIdAndDelete(req.params.id).lean();
    if (!user) {
      console.log("❌ User not found:", req.params.id);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User deleted:", req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message, err.stack);
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
});

/**
 * ✅ SUSPEND / UNSUSPEND a user (Admin only)
 */
router.put("/:id/suspend", authMiddleware, async (req, res) => {
  try {
    console.log(`📥 PUT /api/users/${req.params.id}/suspend by:`, req.user?.email || "unknown");

    if (!req.user) {
      console.warn("⚠️ Unauthorized suspend attempt: No req.user found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "Admin") {
      console.warn(`🚫 Suspend denied for non-admin user: ${req.user.email}`);
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const user = await User.findById(req.params.id).lean();
    if (!user) {
      console.log("❌ User not found:", req.params.id);
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { suspended: !user.suspended },
      { new: true }
    ).select("-password").lean();

    console.log(
      `✅ User ${updatedUser.suspended ? "suspended" : "unsuspended"}:`,
      updatedUser._id
    );

    res.status(200).json({
      message: `User ${updatedUser.suspended ? "suspended" : "unsuspended"} successfully`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Error updating user status:", err.message, err.stack);
    res.status(500).json({ error: "Failed to update user status", details: err.message });
  }
});

module.exports = router;
