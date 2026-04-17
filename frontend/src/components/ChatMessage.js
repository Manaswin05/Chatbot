import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaRobot, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import './ChatMessage.css';

const ChatMessage = ({ message, onFeedback }) => {
  const isBot = message.sender === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`message-container ${isBot ? 'bot' : 'user'}`}
    >
      <div className="message-avatar">
        {isBot ? <FaRobot /> : <FaUser />}
      </div>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        {isBot && message.confidence && (
          <div className="message-meta">
            <span className="confidence">
              Confidence: {(message.confidence * 100).toFixed(0)}%
            </span>
            {onFeedback && (
              <div className="feedback-buttons">
                <button
                  onClick={() => onFeedback('positive')}
                  className="feedback-btn positive"
                  title="Helpful"
                >
                  <FaThumbsUp />
                </button>
                <button
                  onClick={() => onFeedback('negative')}
                  className="feedback-btn negative"
                  title="Not helpful"
                >
                  <FaThumbsDown />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
