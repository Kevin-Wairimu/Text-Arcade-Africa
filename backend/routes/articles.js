const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const axios = require("axios");
const articleController = require("../controllers/articleController");
const Article = require("../models/Article");
const { authenticateToken, protect, admin } = require("../middleware/authMiddleware");

console.log("SERVER: Setting up article routes...");

// --- PUBLIC ROUTES ---
// Get all articles
router.get("/", authenticateToken, articleController.getAllArticles);

// Get article by slug (must come BEFORE /:id)
router.get("/slug/:slug", authenticateToken, articleController.getArticleBySlug);

// Get article by ID
router.get("/:id", authenticateToken, articleController.getArticleById);

// --- 🆕 NEW: Download article as PDF ---
router.get("/:id/pdf", authenticateToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    // Initialize PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${article.title.replace(/\s+/g, "_")}.pdf"`
    );
    doc.pipe(res);

    // --- Title ---
    doc
      .fontSize(22)
      .fillColor("#1b5e20")
      .text(article.title, { align: "center" })
      .moveDown(0.5);

    // --- Author and Date ---
    doc
      .fontSize(12)
      .fillColor("#555")
      .text(
        `By ${article.author || "Text Africa Arcade"} • ${new Date(
          article.createdAt
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
        { align: "center" }
      )
      .moveDown(1);

    // --- Image (if available) ---
    if (article.image) {
      try {
        const imgRes = await axios.get(article.image, {
          responseType: "arraybuffer",
        });
        const img = Buffer.from(imgRes.data, "base64");
        doc.image(img, {
          fit: [480, 300],
          align: "center",
          valign: "center",
        });
        doc.moveDown(1.5);
      } catch (err) {
        console.warn("⚠️ Failed to load image for PDF:", err.message);
      }
    }

    // --- Content ---
    doc
      .fontSize(13)
      .fillColor("#222")
      .text(article.content || "No content available.", {
        align: "left",
        lineGap: 6,
      });

    // --- Source Link ---
    if (article.sourceUrl) {
      doc.moveDown(1);
      doc
        .fontSize(12)
        .fillColor("#2E7D32")
        .text("Read full article online", {
          link: article.sourceUrl,
          underline: true,
        });
    }

    doc.end();
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// --- ADMIN ROUTES ---
router.post("/", protect, admin, articleController.createArticle);
router.put("/:id", protect, admin, articleController.updateArticle);
router.delete("/:id", protect, admin, articleController.deleteArticle);

module.exports = router;
