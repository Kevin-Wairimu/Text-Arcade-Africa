const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');

console.log('SERVER: Setting up article routes...');



console.log('SERVER: Setting up article routes...');

// This route is public - anyone can see the articles
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// --- PROTECT THESE ROUTES ---
// The `authMiddleware` will run first. If the token is valid, it will call `next()`
// which then runs the `createArticle` or `deleteArticle` function.
router.post('/', authMiddleware, articleController.createArticle);
router.delete('/:id', authMiddleware, articleController.deleteArticle);
router.put('/:id', authMiddleware, articleController.updateArticle);

module.exports = router;