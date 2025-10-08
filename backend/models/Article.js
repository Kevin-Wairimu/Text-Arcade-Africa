const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Text Africa Arcade" },
    image: { type: String }, // ✅ new (base64 or URL)
    category: {
      type: String,
      enum: ["Politics", "Business", "Technology", "Sports", "Health", "Entertainment", "General"],
      default: "General",
    },
    featured: { type: Boolean, default: false }, // ✅ new
    publishedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 }, // ✅ for trending articles
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
