const Article = require("../models/Article");


exports.getAllArticles = async (req, res) => {
  try {
    // Log user from middleware
    console.log(
      "GET /api/articles called by user:",
      req.user?.email ? `${req.user.email} (${req.user.role})` : "unknown"
    );

    // 1. Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    // 2. Build filter
    const filter = {};

    // Category filter
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    // Search filter
    if (req.query.search && req.query.search.trim()) {
      const term = req.query.search.trim();
      const regex = new RegExp(term, "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }

    // 3. Query
    const articles = await Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Article.countDocuments(filter);

    // 4. Response
    console.log(`Found ${articles.length} articles (page ${page})`);
    res.status(200).json({
      articles,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error("Error fetching articles:", err.message);
    res.status(500).json({ error: "Failed to fetch articles", details: err.message });
  }
};

/* -------------------------------------------------
   The rest of your controller stays 100% unchanged
   ------------------------------------------------- */
exports.getArticleById = async (req, res) => {
  try {
    console.log(
      `GET /api/articles/${req.params.id} by user:`,
      req.user?.email || "unknown"
    );

    // Increment views atomically
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, lean: true }
    );

    if (!article) {
      console.log("Article not found:", req.params.id);
      return res.status(404).json({ error: "Article not found" });
    }

    // Emit event for Admin dashboards
    if (req.io) {
      req.io.emit("viewsUpdated", {
        articleId: article._id,
        totalViews: article.views,
      });
    }

    console.log("Article viewed:", article._id, "Total views:", article.views);
    res.status(200).json(article);
  } catch (err) {
    console.error("Error fetching article:", err.message);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};



exports.createArticle = async (req, res) => {
  try {
    console.log(
      "POST /api/articles by user:",
      req.user?.email || "unknown",
      req.body
    );
    const article = new Article({
      ...req.body,
      publishedAt: req.body.publishedAt || new Date(),
      views: req.body.views || 0,
    });
    await article.save();
    console.log("Article created:", article._id);
    res.status(201).json(article);
  } catch (err) {
    console.error("Error creating article:", err.message, err.stack);
    res
      .status(500)
      .json({ error: "Failed to create article", details: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    console.log(
      `PUT /api/articles/${req.params.id} by user:`,
      req.user?.email || "unknown",
      req.body
    );
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!article) {
      console.log("Article not found:", req.params.id);
      return res.status(404).json({ error: "Article not found" });
    }
    console.log("Article updated:", article._id);
    res.status(200).json(article);
  } catch (err) {
    console.error("Error updating article:", err.message, err.stack);
    res
      .status(500)
      .json({ error: "Failed to update article", details: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    console.log(
      `DELETE /api/articles/${req.params.id} by user:`,
      req.user?.email || "unknown"
    );
    const article = await Article.findByIdAndDelete(req.params.id).lean();
    if (!article) {
      console.log("Article not found:", req.params.id);
      return res.status(404).json({ error: "Article not found" });
    }
    console.log("Article deleted:", req.params.id);
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("Error deleting article:", err.message, err.stack);
    res
      .status(500)
      .json({ error: "Failed to delete article", details: err.message });
  }
};
