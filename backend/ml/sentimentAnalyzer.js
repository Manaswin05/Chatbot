const natural = require('natural');

class SentimentAnalyzer {
  constructor() {
    // Initialize the sentiment analyzer from natural library
    this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    this.tokenizer = new natural.WordTokenizer();
    
    // Enhanced sentiment keywords for better accuracy
    this.positiveKeywords = [
      'love', 'excellent', 'amazing', 'wonderful', 'fantastic', 'great', 'happy',
      'pleased', 'thrilled', 'delighted', 'superb', 'outstanding', 'brilliant',
      'perfect', 'awesome', 'good', 'nice', 'best', 'better', 'excited', 'ecstatic',
      'overjoyed', 'exceeded', 'recommend'
    ];
    
    this.negativeKeywords = [
      'hate', 'terrible', 'awful', 'worst', 'bad', 'disappointed', 'poor',
      'horrible', 'disgusting', 'useless', 'waste', 'frustrating', 'annoying',
      'regret', 'dissatisfied', 'unacceptable', 'negative', 'not good', 'delays',
      'worst', 'mistake'
    ];
    
    this.neutralKeywords = [
      'okay', 'average', 'fair', 'ordinary', 'regular', 'acceptable', 'meh',
      'alright', 'satisfactory', 'not bad', 'could be better', 'hello', 'hi'
    ];
  }

  /**
   * Analyze sentiment of a text message
   * @param {string} text - The text to analyze
   * @returns {Object} - { sentiment: 'positive'|'negative'|'neutral', score: number, confidence: number }
   */
  analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
      return { sentiment: 'neutral', score: 0, confidence: 0 };
    }

    const lowerText = text.toLowerCase().trim();
    
    // Tokenize the text
    const tokens = this.tokenizer.tokenize(lowerText);
    
    if (!tokens || tokens.length === 0) {
      return { sentiment: 'neutral', score: 0, confidence: 0 };
    }

    // Calculate AFINN-based sentiment score
    const afinnScore = this.analyzer.getSentiment(tokens);
    
    // Count keyword matches
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    tokens.forEach(token => {
      if (this.positiveKeywords.includes(token)) positiveCount++;
      if (this.negativeKeywords.includes(token)) negativeCount++;
      if (this.neutralKeywords.includes(token)) neutralCount++;
    });
    
    // Check for phrase matches
    if (lowerText.includes('not good') || lowerText.includes('not nice')) {
      negativeCount += 2;
    }
    if (lowerText.includes('not bad')) {
      neutralCount += 2;
    }
    
    // Calculate combined score
    const keywordScore = (positiveCount - negativeCount) / Math.max(tokens.length, 1);
    const combinedScore = (afinnScore * 0.6) + (keywordScore * 0.4);
    
    // Determine sentiment based on combined score
    let sentiment;
    let confidence;
    
    if (combinedScore > 0.5 || positiveCount > negativeCount + 1) {
      sentiment = 'positive';
      confidence = Math.min(0.95, 0.6 + Math.abs(combinedScore) * 0.4);
    } else if (combinedScore < -0.5 || negativeCount > positiveCount + 1) {
      sentiment = 'negative';
      confidence = Math.min(0.95, 0.6 + Math.abs(combinedScore) * 0.4);
    } else {
      sentiment = 'neutral';
      confidence = Math.min(0.85, 0.5 + (1 - Math.abs(combinedScore)) * 0.35);
    }
    
    return {
      sentiment,
      score: combinedScore,
      confidence: parseFloat(confidence.toFixed(2)),
      details: {
        positiveCount,
        negativeCount,
        neutralCount,
        tokenCount: tokens.length
      }
    };
  }

  /**
   * Adjust bot response based on user sentiment
   * @param {string} userSentiment - The detected sentiment ('positive'|'negative'|'neutral')
   * @param {string} baseResponse - The original bot response
   * @returns {string} - Adjusted response with appropriate tone
   */
  adjustResponseForSentiment(userSentiment, baseResponse) {
    // Add empathetic prefixes based on user sentiment
    const empathyPrefixes = {
      positive: [
        "That's wonderful! ",
        "I'm glad to hear that! ",
        "Great! ",
        "Fantastic! "
      ],
      negative: [
        "I understand your concern. ",
        "I'm sorry to hear that. ",
        "I appreciate your feedback. ",
        "Let me help you with that. "
      ],
      neutral: [
        "I see. ",
        "Understood. ",
        "",
        ""
      ]
    };

    const prefixes = empathyPrefixes[userSentiment] || empathyPrefixes.neutral;
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // Only add prefix if response doesn't already start with similar empathy
    const hasEmpathy = baseResponse.match(/^(I understand|I'm sorry|That's|Great|Wonderful|I see)/i);
    
    if (hasEmpathy) {
      return baseResponse;
    }
    
    return randomPrefix + baseResponse;
  }

  /**
   * Generate sentiment report for analytics
   * @param {Array} messages - Array of message texts
   * @returns {Object} - Sentiment statistics
   */
  generateSentimentReport(messages) {
    const results = messages.map(msg => this.analyzeSentiment(msg));
    
    const counts = {
      positive: results.filter(r => r.sentiment === 'positive').length,
      negative: results.filter(r => r.sentiment === 'negative').length,
      neutral: results.filter(r => r.sentiment === 'neutral').length
    };
    
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    return {
      total: messages.length,
      counts,
      percentages: {
        positive: ((counts.positive / messages.length) * 100).toFixed(1),
        negative: ((counts.negative / messages.length) * 100).toFixed(1),
        neutral: ((counts.neutral / messages.length) * 100).toFixed(1)
      },
      averageScore: avgScore.toFixed(2),
      averageConfidence: avgConfidence.toFixed(2),
      overallMood: avgScore > 0.3 ? 'positive' : avgScore < -0.3 ? 'negative' : 'neutral'
    };
  }
}

module.exports = new SentimentAnalyzer();
