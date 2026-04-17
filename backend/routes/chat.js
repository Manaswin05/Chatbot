const express = require('express');
const router = express.Router();
const chatbotEngine = require('../ml/chatbotEngine');
const ChatHistory = require('../models/ChatHistory');
const Conversation = require('../models/Conversation');

router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId required' });
    }

    const result = await chatbotEngine.getResponse(message);

    const chatHistory = new ChatHistory({
      sessionId,
      userMessage: message,
      botResponse: result.response,
      confidence: result.confidence
    });
    await chatHistory.save();

    res.json({
      response: result.response,
      confidence: result.confidence,
      method: result.method
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, messageId, feedback, userInput, botResponse } = req.body;

    await ChatHistory.findByIdAndUpdate(messageId, { feedback });
    await chatbotEngine.learnFromFeedback(userInput, botResponse, feedback);

    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

router.post('/learn', async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer required' });
    }

    const success = await chatbotEngine.addNewConversation(question, answer);

    if (success) {
      res.json({ success: true, message: 'New conversation learned!' });
    } else {
      res.status(500).json({ error: 'Failed to learn conversation' });
    }
  } catch (error) {
    console.error('Learn error:', error);
    res.status(500).json({ error: 'Failed to learn' });
  }
});

router.get('/history/:sessionId', async (req, res) => {
  try {
    const history = await ChatHistory.find({ 
      sessionId: req.params.sessionId 
    }).sort({ timestamp: -1 }).limit(50);

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalConversations = await Conversation.countDocuments();
    const totalChats = await ChatHistory.countDocuments();
    const avgConfidence = await Conversation.aggregate([
      { $group: { _id: null, avg: { $avg: '$confidence' } } }
    ]);

    res.json({
      totalConversations,
      totalChats,
      avgConfidence: avgConfidence[0]?.avg || 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
