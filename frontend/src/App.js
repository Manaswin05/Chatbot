import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [showTeachModal, setShowTeachModal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && messages.length === 0) {
      const name = user?.username || 'User';
      const displayName = name.includes('@') ? name.split('@')[0] : name;
      
      setMessages([
        {
          id: uuidv4(),
          sender: 'bot',
          text: `Welcome back, ${displayName}! How can I help you today?`,
          confidence: 1.0
        }
      ]);
    }
  }, [user, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleAuthSuccess = (userData) => {
    localStorage.setItem('chatbot_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('chatbot_user');
    setUser(null);
    setMessages([]);
  }, []);

  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return;

    const userMessage = {
      id: uuidv4(),
      sender: 'user',
      text: text.trim(),
      username: user?.username || 'Guest'
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await sendMessage(text.trim(), sessionId, user?.id, user?.username);

      const botMessage = {
        id: uuidv4(),
        sender: 'bot',
        text: response?.response || "I couldn't quite get that.",
        confidence: response?.confidence || 0,
        userInput: text.trim()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: uuidv4(),
        sender: 'bot',
        text: "Connection issue. Please try again.",
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
        text: "Thanks! I've learned that now.",
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

  const name = user?.username || 'User';
  const displayName = name.includes('@') ? name.split('@')[0] : name;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-container">
          <div className="header-content">
            <FaBrain className="header-icon" />
            <h1>GotChat</h1>
          </div>
          
          <div className="header-actions">
            <div className="user-info">
              <FaUser className="user-icon" />
              <span className="username-display">{displayName}</span>
            </div>
            
            <button
              className="teach-btn"
              onClick={() => setShowTeachModal(true)}
            >
              <FaGraduationCap /> <span>Teach</span>
            </button>
            
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <main className="chat-main">
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
      </main>

      <TeachModal
        isOpen={showTeachModal}
        onClose={() => setShowTeachModal(false)}
        onTeach={handleTeach}
      />
    </div>
  );
}

export default App;


