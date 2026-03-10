const mongoose = require("mongoose");
const Article = require("../models/Article");
const slugify = require("slugify");

// --- GET article by slug ---
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const query = { slug };

    // Increment views if not Admin
    if (req.method === 'GET' && (!req.user || req.user.role !== 'Admin')) {
      await Article.updateOne(query, { $inc: { views: 1 } });
      if (req.io) {
        req.io.emit("viewsUpdated", { slug });
      }
    }

    const article = await Article.findOne(query).lean();
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
      .select("title image category views publishedAt slug author content")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Map articles to truncate content for the list view to reduce payload size
    const optimizedArticles = articles.map(article => ({
      ...article,
      content: article.content ? article.content.substring(0, 200) : ""
    }));

    const total = await Article.countDocuments(filter);

    res.json({ articles: optimizedArticles, total, page, limit, hasMore: page * limit < total });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Failed to fetch articles", details: err.message });
  }
};


// -------------------  THIS IS THE CORRECTED FUNCTION -------------------
// --- GET article by ID ---
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

    // --- FIX APPLIED HERE ---
    // Step 1: Only increment the view count if:
    // - The request method is 'GET'
    // - The user is NOT an Admin
    if (req.method === 'GET' && (!req.user || req.user.role !== 'Admin')) {
      // We use .updateOne() here because we don't need the document returned from
      // this specific operation. This is a "fire-and-forget" update.
      await Article.updateOne(query, { $inc: { views: 1 } });
      
      // Notify Admin via Socket.IO
      if (req.io) {
        req.io.emit("viewsUpdated", { idOrSlug: id });
      }
    }

    // Step 2: Now, fetch the article with the updated view count.
    const article = await Article.findOne(query).lean();
    
    // Step 3: Check if the article exists and send the response.
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(article);
  } catch (err) {
    console.error("Error fetching article by ID:", err);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};
// -------------------------------------------------------------------------


// --- CREATE article ---
exports.createArticle = async (req, res) => {
  try {
    const images = req.body.images || [];
    const article = new Article({
      ...req.body,
      image: images.length > 0 ? images[0] : req.body.image, // Fallback to body.image if provided
      slug: slugify(req.body.title || "article", { lower: true, strict: true }),
      publishedAt: req.body.publishedAt || new Date(),
      views: req.body.views || 0,
      videoUrl: req.body.videoUrl || "",
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
    
    // Sync main image if images array is provided
    if (req.body.images && req.body.images.length > 0) {
      req.body.image = req.body.images[0];
    }

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