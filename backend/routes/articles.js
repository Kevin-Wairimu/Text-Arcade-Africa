const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');

console.log('SERVER: Setting up article routes...');

// Public routes
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// Protected routes
router.post('/', authMiddleware, articleController.createArticle);
router.put('/:id', authMiddleware, articleController.updateArticle);
router.delete('/:id', authMiddleware, articleController.deleteArticle);

module.exports = router;