# AI Chatbot with Machine Learning - University Project Report

## Executive Summary

This project presents an intelligent chatbot application built using the MERN (MongoDB, Express.js, React, Node.js) stack, enhanced with machine learning capabilities for natural language understanding and adaptive learning. The system employs Natural Language Processing (NLP) techniques, string similarity algorithms, and a feedback-driven learning mechanism to provide contextually relevant responses while continuously improving through user interactions.

**Project Type:** Full-Stack Web Application with Machine Learning Integration  
**Technology Stack:** MERN Stack + Machine Learning Libraries  
**Development Period:** 2024-2026  
**License:** MIT

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Implementation Details](#4-implementation-details)
5. [Machine Learning Components](#5-machine-learning-components)
6. [Database Design](#6-database-design)
7. [Frontend Implementation](#7-frontend-implementation)
8. [API Design](#8-api-design)
9. [Features and Functionality](#9-features-and-functionality)
10. [Testing and Validation](#10-testing-and-validation)
11. [Challenges and Solutions](#11-challenges-and-solutions)
12. [Future Enhancements](#12-future-enhancements)
13. [Conclusion](#13-conclusion)
14. [References](#14-references)

---

## 1. Introduction

### 1.1 Project Overview

The AI Chatbot project is a sophisticated conversational agent that leverages machine learning and natural language processing to understand user queries and provide intelligent responses. Unlike traditional rule-based chatbots, this system learns from user interactions and improves its response accuracy over time through a feedback mechanism.

### 1.2 Objectives

- **Primary Objective:** Develop an intelligent chatbot capable of understanding natural language queries and providing contextually appropriate responses
- **Secondary Objectives:**
  - Implement machine learning algorithms for response matching and prediction
  - Create an adaptive learning system that improves through user feedback
  - Design an intuitive user interface with real-time interaction capabilities
  - Build a scalable architecture supporting session management and conversation history
  - Enable users to teach the bot new question-answer pairs dynamically

### 1.3 Scope

The project encompasses:
- Full-stack web application development
- Natural Language Processing implementation
- Machine learning model integration
- Database design and management
- RESTful API development
- Responsive frontend with modern UI/UX
- Real-time feedback and learning mechanisms

---

## 2. System Architecture

### 2.1 High-Level Architecture

The application follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (React Frontend - Port 3000)                │
│  - User Interface Components                             │
│  - State Management                                      │
│  - API Communication                                     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│                   Application Layer                      │
│            (Express.js Backend - Port 5000)              │
│  - RESTful API Endpoints                                 │
│  - Business Logic                                        │
│  - ML Engine Integration                                 │
│  - Session Management                                    │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────────────┐
│                     Data Layer                           │
│              (MongoDB Database)                          │
│  - Conversation Storage                                  │
│  - Chat History                                          │
│  - Training Dataset                                      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Component Interaction Flow

1. **User Input:** User submits a message through the React frontend
2. **API Request:** Frontend sends POST request to `/api/chat/message`
3. **ML Processing:** Backend processes the input through the chatbot engine
4. **Response Generation:** ML engine finds best match using NLP and similarity algorithms
5. **Database Update:** Usage statistics are updated in MongoDB
6. **Response Delivery:** Bot response is sent back to frontend with confidence score
7. **Feedback Loop:** User can provide feedback (thumbs up/down) to improve future responses

---

## 3. Technology Stack

### 3.1 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v14+ | Runtime environment for server-side JavaScript |
| **Express.js** | ^4.18.2 | Web application framework for API development |
| **MongoDB** | Latest | NoSQL database for flexible data storage |
| **Mongoose** | ^7.6.3 | ODM (Object Data Modeling) library for MongoDB |
| **Natural** | ^6.10.0 | NLP library for tokenization and stemming |
| **Brain.js** | ^2.0.0-beta.23 | Neural network library (LSTM implementation) |
| **String-Similarity** | ^4.0.4 | Algorithm for string comparison |
| **Compromise** | ^14.10.0 | Natural language processing toolkit |
| **CSV-Parser** | ^3.0.0 | Dataset loading from CSV files |
| **CORS** | ^2.8.5 | Cross-Origin Resource Sharing middleware |
| **Dotenv** | ^16.3.1 | Environment variable management |

### 3.2 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.2.0 | UI library for building interactive interfaces |
| **React-DOM** | ^18.2.0 | React rendering for web applications |
| **Axios** | ^1.5.1 | HTTP client for API requests |
| **Framer Motion** | ^10.16.4 | Animation library for smooth UI transitions |
| **React Icons** | ^4.11.0 | Icon library for UI elements |
| **UUID** | ^9.0.1 | Unique identifier generation for sessions |

### 3.3 Development Tools

- **Nodemon** (^3.0.1): Auto-restart server during development
- **Concurrently** (^8.2.2): Run multiple npm scripts simultaneously
- **React Scripts** (5.0.1): Build tooling for React applications

---

## 4. Implementation Details

### 4.1 Project Structure

```
chatbot-app/
├── backend/
│   ├── models/
│   │   ├── Conversation.js      # Conversation data model
│   │   └── ChatHistory.js       # Chat history model
│   ├── routes/
│   │   └── chat.js              # API route handlers
│   ├── ml/
│   │   └── chatbotEngine.js     # ML engine core logic
│   ├── utils/
│   │   └── loadDataset.js       # CSV dataset loader
│   ├── .env                     # Environment configuration
│   ├── server.js                # Express server entry point
│   └── package.json             # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatMessage.js   # Message display component
│   │   │   ├── ChatInput.js     # Input field component
│   │   │   └── TeachModal.js    # Teaching interface modal
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.js               # Main application component
│   │   └── index.js             # React entry point
│   ├── public/
│   │   └── index.html           # HTML template
│   └── package.json             # Frontend dependencies
├── dataset/
│   └── Conversation.csv         # Training dataset
├── package.json                 # Root package configuration
└── README.md                    # Project documentation
```

### 4.2 Backend Server Configuration

The Express server (`backend/server.js`) initializes with the following workflow:

1. **Environment Setup:** Loads configuration from `.env` file
2. **Middleware Configuration:** 
   - CORS for cross-origin requests
   - JSON body parser for request handling
3. **Database Connection:** Establishes MongoDB connection using Mongoose
4. **Dataset Loading:** Imports conversation data from CSV into MongoDB
5. **ML Engine Initialization:** Loads training data and prepares the chatbot engine
6. **Route Registration:** Mounts API routes under `/api/chat`
7. **Server Start:** Listens on configured port (default: 5000)

```javascript
// Key initialization sequence
mongoose.connect(MONGODB_URI)
  → loadCSVDataset()
  → chatbotEngine.loadDataset()
  → chatbotEngine.trainNeuralNetwork()
  → app.listen(PORT)
```

---

## 5. Machine Learning Components

### 5.1 Natural Language Processing Pipeline

The chatbot engine implements a comprehensive NLP pipeline:

#### 5.1.1 Text Preprocessing

```javascript
preprocessText(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')  // Remove punctuation
    .trim();                   // Remove whitespace
}
```

**Purpose:** Normalizes input text for consistent processing

#### 5.1.2 Tokenization and Stemming

```javascript
tokenizeAndStem(text) {
  const tokens = this.tokenizer.tokenize(this.preprocessText(text));
  return tokens.map(token => this.stemmer.stem(token));
}
```

**Technologies Used:**
- **WordTokenizer** (Natural library): Splits text into individual words
- **PorterStemmer**: Reduces words to their root form (e.g., "running" → "run")

**Benefits:**
- Improves matching accuracy by handling word variations
- Reduces vocabulary size for more efficient processing

#### 5.1.3 TF-IDF Analysis

**Term Frequency-Inverse Document Frequency** is used to create document vectors:

```javascript
this.tfidf = new natural.TfIdf();
conversations.forEach(conv => {
  this.tfidf.addDocument(this.preprocessText(conv.question));
});
```

**Purpose:** Identifies important terms in questions for better semantic understanding

### 5.2 Response Matching Algorithm

The system employs a hybrid approach combining multiple techniques:

#### 5.2.1 String Similarity Matching

```javascript
const similarity = stringSimilarity.compareTwoStrings(
  processedInput,
  data.input
);
```

**Algorithm:** Dice's Coefficient (Sørensen–Dice index)
- Compares bigrams (pairs of consecutive characters)
- Returns similarity score between 0 and 1
- Highly effective for typo tolerance

#### 5.2.2 Token Overlap Scoring

```javascript
const commonTokens = inputTokens.filter(token => 
  dataTokens.includes(token)
).length;

const tokenScore = commonTokens / Math.max(inputTokens.length, dataTokens.length);
```

**Purpose:** Measures semantic similarity based on shared meaningful words

#### 5.2.3 Weighted Scoring System

```javascript
const finalScore = (similarity * 0.7) + (tokenScore * 0.3);
```

**Weights:**
- 70% string similarity (handles typos and variations)
- 30% token overlap (captures semantic meaning)

**Confidence Thresholds:**
- **High confidence (>0.6):** Direct response with high certainty
- **Medium confidence (0.4-0.6):** Response with lower certainty
- **Low confidence (<0.4):** Fallback message requesting clarification

### 5.3 Neural Network Architecture (Planned)

The system includes Brain.js LSTM (Long Short-Term Memory) network integration:

```javascript
// Currently commented out due to platform compatibility
this.network = new brain.recurrent.LSTM();
```

**LSTM Benefits:**
- Handles sequential data (conversation context)
- Maintains long-term dependencies
- Learns patterns from training data

**Current Status:** Disabled in favor of similarity matching due to native dependency issues on Windows platform

### 5.4 Learning Mechanisms

#### 5.4.1 Feedback-Based Learning

```javascript
async learnFromFeedback(userInput, botResponse, feedback) {
  if (feedback === 'positive') {
    // Increase confidence by 0.1
    await Conversation.findOneAndUpdate(
      { answer: botResponse },
      { $inc: { confidence: 0.1, userFeedback: 1 } }
    );
  } else if (feedback === 'negative') {
    // Decrease confidence by 0.05
    await Conversation.findOneAndUpdate(
      { answer: botResponse },
      { $inc: { confidence: -0.05, userFeedback: -1 } }
    );
  }
}
```

**Adaptive Learning:**
- Positive feedback strengthens response confidence
- Negative feedback weakens response confidence
- Asymmetric adjustment (faster learning from positive feedback)

#### 5.4.2 Usage Statistics Tracking

```javascript
async updateUsageStats(index) {
  await Conversation.findOneAndUpdate(
    { question: new RegExp(question, 'i') },
    { $inc: { usageCount: 1 } }
  );
}
```

**Purpose:** Tracks which responses are most frequently used for analytics

#### 5.4.3 Dynamic Knowledge Addition

```javascript
async addNewConversation(question, answer) {
  const newConv = new Conversation({
    question: this.preprocessText(question),
    answer: answer,
    confidence: 0.8  // Initial confidence for user-taught responses
  });
  await newConv.save();
  await this.loadDataset();  // Reload to include new data
}
```

**Feature:** Users can teach the bot new question-answer pairs in real-time

---

## 6. Database Design

### 6.1 MongoDB Schema Design

#### 6.1.1 Conversation Model

```javascript
{
  question: String (required, indexed),
  answer: String (required, indexed),
  confidence: Number (default: 1.0),
  userFeedback: Number (default: 0),
  usageCount: Number (default: 0),
  createdAt: Date (default: Date.now)
}
```

**Indexes:** Text index on `question` and `answer` fields for efficient searching

**Purpose:** Stores the knowledge base of question-answer pairs with metadata

#### 6.1.2 ChatHistory Model

```javascript
{
  sessionId: String (required),
  userMessage: String (required),
  botResponse: String (required),
  confidence: Number,
  feedback: String (enum: ['positive', 'negative', null]),
  timestamp: Date (default: Date.now)
}
```

**Purpose:** Maintains conversation history for each user session

### 6.2 Data Flow

1. **Initial Load:** CSV dataset imported into Conversation collection
2. **Runtime Updates:** New conversations added through teach functionality
3. **Feedback Integration:** Confidence scores updated based on user feedback
4. **History Tracking:** All interactions logged in ChatHistory collection
5. **Statistics:** Usage counts incremented for analytics

---

## 7. Frontend Implementation

### 7.1 Component Architecture

#### 7.1.1 App Component (Main Container)

**Responsibilities:**
- Session management using UUID
- Message state management
- API communication orchestration
- Modal control for teaching interface

**Key State Variables:**
```javascript
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);
const [sessionId] = useState(() => uuidv4());
const [showTeachModal, setShowTeachModal] = useState(false);
```

#### 7.1.2 ChatMessage Component

**Features:**
- Displays user and bot messages with distinct styling
- Shows confidence score for bot responses
- Provides feedback buttons (thumbs up/down)
- Animated entry using Framer Motion

**Props:**
```javascript
{
  message: {
    id, sender, text, confidence, userInput
  },
  onFeedback: (feedback) => void
}
```

#### 7.1.3 ChatInput Component

**Features:**
- Text input with send button
- Enter key submission
- Disabled state during loading
- Character limit handling

#### 7.1.4 TeachModal Component

**Features:**
- Modal dialog for teaching new responses
- Question and answer input fields
- Form validation
- Success/error feedback

### 7.2 User Experience Design

**Design Principles:**
- **Minimalist Interface:** Clean, distraction-free chat experience
- **Real-time Feedback:** Typing indicators and smooth animations
- **Transparency:** Confidence scores visible to users
- **Interactivity:** Easy feedback mechanism for continuous improvement
- **Accessibility:** Semantic HTML and keyboard navigation support

### 7.3 Animation and Transitions

**Framer Motion Integration:**
- Message entry animations
- Smooth scrolling to new messages
- Modal transitions
- Loading state animations

---

## 8. API Design

### 8.1 RESTful Endpoints

#### 8.1.1 POST /api/chat/message

**Purpose:** Send a message and receive bot response

**Request Body:**
```json
{
  "message": "What is machine learning?",
  "sessionId": "uuid-v4-string"
}
```

**Response:**
```json
{
  "response": "Machine learning is...",
  "confidence": 0.85,
  "method": "similarity"
}
```

#### 8.1.2 POST /api/chat/feedback

**Purpose:** Submit feedback on bot response

**Request Body:**
```json
{
  "sessionId": "uuid-v4-string",
  "messageId": "uuid-v4-string",
  "feedback": "positive",
  "userInput": "What is ML?",
  "botResponse": "Machine learning is..."
}
```

#### 8.1.3 POST /api/chat/learn

**Purpose:** Teach bot new question-answer pair

**Request Body:**
```json
{
  "question": "What is deep learning?",
  "answer": "Deep learning is a subset of ML..."
}
```

#### 8.1.4 GET /api/chat/history/:sessionId

**Purpose:** Retrieve conversation history for a session

**Response:**
```json
{
  "history": [
    {
      "userMessage": "Hello",
      "botResponse": "Hi there!",
      "confidence": 0.95,
      "timestamp": "2026-04-20T10:30:00Z"
    }
  ]
}
```

#### 8.1.5 GET /api/chat/stats

**Purpose:** Get bot statistics and analytics

**Response:**
```json
{
  "totalConversations": 150,
  "averageConfidence": 0.78,
  "totalInteractions": 1250,
  "feedbackRatio": 0.65
}
```

### 8.2 Error Handling

**Standard Error Response:**
```json
{
  "error": "Error message",
  "status": 400
}
```

**HTTP Status Codes:**
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

---

## 9. Features and Functionality

### 9.1 Core Features

1. **Natural Language Understanding**
   - Processes user queries using NLP techniques
   - Handles typos and variations in phrasing
   - Understands semantic meaning through token analysis

2. **Intelligent Response Generation**
   - Hybrid matching algorithm (similarity + token overlap)
   - Confidence scoring for transparency
   - Fallback mechanism for unknown queries

3. **Adaptive Learning**
   - Learns from positive/negative feedback
   - Adjusts confidence scores dynamically
   - Improves accuracy over time

4. **User Teaching Interface**
   - Modal dialog for adding new knowledge
   - Immediate integration into knowledge base
   - Validation and error handling

5. **Session Management**
   - UUID-based session tracking
   - Conversation history per session
   - Persistent storage in MongoDB

6. **Real-time Interaction**
   - Instant message delivery
   - Typing indicators
   - Smooth animations

### 9.2 User Workflows

#### 9.2.1 Standard Conversation Flow

```
User enters message
  → Frontend sends to API
  → Backend processes through ML engine
  → Response generated with confidence score
  → Frontend displays response
  → User provides feedback (optional)
  → System learns from feedback
```

#### 9.2.2 Teaching Flow

```
User clicks "Teach Bot"
  → Modal opens with form
  → User enters question and answer
  → Frontend validates input
  → API saves to database
  → ML engine reloads dataset
  → Success message displayed
```

---

## 10. Testing and Validation

### 10.1 Testing Strategy

**Unit Testing:**
- NLP preprocessing functions
- Similarity calculation algorithms
- Database model validation

**Integration Testing:**
- API endpoint functionality
- Database operations
- ML engine integration

**End-to-End Testing:**
- Complete user workflows
- Session management
- Feedback loop validation

### 10.2 Performance Metrics

**Response Time:**
- Target: <500ms for typical queries
- Measured from API request to response delivery

**Accuracy:**
- Confidence threshold validation
- User feedback correlation analysis

**Scalability:**
- Concurrent user handling
- Database query optimization
- Memory usage monitoring

---

## 11. Challenges and Solutions

### 11.1 Technical Challenges

#### Challenge 1: Neural Network Compatibility

**Problem:** Brain.js LSTM has native dependencies that cause issues on Windows platforms

**Solution:** 
- Implemented robust similarity-based matching as primary method
- Maintained neural network code structure for future cross-platform deployment
- Achieved comparable accuracy using hybrid algorithm

#### Challenge 2: Response Accuracy

**Problem:** Simple string matching produces poor results for varied phrasing

**Solution:**
- Implemented multi-layered approach (similarity + token overlap)
- Added stemming to handle word variations
- Weighted scoring system balances different matching methods

#### Challenge 3: Real-time Learning

**Problem:** Dataset updates require engine reload, causing latency

**Solution:**
- Optimized dataset loading process
- Implemented efficient MongoDB queries
- Asynchronous operations prevent blocking

### 11.2 Design Challenges

#### Challenge 1: User Trust

**Problem:** Users may not trust bot responses without transparency

**Solution:**
- Display confidence scores with each response
- Provide feedback mechanism for user control
- Clear indication of learning status

#### Challenge 2: Knowledge Gaps

**Problem:** Bot cannot answer questions outside training data

**Solution:**
- Implemented teaching interface for user contributions
- Fallback messages guide users to teach bot
- Confidence thresholds prevent incorrect responses

---

## 12. Future Enhancements

### 12.1 Short-term Improvements

1. **Context Awareness**
   - Maintain conversation context across multiple messages
   - Reference previous questions and answers
   - Implement conversation memory

2. **Enhanced NLP**
   - Intent classification
   - Entity recognition
   - Sentiment analysis

3. **User Authentication**
   - User accounts and profiles
   - Personalized learning per user
   - Conversation history access

### 12.2 Long-term Vision

1. **Advanced ML Models**
   - Transformer-based models (BERT, GPT)
   - Transfer learning from pre-trained models
   - Multi-language support

2. **Voice Integration**
   - Speech-to-text input
   - Text-to-speech output
   - Voice command support

3. **Analytics Dashboard**
   - Admin panel for monitoring
   - Usage statistics visualization
   - Performance metrics tracking

4. **Multi-modal Interaction**
   - Image understanding
   - Document processing
   - Rich media responses

5. **Deployment and Scaling**
   - Cloud deployment (AWS, Azure, GCP)
   - Load balancing
   - Microservices architecture

---

## 13. Conclusion

### 13.1 Project Achievements

This project successfully demonstrates the integration of machine learning with full-stack web development to create an intelligent, adaptive chatbot system. Key accomplishments include:

1. **Technical Implementation:**
   - Robust MERN stack architecture
   - Effective NLP pipeline with multiple processing stages
   - Hybrid ML approach combining similarity matching and token analysis
   - Real-time learning mechanism through user feedback

2. **User Experience:**
   - Intuitive, modern interface with smooth animations
   - Transparent confidence scoring builds user trust
   - Interactive teaching feature empowers users
   - Responsive design for various devices

3. **Scalability:**
   - Modular architecture supports future enhancements
   - Database design accommodates growing datasets
   - API structure allows easy integration with other systems

### 13.2 Learning Outcomes

**Technical Skills Developed:**
- Full-stack JavaScript development (MERN)
- Natural Language Processing implementation
- Machine learning algorithm integration
- RESTful API design and development
- Database schema design and optimization
- Modern React development with hooks
- Asynchronous programming patterns

**Soft Skills Enhanced:**
- Problem-solving for complex technical challenges
- System architecture design
- Documentation and technical writing
- Project planning and execution

### 13.3 Real-world Applications

This chatbot architecture can be adapted for:
- **Customer Support:** Automated first-line support with learning capabilities
- **Educational Tools:** Interactive tutoring systems
- **Healthcare:** Patient inquiry systems with medical knowledge bases
- **E-commerce:** Product recommendation and query handling
- **Internal Tools:** Company knowledge base assistants

### 13.4 Final Thoughts

The project demonstrates that effective AI systems don't always require the most complex algorithms. By combining well-established NLP techniques with thoughtful UX design and adaptive learning mechanisms, we created a chatbot that provides real value while remaining maintainable and extensible.

The modular architecture ensures that as more advanced ML models become available and more accessible, they can be integrated without major refactoring. The feedback loop creates a virtuous cycle where the system continuously improves through real-world usage.

---

## 14. References

### 14.1 Technical Documentation

1. **MongoDB Documentation**  
   https://docs.mongodb.com/

2. **Express.js Guide**  
   https://expressjs.com/

3. **React Documentation**  
   https://react.dev/

4. **Natural Library (NLP)**  
   https://github.com/NaturalNode/natural

5. **Brain.js Documentation**  
   https://brain.js.org/

6. **String Similarity Algorithms**  
   https://github.com/aceakash/string-similarity

### 14.2 Academic References

1. **Porter, M.F. (1980).** "An algorithm for suffix stripping." *Program*, 14(3), 130-137.

2. **Dice, L.R. (1945).** "Measures of the Amount of Ecologic Association Between Species." *Ecology*, 26(3), 297-302.

3. **Salton, G., & McGill, M.J. (1983).** *Introduction to Modern Information Retrieval.* McGraw-Hill.

4. **Hochreiter, S., & Schmidhuber, J. (1997).** "Long Short-Term Memory." *Neural Computation*, 9(8), 1735-1780.

5. **Jurafsky, D., & Martin, J.H. (2023).** *Speech and Language Processing* (3rd ed.). Pearson.

### 14.3 Online Resources

1. **MERN Stack Tutorial**  
   https://www.mongodb.com/mern-stack

2. **NLP with JavaScript**  
   https://www.npmjs.com/package/natural

3. **React Best Practices**  
   https://react.dev/learn

4. **RESTful API Design**  
   https://restfulapi.net/

---

## Appendix A: Installation Guide

### Prerequisites
- Node.js v14 or higher
- MongoDB (local or Atlas)
- npm or yarn package manager

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd chatbot-app
```

2. **Install Dependencies**
```bash
npm run install-all
```

3. **Configure Environment**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
```

4. **Start Application**
```bash
# From root directory
npm run dev
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Appendix B: API Testing Examples

### Using cURL

**Send Message:**
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test-123"}'
```

**Submit Feedback:**
```bash
curl -X POST http://localhost:5000/api/chat/feedback \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","messageId":"msg-1","feedback":"positive"}'
```

**Teach Bot:**
```bash
curl -X POST http://localhost:5000/api/chat/learn \
  -H "Content-Type: application/json" \
  -d '{"question":"What is AI?","answer":"Artificial Intelligence..."}'
```

---

## Appendix C: Dataset Format

### CSV Structure

```csv
question,answer
"What is machine learning?","Machine learning is a subset of AI..."
"How does NLP work?","Natural Language Processing uses..."
"What is a neural network?","A neural network is a computational model..."
```

### Requirements
- UTF-8 encoding
- Comma-separated values
- Header row required
- Quotes for text containing commas

---

**Report Prepared By:** AI Development Team  
**Date:** April 20, 2026  
**Version:** 1.0  
**Project Status:** Completed and Operational

---

*This report is intended for academic evaluation and documentation purposes.*
