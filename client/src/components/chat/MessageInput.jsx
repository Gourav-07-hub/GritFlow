import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

/**
 * Message Input area for typing and sending messages, with typing indicator triggers and auto-resizing.
 */
export default function MessageInput({ onSend, onTyping, onStopTyping, loading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (text.trim() === '' || loading) return;
    onSend(text);
    setText('');
    if (onStopTyping) onStopTyping();
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setText(value);
    }

    if (onTyping) {
      onTyping();
    }
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping();
      }
    }, 3000);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <textarea
          ref={textareaRef}
          className="message-input-field"
          placeholder="Type a message..."
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        {text.length > 800 && (
          <div className={`message-char-count ${text.length > 950 ? 'warning' : ''}`}>
            {text.length}/1000
          </div>
        )}
        <button
          className="message-send-btn"
          disabled={text.trim() === '' || loading}
          onClick={handleSend}
          type="button"
          aria-label="Send message"
        >
          {loading ? (
            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
