const supabase = require("../config/supabase");
const bcrypt = require('bcryptjs');

// GET /api/users → returns all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, suspended, created_at');

    if (error) throw error;
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
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
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
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (suspended !== undefined) updateData.suspended = suspended;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Ensure we don't send Mongoose fields if they leaked into req.body
    delete updateData._id;
    delete updateData.id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.created_at;
    delete updateData.updated_at;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User updated successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role, suspended: user.suspended }
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/users/:id → delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/:id/suspend → toggle suspended
exports.suspendUser = async (req, res) => {
  try {
    // First get current suspended status
    const { data: currentUser, error: getError } = await supabase
      .from('users')
      .select('suspended')
      .eq('id', req.params.id)
      .single();

    if (getError || !currentUser) return res.status(404).json({ message: "User not found" });

    const newSuspended = req.body.suspended !== undefined ? req.body.suspended : !currentUser.suspended;

    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ suspended: newSuspended })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: "User status updated",
      user: { id: user.id, suspended: user.suspended }
    });
  } catch (err) {
    console.error("Error suspending user:", err);
    res.status(500).json({ message: "Server error" });
  }
};
