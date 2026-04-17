import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import './TeachModal.css';

const TeachModal = ({ isOpen, onClose, onTeach }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onTeach(question.trim(), answer.trim());
      setQuestion('');
      setAnswer('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="modal-content"
          >
            <div className="modal-header">
              <h2>Teach the Bot</h2>
              <button onClick={onClose} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="teach-form">
              <div className="form-group">
                <label>Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What should users ask?"
                  required
                />
              </div>
              <div className="form-group">
                <label>Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="How should the bot respond?"
                  rows="4"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                Teach Bot
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TeachModal;
