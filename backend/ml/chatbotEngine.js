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

  async getGeminiResponse(userInput, context = {}) {
    if (!this.model) return null;

    try {
      const { sentiment } = context;
      
      // Build a more sophisticated prompt based on context
      let personalityNote = '';
      if (sentiment === 'negative') {
        personalityNote = 'The user seems frustrated or upset. Be extra empathetic and helpful.';
      } else if (sentiment === 'positive') {
        personalityNote = 'The user seems happy or satisfied. Match their positive energy.';
      }

      const prompt = `You are "GotChat", a highly intelligent, premium, and friendly AI assistant. 
${personalityNote}

The user says: "${userInput}"

Provide a concise, helpful, and engaging response. Keep your personality consistent: sophisticated yet approachable.
- Be conversational and natural
- Show personality but stay professional
- Keep responses clear and well-structured
- If asked about capabilities, mention you can help with conversations, answer questions, provide information, and learn from interactions
- Avoid being overly verbose - aim for quality over quantity`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return null;
    }
  }

  async getResponse(userInput, context = {}) {
    // 1. Try local exact/high-confidence match first (for specific commands or FAQ)
    const match = this.findBestMatch(userInput);

    if (match && match.confidence > 0.85) {
      await this.updateUsageStats(match.id);
      return {
        response: this.enhanceResponse(match.answer, userInput),
        confidence: match.confidence,
        method: 'local_high'
      };
    }

    // 2. Try Gemini for natural conversation
    if (this.model) {
      const geminiResponse = await this.getGeminiResponse(userInput, context);
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
        response: this.enhanceResponse(match.answer, userInput),
        confidence: match.confidence,
        method: 'local_fallback'
      };
    }

    return {
      response: this.getFallbackResponse(userInput),
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

  enhanceResponse(baseResponse, userInput) {
    // Add variety to responses to make them feel more natural
    const variations = {
      'hello': ['Hello!', 'Hi there!', 'Hey!', 'Greetings!'],
      'thanks': ['You\'re welcome!', 'Happy to help!', 'Anytime!', 'My pleasure!'],
      'bye': ['Goodbye!', 'See you later!', 'Take care!', 'Bye!']
    };

    const lowerInput = userInput.toLowerCase();
    
    // Check for common patterns and add variation
    for (const [pattern, responses] of Object.entries(variations)) {
      if (lowerInput.includes(pattern) && baseResponse.length < 50) {
        const random = responses[Math.floor(Math.random() * responses.length)];
        if (baseResponse !== random) {
          return baseResponse;
        }
      }
    }

    return baseResponse;
  }

  getFallbackResponse(userInput) {
    const fallbackResponses = [
      "I'm still learning about that topic. Could you rephrase your question or ask me something else?",
      "That's an interesting question! I don't have enough information about that yet. Can you try asking in a different way?",
      "I'm not quite sure how to respond to that at the moment. My knowledge is still growing! What else can I help you with?",
      "Hmm, I'm having trouble understanding that. Could you provide more details or ask something else?",
      "I don't have a good answer for that right now, but I'm always learning! Feel free to teach me or try a different question."
    ];

    // Pick a random fallback to add variety
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
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

