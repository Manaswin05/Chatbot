const natural = require('natural');
const stringSimilarity = require('string-similarity');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');

class ChatbotEngine {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.stemmer = natural.PorterStemmer;
    this.trainingData = [];
    this.isTraining = false;
    
    // Initialize Gemini if API key exists
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
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
        confidence: conv.confidence,
        id: conv._id
      }));
      
      conversations.forEach(conv => {
        this.tfidf.addDocument(this.preprocessText(conv.question));
      });

      console.log(`Loaded ${this.trainingData.length} conversations for local context`);
    } catch (error) {
      console.error('Error loading dataset:', error);
    }
  }

  async trainNeuralNetwork() {
    console.log('Using Hybrid Engine (Gemini + Local Context)');
    return;
  }

  findBestMatch(userInput) {
    if (this.trainingData.length === 0) return null;

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
      
      const tokenScore = commonTokens / Math.max(inputTokens.length, dataTokens.length || 1);
      const finalScore = (similarity * 0.7) + (tokenScore * 0.3);

      if (finalScore > highestScore) {
        highestScore = finalScore;
        bestMatch = {
          answer: data.output,
          confidence: finalScore,
          id: data.id,
          index: index
        };
      }
    });

    return bestMatch;
  }

  async getGeminiResponse(userInput) {
    if (!this.model) return null;

    try {
      const prompt = `You are "GotChat", a highly intelligent, premium, and friendly AI assistant. 
      The user says: "${userInput}"
      Provide a concise, helpful, and engaging response. Keep your personality consistent: sophisticated yet approachable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return null;
    }
  }

  async getResponse(userInput) {
    // 1. Try local exact/high-confidence match first (for specific commands or FAQ)
    const match = this.findBestMatch(userInput);

    if (match && match.confidence > 0.85) {
      await this.updateUsageStats(match.id);
      return {
        response: match.answer,
        confidence: match.confidence,
        method: 'local_high'
      };
    }

    // 2. Try Gemini for natural conversation
    if (this.model) {
      const geminiResponse = await this.getGeminiResponse(userInput);
      if (geminiResponse) {
        return {
          response: geminiResponse,
          confidence: 0.98,
          method: 'gemini'
        };
      }
    }

    // 3. Fallback to local similarity if Gemini fails or is unavailable
    if (match && match.confidence > 0.4) {
      await this.updateUsageStats(match.id);
      return {
        response: match.answer,
        confidence: match.confidence,
        method: 'local_fallback'
      };
    }

    return {
      response: "I'm still learning! My current systems are having trouble with that. Could you try asking something else?",
      confidence: 0.3,
      method: 'fallback'
    };
  }

  async updateUsageStats(id) {
    try {
      await Conversation.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });
    } catch (error) {
      console.error('Error updating usage stats:', error);
    }
  }

  async learnFromFeedback(userInput, botResponse, feedback) {
    try {
      // Find the document that generated this response
      let doc = await Conversation.findOne({ answer: botResponse });
      
      if (doc) {
        const confidenceDelta = feedback === 'positive' ? 0.05 : -0.1;
        const feedbackDelta = feedback === 'positive' ? 1 : -1;
        
        await Conversation.findByIdAndUpdate(doc._id, {
          $inc: { 
            confidence: confidenceDelta,
            userFeedback: feedbackDelta
          }
        });
      } else if (feedback === 'positive') {
        // If it was a Gemini response and user liked it, we might want to store it locally
        await this.addNewConversation(userInput, botResponse);
      }
      
      await this.loadDataset();
    } catch (error) {
      console.error('Error learning from feedback:', error);
    }
  }

  async addNewConversation(question, answer) {
    try {
      const newConv = new Conversation({
        question: question, // Keep original casing for storage
        answer: answer,
        confidence: 0.8,
        usageCount: 1
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

