import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import './ChatInput.css';

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        className="chat-input"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="send-button"
      >
        <FaPaperPlane />
      </button>
    </form>
  );
};

export default ChatInput;
