/**
 * GratitudeItem.jsx — Renders a single gratitude item with a category icon and a star toggle
 */

import React from 'react';

const CATEGORY_MAP = {
  people: { label: 'People', icon: '👥' },
  health: { label: 'Health', icon: '💪' },
  work: { label: 'Work', icon: '💼' },
  nature: { label: 'Nature', icon: '🌿' },
  personal: { label: 'Personal', icon: '💡' },
  other: { label: 'Other', icon: '✨' },
};

export default function GratitudeItem({ item, entryId, onToggleFavorite }) {
  const catDetails = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;

  return (
    <div className={`gratitude-item-card ${item.isFavorite ? 'favorite-golden-highlight' : ''}`}>
      {/* Category Icon Badge */}
      <div className="gratitude-item-category" title={catDetails.label}>
        <span className="category-icon">{catDetails.icon}</span>
        <span className="category-text-label">{catDetails.label}</span>
      </div>

      {/* Main Text Content */}
      <p className="gratitude-item-text">{item.text}</p>

      {/* Favorite/Star Toggle Button */}
      <button
        className={`gratitude-item-favorite-btn ${item.isFavorite ? 'starred' : ''}`}
        onClick={() => onToggleFavorite(entryId, item._id)}
        title={item.isFavorite ? 'Unstar item' : 'Star item'}
      >
        {item.isFavorite ? '★' : '☆'}
      </button>
    </div>
  );
}
