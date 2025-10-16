
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');

console.log('SERVER: Setting up article routes...');

// --- PUBLIC ROUTES (accessible to everyone) ---
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// --- PROTECTED ROUTES (require authentication) ---
router.post('/', authMiddleware, articleController.createArticle);
router.put('/:id', authMiddleware, articleController.updateArticle);
router.delete('/:id', authMiddleware, articleController.deleteArticle);

module.exports = router;
