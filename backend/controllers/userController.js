// controllers/userController.js
const User = require('../models/User');

// GET /api/users → returns all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/:id/suspend → toggle suspended
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle or set explicitly
    user.suspended = req.body.suspended !== undefined ? req.body.suspended : !user.suspended;
    await user.save();

    res.json({
      message: "User status updated",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        suspended: user.suspended
      }
    });
  } catch (err) {
    console.error("Error suspending user:", err);
    res.status(500).json({ message: "Server error" });
  }
};