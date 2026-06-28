import React from 'react';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

/**
 * Emoji reaction picker popup for messages.
 */
export default function EmojiReactionPicker({ messageId, onReact, onClose }) {
  const handleReact = (emoji) => {
    onReact(messageId, emoji);
    if (onClose) onClose();
  };

  return (
    <div className="emoji-reaction-picker">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          className="reaction-emoji-btn"
          onClick={() => handleReact(emoji)}
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
