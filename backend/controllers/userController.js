// controllers/userController.js
const User = require("../models/User");

// ✅ GET /api/users → returns all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();

    if (!users || users.length === 0) {
      return res.status(200).json([]); // frontend will show "No users found"
    }

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error while fetching users" });
  }
};

// ✅ PATCH /api/users/:id/suspend → toggle or explicitly set suspension
exports.suspendUser = async (req, res) => {
  try {
    const { suspended } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Toggle or explicitly set the suspended flag
    user.suspended =
      typeof suspended === "boolean" ? suspended : !user.suspended;

    await user.save();

    res.status(200).json({
      message: `User ${user.suspended ? "suspended" : "unsuspended"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        suspended: user.suspended,
      },
    });
  } catch (err) {
    console.error("❌ Error updating user suspension:", err);
    res.status(500).json({ error: "Server error while updating user status" });
  }
};
