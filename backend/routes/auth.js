const express = require('express');
const router = express.Router();

// Import the entire controller object
const authController = require('../controllers/authController');

// Add a console.log to see what is being imported
console.log('Imported authController for routing:', authController);

// Attach the functions from the controller object to the routes
router.post('/login', authController.login);
router.post('/register', authController.register); 
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;