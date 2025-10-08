const express = require('express')
const router = express.Router()

// Simple contact endpoint - in production, hook this to email (SendGrid/Mailgun) or save to DB.
router.post('/', async (req, res) => {
  const { name, email, message } = req.body
  if(!name || !email || !message) return res.status(400).json({ msg: 'Missing fields' })
  // For now, log and respond. Replace with email send or DB storage.
  console.log('Contact form:', { name, email, message })
  return res.json({ msg: 'Message received' })
})

module.exports = router
