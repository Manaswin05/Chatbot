import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const registerUser = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    username,
    email,
    password
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  return response.data;
};

export const sendMessage = async (message, sessionId, userId, username) => {
  const response = await axios.post(`${API_URL}/chat/message`, {
    message,
    sessionId,
    userId,
    username
  });
  return response.data;
};

export const sendFeedback = async (sessionId, messageId, feedback, userInput, botResponse) => {
  const response = await axios.post(`${API_URL}/chat/feedback`, {
    sessionId,
    messageId,
    feedback,
    userInput,
    botResponse
  });
  return response.data;
};

export const teachBot = async (question, answer) => {
  const response = await axios.post(`${API_URL}/chat/learn`, {
    question,
    answer
  });
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await axios.get(`${API_URL}/chat/history/${sessionId}`);
  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`${API_URL}/chat/stats`);
  return response.data;
};
