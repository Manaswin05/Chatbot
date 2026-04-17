const natural = require('natural');
const stringSimilarity = require('string-similarity');
// const brain = require('brain.js'); // Commented out due to native dependency issues on Windows
const Conversation = require('../models/Conversation');

class ChatbotEngine {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.stemmer = natural.PorterStemmer;
    // this.network = new brain.recurrent.LSTM(); // Commented out - using similarity matching only
    this.trainingData = [];
    this.isTraining = false;
  }

  preprocessText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  tokenizeAndStem(text) {
    const tokens = this.tokenizer.tokenize(this.preprocessText(text));
    return tokens.map(token => this.stemmer.stem(token));
  }

  async loadDataset() {
    try {
      const conversations = await Conversation.find({});
      this.trainingData = conversations.map(conv => ({
        input: this.preprocessText(conv.question),
        output: conv.answer,
        confidence: conv.confidence
      }));
      
      conversations.forEach(conv => {
        this.tfidf.addDocument(this.preprocessText(conv.question));
      });

      console.log(`Loaded ${this.trainingData.length} conversations`);
    } catch (error) {
      console.error('Error loading dataset:', error);
    }
  }

  async trainNeuralNetwork() {
    // Neural network training disabled - using similarity matching only
    console.log('Neural network training skipped (using similarity matching)');
    return;
  }

  findBestMatch(userInput) {
    const processedInput = this.preprocessText(userInput);
    const inputTokens = this.tokenizeAndStem(userInput);
    
    let bestMatch = null;
    let highestScore = 0;

    this.trainingData.forEach((data, index) => {
      const similarity = stringSimilarity.compareTwoStrings(
        processedInput,
        data.input
      );

      const dataTokens = this.tokenizeAndStem(data.input);
      const commonTokens = inputTokens.filter(token => 
        dataTokens.includes(token)
      ).length;
      
      const tokenScore = commonTokens / Math.max(inputTokens.length, dataTokens.length);
      const finalScore = (similarity * 0.7) + (tokenScore * 0.3);

      if (finalScore > highestScore) {
        highestScore = finalScore;
        bestMatch = {
          answer: data.output,
          confidence: finalScore,
          index: index
        };
      }
    });

    return bestMatch;
  }

  async getResponse(userInput) {
    const match = this.findBestMatch(userInput);

    if (match && match.confidence > 0.6) {
      await this.updateUsageStats(match.index);
      return {
        response: match.answer,
        confidence: match.confidence,
        method: 'similarity'
      };
    }

    // Neural network disabled - using similarity matching only
    // Lower threshold for fallback
    if (match && match.confidence > 0.4) {
      await this.updateUsageStats(match.index);
      return {
        response: match.answer,
        confidence: match.confidence,
        method: 'similarity_low'
      };
    }

    return {
      response: "I'm still learning! Could you rephrase that or teach me how to respond?",
      confidence: 0.3,
      method: 'fallback'
    };
  }

  async updateUsageStats(index) {
    if (this.trainingData[index]) {
      const question = this.trainingData[index].input;
      await Conversation.findOneAndUpdate(
        { question: new RegExp(question, 'i') },
        { $inc: { usageCount: 1 } }
      );
    }
  }

  async learnFromFeedback(userInput, botResponse, feedback) {
    try {
      if (feedback === 'positive') {
        await Conversation.findOneAndUpdate(
          { answer: botResponse },
          { $inc: { confidence: 0.1, userFeedback: 1 } }
        );
      } else if (feedback === 'negative') {
        await Conversation.findOneAndUpdate(
          { answer: botResponse },
          { $inc: { confidence: -0.05, userFeedback: -1 } }
        );
      }
      
      await this.loadDataset();
    } catch (error) {
      console.error('Error learning from feedback:', error);
    }
  }

  async addNewConversation(question, answer) {
    try {
      const newConv = new Conversation({
        question: this.preprocessText(question),
        answer: answer,
        confidence: 0.8
      });
      
      await newConv.save();
      await this.loadDataset();
      
      return true;
    } catch (error) {
      console.error('Error adding conversation:', error);
      return false;
    }
  }
}

module.exports = new ChatbotEngine();
