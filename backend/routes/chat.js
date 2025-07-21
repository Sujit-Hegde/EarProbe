const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Get chat history with another doctor
router.get('/:doctorId', auth, chatController.getChatHistory);

// Send a message to another doctor
router.post('/send', auth, chatController.sendMessage);

module.exports = router;
