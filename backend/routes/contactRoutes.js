const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Define the route: POST /api/contact
router.post('/', contactController.sendContactMessage);

module.exports = router;