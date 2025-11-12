// utils/articleStats.js
const Article = require("../models/Article");

async function getArticleStats(filter = {}) {
  // Total articles
  const total = await Article.countDocuments(filter);

  // Featured articles
  const featured = await Article.countDocuments({ ...filter, featured: true });

  // Categories count
  const categoriesAgg = await Article.aggregate([
    { $match: filter },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const categories = {};
  categoriesAgg.forEach((c) => {
    categories[c._id || "General"] = c.count;
  });

  // Total views
  const totalViewsAgg = await Article.aggregate([
    { $match: filter },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalViews = totalViewsAgg[0]?.totalViews || 0;

  return { total, featured, categories, totalViews };
}

module.exports = getArticleStats;
