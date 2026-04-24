import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TeachModal from './components/TeachModal';
import AuthPage from './components/AuthPage';
import { sendMessage, sendFeedback, teachBot } from './services/api';
import { FaBrain, FaGraduationCap, FaSignOutAlt, FaUser } from 'react-icons/fa';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chatbot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [showTeachModal, setShowTeachModal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      const displayName = user.username.includes('@')
        ? user.username.split('@')[0]
        : user.username;
      setMessages([
        {
          id: uuidv4(),
          sender: 'bot',
          text: `Hi ${displayName}! I'm an AI chatbot that learns from conversations. Ask me anything!`,
          confidence: 1.0
        }
      ]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAuthSuccess = (userData) => {
    localStorage.setItem('chatbot_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('chatbot_user');
    setUser(null);
    setMessages([]);
  };

  const handleSendMessage = async (text) => {
    const userMessage = {
      id: uuidv4(),
      sender: 'user',
      text,
      username: user?.username || 'Guest'
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await sendMessage(text, sessionId, user?.id, user?.username);

      const botMessage = {
        id: uuidv4(),
        sender: 'bot',
        text: response.response,
        confidence: response.confidence,
        userInput: text
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: uuidv4(),
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again.",
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId, feedback, userInput, botResponse) => {
    try {
      await sendFeedback(sessionId, messageId, feedback, userInput, botResponse);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const handleTeach = async (question, answer) => {
    try {
      await teachBot(question, answer);
      const successMessage = {
        id: uuidv4(),
        sender: 'bot',
        text: "Thanks for teaching me! I'll remember that.",
        confidence: 1.0
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Teach error:', error);
    }
  };

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <FaBrain className="header-icon" />
          <h1>AI Chatbot</h1>
        </div>
        <div className="header-actions">
          <div className="user-info">
            <FaUser className="user-icon" />
            <span className="username-display">
              {user.username.includes('@') ? user.username.split('@')[0] : user.username}
            </span>
          </div>
          <button
            className="teach-btn"
            onClick={() => setShowTeachModal(true)}
          >
            <FaGraduationCap /> Teach Bot
          </button>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onFeedback={
                message.sender === 'bot' && message.userInput
                  ? (feedback) => handleFeedback(message.id, feedback, message.userInput, message.text)
                  : null
              }
            />
          ))}
          {loading && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>

      <TeachModal
        isOpen={showTeachModal}
        onClose={() => setShowTeachModal(false)}
        onTeach={handleTeach}
      />
    </div>
  );
}

export default App;
