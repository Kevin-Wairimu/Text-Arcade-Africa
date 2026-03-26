const mongoose = require("mongoose");
const slugify = require("slugify");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Text Africa Arcade" },
    image: { type: String }, // Legacy support for single main image
    images: [{ type: String }], // Array of base64 or URLs for multiple images
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
    videoUrl: { type: String }, // URL to hosted video or uploaded file path
    slug: { type: String, unique: true, index: true },
    sourceUrl: { type: String, trim: true },
    order: { type: Number, default: 0 },
    imageLabels: { type: Object, default: {} },
  },
  { timestamps: true }
);

ArticleSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Article", ArticleSchema);
