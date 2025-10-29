// routes/articles.js
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticateToken, protect, admin } = require('../middleware/authMiddleware');

console.log('SERVER: Setting up article routes...');

// PUBLIC ROUTES (optional auth – logs "admin" or "unknown")
router.get('/', authenticateToken, articleController.getAllArticles);
router.get('/:id', authenticateToken, articleController.getArticleById);

// PROTECTED ADMIN-ONLY ROUTES
router.post('/', protect, admin, articleController.createArticle);
router.put('/:id', protect, admin, articleController.updateArticle);
router.delete('/:id', protect, admin, articleController.deleteArticle);

module.exports = router;