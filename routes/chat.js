const express = require('express');
const router = express.Router();

// Simple echo bot (replace with actual AI later)
const getBotResponse = (message) => {
  const responses = [
    "That's interesting!",
    "Tell me more.",
    "I understand.",
    "How does that make you feel?",
    `You said: "${message}"`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

// @route   POST /api/chat/send
// @desc    Send chat message
// @access  Private
router.post('/send', (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize chat history if doesn't exist
    if (!req.session.chatHistory) {
      req.session.chatHistory = [];
    }

    // Add user message
    req.session.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Get bot response
    const botResponse = getBotResponse(message);

    // Add bot response
    req.session.chatHistory.push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date().toISOString()
    });

    // Explicitly save session to ensure chatHistory persists
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }

      res.json({
        response: botResponse,
        history: req.session.chatHistory
      });
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// @route   GET /api/chat/history
// @desc    Get chat history
// @access  Private
router.get('/history', (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const history = req.session.chatHistory || [];

    res.json({
      history,
      count: history.length
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/chat/clear
// @desc    Clear chat history
// @access  Private
router.delete('/clear', (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    req.session.chatHistory = [];

    // Explicitly save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }

      res.json({
        success: true,
        message: 'Chat history cleared'
      });
    });
  } catch (error) {
    console.error('Clear error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
