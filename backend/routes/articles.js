const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { authenticateToken, protect, admin } = require("../middleware/authMiddleware");

console.log("SERVER: Setting up article routes...");

// --- PUBLIC ROUTES ---
// GET all articles
router.get("/", authenticateToken, articleController.getAllArticles);

// GET article by slug (must come BEFORE /:id)
router.get("/slug/:slug", authenticateToken, articleController.getArticleBySlug);

// GET article by ID
router.get("/:id", authenticateToken, articleController.getArticleById);

// --- ADMIN-ONLY ROUTES ---
router.post("/", protect, admin, articleController.createArticle);
router.put("/:id", protect, admin, articleController.updateArticle);
router.delete("/:id", protect, admin, articleController.deleteArticle);

module.exports = router;
