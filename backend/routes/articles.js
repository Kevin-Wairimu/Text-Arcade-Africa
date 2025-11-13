const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const axios = require("axios");
const Article = require("../models/Article");
const articleController = require("../controllers/articleController");
const { authenticateToken, protect, admin } = require("../middleware/authMiddleware");

console.log("SERVER: Setting up article routes...");

// --- PUBLIC ROUTES ---

// Get all articles (with optional filters, pagination) - no auth
if (articleController.getAllArticles) {
  router.get("/", articleController.getAllArticles);
} else {
  console.error("❌ getAllArticles is undefined in articleController!");
}

// Get article by slug (must come BEFORE dynamic /:id routes) - no auth
if (articleController.getArticleBySlug) {
  router.get("/slug/:slug", articleController.getArticleBySlug);
} else {
  console.error("❌ getArticleBySlug is undefined in articleController!");
}

// PDF download route (protected)
router.get("/:id/pdf", authenticateToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) return res.status(404).json({ error: "Article not found" });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${article.title.replace(/\s+/g, "_")}.pdf"`
    );
    doc.pipe(res);

    // --- Title ---
    doc.fontSize(22).fillColor("#1b5e20").text(article.title, { align: "center" }).moveDown(0.5);

    // --- Author & Date ---
    doc.fontSize(12).fillColor("#555").text(
      `By ${article.author || "Text Africa Arcade"} • ${new Date(article.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`,
      { align: "center" }
    ).moveDown(1);

    // --- Image ---
    if (article.image) {
      try {
        const imgRes = await axios.get(article.image, { responseType: "arraybuffer" });
        const imgBuffer = Buffer.from(imgRes.data, "binary");
        doc.image(imgBuffer, { fit: [480, 300], align: "center", valign: "center" }).moveDown(1.5);
      } catch (err) {
        console.warn("⚠️ Failed to load image for PDF:", err.message);
      }
    }

    // --- Content ---
    doc.fontSize(13).fillColor("#222").text(article.content || "No content available.", {
      align: "left",
      lineGap: 6,
    });

    // --- Source URL Link ---
    if (article.sourceUrl) {
      doc.moveDown(1);
      doc.fontSize(12).fillColor("#2E7D32").text("Read full article online", {
        link: article.sourceUrl,
        underline: true,
      });
    }

    doc.end();
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF", details: err.message });
  }
});

// Get article by ID (increments views) - optional: protect or public
if (articleController.getArticleById) {
  router.get("/:id", articleController.getArticleById);
} else {
  console.error("❌ getArticleById is undefined in articleController!");
}

// --- ADMIN ROUTES ---
if (articleController.createArticle) {
  router.post("/", protect, admin, articleController.createArticle);
} else {
  console.error("❌ createArticle is undefined in articleController!");
}

if (articleController.updateArticle) {
  router.put("/:id", protect, admin, articleController.updateArticle);
} else {
  console.error("❌ updateArticle is undefined in articleController!");
}

if (articleController.deleteArticle) {
  router.delete("/:id", protect, admin, articleController.deleteArticle);
} else {
  console.error("❌ deleteArticle is undefined in articleController!");
}

module.exports = router;
