const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('authRoutes loaded:', Object.keys(authController));

// PUBLIC ROUTES
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;