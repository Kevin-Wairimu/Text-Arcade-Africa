const mongoose = require("mongoose");
const slugify = require("slugify");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Text Africa Arcade" },
    image: { type: String }, // base64 or URL
    category: {
      type: String,
      enum: [
        "Media Review",
        "Expert Insights",
        "Reflections",
        "Technology",
        "Events",
        "Digest",
        "Innovation",
        "Trends",
        "General",
        "Reports",
        "Archives",
      ],
      default: "General",
    },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },

    // Generated slug
    slug: { type: String, unique: true, index: true },

    // Optional external link
    sourceUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
ArticleSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Article", ArticleSchema);
