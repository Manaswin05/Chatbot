const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const chatbotEngine = require('./ml/chatbotEngine');
const { loadCSVDataset } = require('./utils/loadDataset');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected successfully');
  
  const datasetPath = path.join(__dirname, '../dataset/Conversation.csv');
  try {
    await loadCSVDataset(datasetPath);
    await chatbotEngine.loadDataset();
    chatbotEngine.trainNeuralNetwork();
  } catch (error) {
    console.error('Error loading dataset:', error);
  }
})
.catch(err => console.error('MongoDB connection error:', err));

app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chatbot API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
