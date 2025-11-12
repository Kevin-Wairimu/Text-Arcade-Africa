const mongoose = require("mongoose");
const Article = require("../models/Article");
const slugify = require("slugify");

// --- Emit stats to dashboard ---
const emitStats = async (io) => {
  try {
    const articles = await Article.find().lean();
    const total = articles.length;
    const featured = articles.filter(a => a.featured).length;
    const categories = articles.reduce((acc, a) => {
      const c = a.category || "General";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);
    const dailyViews = articles.reduce((acc, a) => acc + (a.dailyViews || 0), 0);
    const weeklyViews = articles.reduce((acc, a) => acc + (a.weeklyViews || 0), 0);

    io.emit("statsUpdated", { total, featured, categories, totalViews, dailyViews, weeklyViews });
  } catch (err) {
    console.error("Error emitting stats:", err);
  }
};

function getWeekNumber(d) {
  const date = new Date(d);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// --- GET article by slug ---
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const article = await Article.findOne({ slug }).lean();
    if (!article) return res.status(404).json({ message: "Article not found" });

    res.status(200).json({ article });
  } catch (err) {
    console.error("Error fetching article by slug:", err);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};

// --- GET all articles ---
exports.getAllArticles = async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // --- Category filter ---
    if (category && category !== "All") {
      query.category = category;
    }

    // --- Featured filter ---
    if (featured === "true") {
      query.featured = true;
    }

    // --- Search filter ---
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // --- Fetch filtered articles ---
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // --- Reset daily & weekly views (same logic as before) ---
    const today = new Date();
    const bulkOps = [];

    articles.forEach((a) => {
      let updated = false;

      // --- Daily reset ---
      const lastDailyReset = new Date(a.dailyViewsDate || 0);
      if (
        today.getFullYear() !== lastDailyReset.getFullYear() ||
        today.getMonth() !== lastDailyReset.getMonth() ||
        today.getDate() !== lastDailyReset.getDate()
      ) {
        a.dailyViews = 0;
        a.dailyViewsDate = today;
        updated = true;
      }

      // --- Weekly reset ---
      const lastWeeklyReset = new Date(a.weeklyViewsDate || 0);
      const currentWeek = getWeekNumber(today);
      const lastWeek = getWeekNumber(lastWeeklyReset);
      if (currentWeek !== lastWeek || today.getFullYear() !== lastWeeklyReset.getFullYear()) {
        a.weeklyViews = 0;
        a.weeklyViewsDate = today;
        updated = true;
      }

      if (updated) {
        bulkOps.push({
          updateOne: {
            filter: { _id: a._id },
            update: {
              dailyViews: a.dailyViews,
              dailyViewsDate: a.dailyViewsDate,
              weeklyViews: a.weeklyViews,
              weeklyViewsDate: a.weeklyViewsDate,
            },
          },
        });
      }
    });

    if (bulkOps.length > 0) await Article.bulkWrite(bulkOps);

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Failed to fetch articles", details: err.message });
  }
};


exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const article = await Article.findOne(query);

    if (!article) return res.status(404).json({ error: "Article not found" });

    const today = new Date();
    let changed = false;

    // --- Daily reset ---
    const lastDailyReset = new Date(article.dailyViewsDate || 0);
    if (
      today.getFullYear() !== lastDailyReset.getFullYear() ||
      today.getMonth() !== lastDailyReset.getMonth() ||
      today.getDate() !== lastDailyReset.getDate()
    ) {
      article.dailyViews = 0;
      article.dailyViewsDate = today;
      changed = true;
    }

    // --- Weekly reset ---
    const lastWeeklyReset = new Date(article.weeklyViewsDate || 0);
    const currentWeek = getWeekNumber(today);
    const lastWeek = getWeekNumber(lastWeeklyReset);
    if (currentWeek !== lastWeek || today.getFullYear() !== lastWeeklyReset.getFullYear()) {
      article.weeklyViews = 0;
      article.weeklyViewsDate = today;
      changed = true;
    }

    // --- Prevent double increment ---
    // If a duplicate request arrives within 2 seconds, ignore it.
    const now = Date.now();
    if (!article.lastViewAt || now - new Date(article.lastViewAt).getTime() > 2000) {
      article.views = (article.views || 0) + 1;
      article.dailyViews = (article.dailyViews || 0) + 1;
      article.weeklyViews = (article.weeklyViews || 0) + 1;
      article.lastViewAt = now;
      changed = true;
    }

    if (changed) await article.save();

    // Emit live updates
    if (req.io) {
      req.io.emit("viewsUpdated", {
        articleId: article._id,
        views: article.views,
        dailyViews: article.dailyViews,
        weeklyViews: article.weeklyViews,
      });

      emitStats(req.io);
    }

    res.json(article);
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({ error: "Failed to fetch article", details: err.message });
  }
};



// --- CREATE article ---
exports.createArticle = async (req, res) => {
  try {
    const slug = slugify(req.body.title || "article", { lower: true, strict: true });
    const article = new Article({
      ...req.body,
      slug,
      publishedAt: req.body.publishedAt || new Date(),
      views: req.body.views || 0,
    });
    await article.save();

    if (req.io) {
      req.io.emit("articleCreated", article);
      emitStats(req.io);
    }

    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create article", details: err.message });
  }
};

// --- UPDATE article ---
exports.updateArticle = async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });

    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!article) return res.status(404).json({ error: "Article not found" });

    if (req.io) {
      req.io.emit("articleUpdated", article);
      emitStats(req.io);
    }

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update article", details: err.message });
  }
};

// --- DELETE article ---
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    if (req.io) {
      req.io.emit("articleDeleted", { articleId: article._id });
      emitStats(req.io);
    }

    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete article", details: err.message });
  }
};


