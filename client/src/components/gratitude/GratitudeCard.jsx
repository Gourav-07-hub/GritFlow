/**
 * GratitudeCard.jsx — Displays a complete gratitude entry card for a single day
 */

import React from 'react';
import GratitudeItem from './GratitudeItem';

const MOOD_MAP = {
  1: { emoji: '😢', label: 'Terrible' },
  2: { emoji: '😕', label: 'Bad' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '😊', label: 'Good' },
  5: { emoji: '🤩', label: 'Amazing' },
};

export default function GratitudeCard({ entry, onEdit, onDelete, onToggleFavorite }) {
  const moodInfo = MOOD_MAP[entry.mood] || { emoji: '😐', label: 'Okay' };

  // Parse YYYY-MM-DD from ISO date strictly to prevent timezone shifting
  const formatDateHeader = (dateString) => {
    try {
      const parts = dateString.split('T')[0].split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return '';
    }
  };

  // Determine if all items in this entry are favorited
  const allFavorited =
    entry.entries && entry.entries.length > 0 && entry.entries.every((item) => item.isFavorite);

  // Pluralized item count badge text
  const itemCountText =
    entry.entries.length === 1
      ? '1 thing to be grateful for'
      : `${entry.entries.length} things to be grateful for`;

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this gratitude entry?')) {
      onDelete(entry._id);
    }
  };

  return (
    <div className={`gratitude-entry-card ${allFavorited ? 'all-items-starred-card' : ''}`}>
      {/* Date and Action Controls Header */}
      <div className="gratitude-card-header">
        <div className="header-date-title">{formatDateHeader(entry.date)}</div>
        <div className="header-actions">
          <button className="card-action-btn edit-btn" onClick={() => onEdit(entry)} title="Edit entry">
            ✏️ Edit
          </button>
          <button className="card-action-btn delete-btn" onClick={handleDeleteClick} title="Delete entry">
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Mood Display Badge */}
      <div className="gratitude-card-mood-row">
        <span className="card-mood-emoji">{moodInfo.emoji}</span>
        <span className="card-mood-label">{moodInfo.label} Mood</span>
      </div>

      {/* Daily Affirmation */}
      {entry.affirmation && (
        <div className="gratitude-card-affirmation">
          <span className="quote-mark">💬</span>
          <p className="affirmation-quote-text">{entry.affirmation}</p>
        </div>
      )}

      {/* Nested Gratitude Items List */}
      <div className="gratitude-card-items-section">
        {entry.entries.map((item) => (
          <GratitudeItem
            key={item._id}
            item={item}
            entryId={entry._id}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Footer Info Badge */}
      <div className="gratitude-card-footer">
        <span className="items-count-badge">{itemCountText}</span>
      </div>
    </div>
  );
}
