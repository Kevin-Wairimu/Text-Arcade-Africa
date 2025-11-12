// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  suspendUser,
} = require("../controllers/userController");

console.log("SERVER: Setting up user routes...");

// ✅ GET /api/users - Admin can view all users
router.get("/", protect, admin, getAllUsers);

// ✅ PATCH /api/users/:id/suspend - Admin can suspend/unsuspend user
router.patch("/:id/suspend", protect, admin, suspendUser);

module.exports = router;
