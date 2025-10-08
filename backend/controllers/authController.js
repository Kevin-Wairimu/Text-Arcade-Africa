const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Article = require("../models/Article");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// EXPORTS THE 'register' FUNCTION
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

    const payload = { user: { id: user.id, role: user.role } };
    const secret = process.env.JWT_SECRET || "your_default_secret_key";

    jwt.sign(payload, secret, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      console.log("SERVER: Registration successful. Sending token.");
      res.status(201).json({
        token,
        user: {
          id: user.id,
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

// EXPORTS THE 'login' FUNCTION
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const secret = process.env.JWT_SECRET || "your_default_secret_key";

    jwt.sign(payload, secret, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      console.log("SERVER: Login successful. Sending token.");
      res.json({
        token,
        user: {
          id: user.id,
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

// UPDATE AN ARTICLE
exports.updateArticle = async (req, res) => {
  console.log(`SERVER: updateArticle controller hit for ID: ${req.params.id}`);

  const { title, content, author, category, featured, image } = req.body;

  // Basic validation
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

    // Update fields
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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({
          message:
            "If an account with that email exists, a reset link has been sent.",
        });
    }

    // --- PART 1: THE DATABASE FIX ---
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiryDate = Date.now() + 3600000; // 1 hour

    // Use findOneAndUpdate for a single, atomic, and more reliable database operation.
    // This is more robust than find() followed by save().
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id }, // Find the user by their unique ID
      {
        $set: {
          // Explicitly set the fields to be updated
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiryDate,
        },
      },
      { new: true } // Ensure the updated document is returned
    );

    // Verify that the update operation was successful
    if (!updatedUser || updatedUser.resetPasswordToken !== hashedToken) {
      console.log("SERVER CRITICAL ERROR: Database update failed silently.");
      throw new Error("Failed to save reset token to the database.");
    }
    console.log("SERVER: HASHED token has been successfully saved to DB.");

    // --- PART 2: THE NODEMAILER FIX ---
    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Text Africa Arcade" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Reset Link",
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #ddd; border-radius: 8px; max-w: 600px; margin: auto;">
          <h2 style="color: #1E6B2B; border-bottom: 2px solid #77BFA1; padding-bottom: 10px;">Password Reset Request</h2>
          <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the button below to be redirected to the password reset page. This link is only valid for one hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #1E6B2B; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Your Password</a>
          </div>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.9em; color: #888;">
            If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br>
            <a href="${resetURL}" style="color: #1E6B2B;">${resetURL}</a>
          </p>
        </div>`, // Your full email HTML
    };

    console.log("SERVER: Attempting to send email...");
    await transporter.sendMail(mailOptions);
    console.log("SERVER: Password reset email sent successfully.");

    res
      .status(200)
      .json({ message: "A password reset link has been sent to your email." });
  } catch (err) {
    console.error("SERVER CRITICAL ERROR during forgot password:", err);
    res.status(500).send("Server error");
  }
};

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
