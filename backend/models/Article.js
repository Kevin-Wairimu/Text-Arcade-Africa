const mongoose = require("mongoose");
const slugify = require("slugify");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Text Africa Arcade" },
    image: { type: String },
    category: {
      type: String,
      enum: [
        "Media Review", "Expert Insights", "Reflections", "Technology", "Events",
        "Digest", "Innovation", "Trends", "General", "Reports", "Archives"
      ],
      default: "General",
    },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },

    // --- Views ---
    views: { type: Number, default: 0 },              // total views
    dailyViews: { type: Number, default: 0 },         // daily views
    dailyViewsDate: { type: Date, default: () => new Date() },
    weeklyViews: { type: Number, default: 0 },        // weekly views
    weeklyViewsDate: { type: Date, default: () => new Date() },

    // --- To prevent double increments ---
    lastViewAt: { type: Date, default: null },

    // --- Slug ---
    slug: { type: String, unique: true, index: true },

    // --- Optional external link ---
    sourceUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate slug when creating/updating title
ArticleSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Article", ArticleSchema);
