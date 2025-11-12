const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Article = require("../models/Article");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");

// ───────────────────────────────────────────────────────────────
// 1. REGISTER
// ───────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  console.log("SERVER: Register controller hit with body:", req.body);
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    user = new User({ name, email, password, role: role || "Client" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    console.log("SERVER: New user saved to database:", user);

    // FIXED: Use `id` and `role` directly in payload
    const payload = { id: user._id, role: user.role };
    const secret = process.env.JWT_SECRET || "your_default_secret_key";

    jwt.sign(payload, secret, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      console.log("SERVER: Registration successful. Sending token.");
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (err) {
    console.error("SERVER REGISTER ERROR:", err.message);
    res.status(500).send("Server error");
  }
};

// ───────────────────────────────────────────────────────────────
// 2. LOGIN
// ───────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  console.log("SERVER: Login controller has been hit.");
  console.log("SERVER: Received request body:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // BLOCK SUSPENDED USERS
    if (user.suspended) {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // FIXED: Use `id` and `role` directly
    const payload = { id: user._id, role: user.role };
    const secret = process.env.JWT_SECRET || "your_default_secret_key";

    jwt.sign(payload, secret, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      console.log("SERVER: Login successful. Sending token.");
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (err) {
    console.error("SERVER CRITICAL ERROR:", err.message);
    res.status(500).send("Server error");
  }
};

// ───────────────────────────────────────────────────────────────
// 3. UPDATE ARTICLE
// ───────────────────────────────────────────────────────────────
exports.updateArticle = async (req, res) => {
  console.log(`SERVER: updateArticle controller hit for ID: ${req.params.id}`);

  const { title, content, author, category, featured, image } = req.body;

  if (!title || !content || !category) {
    return res
      .status(400)
      .json({ message: "Title, content, and category are required." });
  }

  try {
    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.title = title;
    article.content = content;
    article.author = author;
    article.category = category;
    article.featured = featured;
    article.image = image;

    const updatedArticle = await article.save();

    console.log("SERVER: Article updated successfully:", updatedArticle.title);
    res.json(updatedArticle);
  } catch (err) {
    console.error("SERVER ERROR updating article:", err.message);
    res.status(500).send("Server Error");
  }
};

// ───────────────────────────────────────────────────────────────
// 4. FORGOT PASSWORD
// ───────────────────────────────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Always respond with a generic message to prevent account enumeration
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiryDate = Date.now() + 3600000; // 1 hour

    // Save hashed token & expiry to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiryDate;
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1E6B2B;">Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align:center; margin:20px 0;">
          <a href="${resetURL}" style="background:#1E6B2B;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;">Reset Password</a>
        </div>
        <p>If you did not request this, ignore this email.</p>
        <p style="font-size:0.8em;color:#666;">Or copy and paste this URL into your browser: ${resetURL}</p>
      </div>
    `;

    // Send email via sendEmail utility (handles Gmail/TLS or API)
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: htmlContent,
    });

    res.status(200).json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("SERVER ERROR during forgot password:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ───────────────────────────────────────────────────────────────
// 5. RESET PASSWORD
// ───────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const plainTokenFromURL = req.params.token;
    const hashedTokenToSearch = crypto
      .createHash("sha256")
      .update(plainTokenFromURL)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedTokenToSearch,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Password has been updated successfully!" });
  } catch (err) {
    console.error("SERVER CRITICAL ERROR during password reset:", err);
    res.status(500).send("Server error");
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res
      .status(200)
      .json({ message: "Password has been updated successfully." });
  } catch (err) {
    console.error("SERVER ERROR during password reset:", err);
    res.status(500).json({ message: "Server error" });
  }
};
