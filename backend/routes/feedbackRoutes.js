const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Define the route: POST /api/feedback
router.post('/', feedbackController.sendFeedback);

module.exports = router;