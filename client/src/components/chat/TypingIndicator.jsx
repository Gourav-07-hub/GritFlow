import React from 'react';

/**
 * Animated typing indicator showing three bouncing dots and typing text.
 * Mapped to global.css elements:
 * - typing-indicator-container
 * - typing-dots / typing-dot
 * - typing-text
 */
export default function TypingIndicator({ friendName, isTyping }) {
  if (!isTyping) return null;

  return (
    <div className="typing-indicator-container">
      <div className="typing-dots">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
      <span className="typing-text">{friendName} is typing...</span>
    </div>
  );
}
