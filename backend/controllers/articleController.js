const Article = require("../models/Article");

exports.getAllArticles = async (req, res) => {
  try {
    console.log("📥 GET /api/articles called by user:", req.user?.email || "unknown");
    const articles = await Article.find().lean();
    console.log(`✅ Found ${articles.length} articles:`, articles.map(a => a._id));
    console.log("✅ Response sent:", JSON.stringify({ articles }, null, 2));
    if (!articles.length) {
      console.log("⚠️ No articles in database");
    }
    res.status(200).json({ articles });
  } catch (err) {
    console.error("❌ Error fetching articles:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch articles", details: err.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    console.log(`📥 GET /api/articles/${req.params.id} by user:`, req.user?.email || "unknown");
    const article = await Article.findById(req.params.id).lean();
    if (!article) {
      console.log("❌ Article not found:", req.params.id);
      return res.status(404).json({ error: "Article not found" });
    }
    console.log("✅ Article found:", article._id);
    res.status(200).json(article);
  } catch (err) {
    console.error("❌ Error fetching article:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    console.log("📥 POST /api/articles by user:", req.user?.email || "unknown", req.body);
    const article = new Article({
      ...req.body,
      publishedAt: req.body.publishedAt || new Date(),
      views: req.body.views || 0,
    });
    await article.save();
    console.log("✅ Article created:", article._id);
    res.status(201).json(article);
  } catch (err) {
    console.error("❌ Error creating article:", err.message, err.stack);
    res.status(500).json({ error: "Failed to create article", details: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    console.log(`📥 PUT /api/articles/${req.params.id} by user:`, req.user?.email || "unknown", req.body);
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!article) {
      console.log("❌ Article not found:", req.params.id);
      return res.status(404).json({ error: "Article not found" });
    }
    console.log("✅ Article updated:", article._id);
    res.status(200).json(article);
  } catch (err) {
    console.error("❌ Error updating article:", err.message, err.stack);
    res.status(500).json({ error: "Failed to update article", details: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    console.log(`📥 DELETE /api/articles/${req.params.id} by user:`, req.user?.email || "unknown");
    const article = await Article.findByIdAndDelete(req.params.id).lean();
    if (!article) {
      console.log("❌ Article not found:", req.params.id);
      return res.status(404).json({ error: "Article not found" });
    }
    console.log("✅ Article deleted:", req.params.id);
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting article:", err.message, err.stack);
    res.status(500).json({ error: "Failed to delete article", details: err.message });
  }
};