// models/Article.js
const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Text Africa Arcade" },
    image: { type: String }, // base64 or URL
    category: {
      type: String,
      enum: [
        // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
        "Media Review",
        "Expert Insights",
        "Reflections",
        "Technology",
        "Events",
        "Digests",
        "Innovation",
        "Expert View",
        "Trends",
        "Reports",
        "Archives"
      ],
      default: "General",
    },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);