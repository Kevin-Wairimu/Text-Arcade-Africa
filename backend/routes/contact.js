const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contactController');

console.log('SERVER: Setting up contact routes...');

// POST /api/contact
router.post('/', sendContactMessage);

// GET /api/contact/test
router.get('/test', (req, res) => {
  console.log('📡 Contact test route hit!');
  res.json({ message: '✅ Contact route is reachable' });
});

module.exports = router;
