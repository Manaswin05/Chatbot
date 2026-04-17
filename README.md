# AI Chatbot - MERN Stack with Machine Learning

A sophisticated chatbot application built with the MERN stack that uses machine learning algorithms to learn from user interactions and improve over time.

## Features

- **Neural Network (LSTM)**: Uses Brain.js for deep learning capabilities
- **Natural Language Processing**: Tokenization, stemming, and TF-IDF analysis
- **String Similarity Matching**: Finds best responses using advanced similarity algorithms
- **Real-time Learning**: Learns from user feedback (thumbs up/down)
- **Teach Mode**: Users can teach the bot new question-answer pairs
- **Confidence Scoring**: Shows how confident the bot is in its responses
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Session Management**: Tracks conversation history per session

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- Brain.js (Neural Networks)
- Natural (NLP library)
- String Similarity algorithms

### Frontend
- React 18
- Framer Motion (animations)
- React Icons
- Axios

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or MongoDB Atlas)

### Setup

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Configure Environment**
Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatbot
NODE_ENV=development
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Start Backend Server**
```bash
cd backend
npm run dev
```

6. **Start Frontend**
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## How It Works

### Machine Learning Pipeline

1. **Data Loading**: CSV dataset is loaded into MongoDB
2. **Preprocessing**: Text is tokenized, stemmed, and normalized
3. **TF-IDF Analysis**: Creates document vectors for similarity matching
4. **Neural Network Training**: LSTM network trains on conversation pairs
5. **Response Generation**:
   - First tries similarity matching (70% similarity + 30% token overlap)
   - Falls back to neural network prediction
   - Returns fallback message if confidence is low

### Learning Mechanism

- **Positive Feedback**: Increases confidence score by 0.1
- **Negative Feedback**: Decreases confidence score by 0.05
- **New Conversations**: Users can teach new Q&A pairs
- **Usage Tracking**: Tracks which responses are used most

## API Endpoints

- `POST /api/chat/message` - Send a message
- `POST /api/chat/feedback` - Submit feedback
- `POST /api/chat/learn` - Teach new conversation
- `GET /api/chat/history/:sessionId` - Get chat history
- `GET /api/chat/stats` - Get bot statistics

## Project Structure

```
chatbot-app/
├── backend/
│   ├── models/
│   │   ├── Conversation.js
│   │   └── ChatHistory.js
│   ├── routes/
│   │   └── chat.js
│   ├── ml/
│   │   └── chatbotEngine.js
│   ├── utils/
│   │   └── loadDataset.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatMessage.js
│   │   │   ├── ChatInput.js
│   │   │   └── TeachModal.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
│   └── package.json
└── dataset/
    └── Conversation.csv
```

## Usage

1. Type your message in the input field
2. Bot responds with confidence score
3. Give feedback using thumbs up/down
4. Click "Teach Bot" to add new conversations
5. Bot learns and improves over time

## Future Enhancements

- Context awareness across conversations
- Multi-language support
- Voice input/output
- Sentiment analysis
- More advanced neural architectures
- User authentication
- Analytics dashboard

## License

MIT
