const mongoose = require("mongoose");
const Article = require("../models/Article");
const slugify = require("slugify");

// --- GET article by slug ---
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const article = await Article.findOne({ slug });
    if (!article) return res.status(404).json({ message: "Article not found" });

    res.status(200).json({ article });
  } catch (err) {
    console.error("Error fetching article by slug:", err);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};

// --- GET all articles with optional filters ---
exports.getAllArticles = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const articles = await Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Article.countDocuments(filter);

    res.json({ articles, total, page, limit, hasMore: page * limit < total });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Failed to fetch articles", details: err.message });
  }
};

// --- GET article by ID ---
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

    const article = await Article.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true, lean: true });
    if (!article) return res.status(404).json({ error: "Article not found" });

    res.json(article);
  } catch (err) {
    console.error("Error fetching article by ID:", err);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};

// --- CREATE article ---
exports.createArticle = async (req, res) => {
  try {
    const article = new Article({
      ...req.body,
      slug: slugify(req.body.title || "article", { lower: true, strict: true }),
      publishedAt: req.body.publishedAt || new Date(),
      views: req.body.views || 0,
    });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error("Error creating article:", err);
    res.status(500).json({ error: "Failed to create article", details: err.message });
  }
};

// --- UPDATE article ---
exports.updateArticle = async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });

    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, lean: true });
    if (!article) return res.status(404).json({ error: "Article not found" });

    res.json(article);
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({ error: "Failed to update article", details: err.message });
  }
};

// --- DELETE article ---
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id).lean();
    if (!article) return res.status(404).json({ error: "Article not found" });

    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("Error deleting article:", err);
    res.status(500).json({ error: "Failed to delete article", details: err.message });
  }
};
