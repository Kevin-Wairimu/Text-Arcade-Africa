const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

// POST /api/users → create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/:id → update a user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role, suspended } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (suspended !== undefined) user.suspended = suspended;
    if (password) user.password = password; // Model middleware will hash it

    await user.save();

    res.json({
      message: "User updated successfully",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, suspended: user.suspended }
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/users/:id → delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/:id/suspend → toggle suspended
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.suspended = req.body.suspended !== undefined ? req.body.suspended : !user.suspended;
    await user.save();

    res.json({
      message: "User status updated",
      user: { _id: user._id, suspended: user.suspended }
    });
  } catch (err) {
    console.error("Error suspending user:", err);
    res.status(500).json({ message: "Server error" });
  }
};
