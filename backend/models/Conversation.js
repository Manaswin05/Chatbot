const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  confidence: {
    type: Number,
    default: 1.0
  },
  userFeedback: {
    type: Number,
    default: 0
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

conversationSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('Conversation', conversationSchema);
