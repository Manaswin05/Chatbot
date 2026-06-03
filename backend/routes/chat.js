const express = require('express');
const router = express.Router();
const chatbotEngine = require('../ml/chatbotEngine');
const sentimentAnalyzer = require('../ml/sentimentAnalyzer');
const ChatHistory = require('../models/ChatHistory');
const Conversation = require('../models/Conversation');

router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, userId, username } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId required' });
    }

    // Analyze sentiment of user message
    const sentimentResult = sentimentAnalyzer.analyzeSentiment(message);

    // Get bot response with sentiment context
    const result = await chatbotEngine.getResponse(message, {
      sentiment: sentimentResult.sentiment
    });

    // Adjust response based on sentiment
    const adjustedResponse = sentimentAnalyzer.adjustResponseForSentiment(
      sentimentResult.sentiment,
      result.response
    );

    const chatHistory = new ChatHistory({
      sessionId,
      userId: userId || null,
      username: username || 'Guest',
      userMessage: message,
      botResponse: adjustedResponse,
      confidence: result.confidence,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      sentimentConfidence: sentimentResult.confidence
    });
    await chatHistory.save();

    res.json({
      response: adjustedResponse,
      confidence: result.confidence,
      method: result.method,
      sentiment: {
        type: sentimentResult.sentiment,
        score: sentimentResult.score,
        confidence: sentimentResult.confidence
      }
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

router.get('/sentiment-analytics', async (req, res) => {
  try {
    const { sessionId, limit = 100 } = req.query;
    
    let query = {};
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    const chats = await ChatHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('userMessage sentiment sentimentScore sentimentConfidence timestamp');
    
    const messages = chats.map(chat => chat.userMessage);
    const report = sentimentAnalyzer.generateSentimentReport(messages);
    
    res.json({
      report,
      recentChats: chats.map(chat => ({
        message: chat.userMessage,
        sentiment: chat.sentiment,
        score: chat.sentimentScore,
        confidence: chat.sentimentConfidence,
        timestamp: chat.timestamp
      }))
    });
  } catch (error) {
    console.error('Sentiment analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment analytics' });
  }
});

module.exports = router;
