/**
 * GratitudeForm.jsx — Form for writing or updating a gratitude journal entry
 */

import React, { useState, useEffect } from 'react';

const MOOD_OPTIONS = [
  { score: 1, emoji: '😢', label: 'Terrible' },
  { score: 2, emoji: '😕', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '😊', label: 'Good' },
  { score: 5, emoji: '🤩', label: 'Amazing' },
];

const CATEGORIES = [
  { value: 'people', label: '👥 People' },
  { value: 'health', label: '💪 Health' },
  { value: 'work', label: '💼 Work' },
  { value: 'nature', label: '🌿 Nature' },
  { value: 'personal', label: '💡 Personal' },
  { value: 'other', label: '✨ Other' },
];

export default function GratitudeForm({ onSubmit, onCancel, initialData, selectedDate }) {
  const [date, setDate] = useState('');
  const [mood, setMood] = useState(3);
  const [affirmation, setAffirmation] = useState('');
  const [items, setItems] = useState([{ text: '', category: 'other' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync initial data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setMood(initialData.mood ?? 3);
      setAffirmation(initialData.affirmation ?? '');
      if (initialData.entries && initialData.entries.length > 0) {
        setItems(
          initialData.entries.map((item) => ({
            text: item.text,
            category: item.category,
            _id: item._id,
          }))
        );
      }
    } else {
      const defaultDate = selectedDate || new Date().toISOString().split('T')[0];
      setDate(defaultDate);
      setMood(3);
      setAffirmation('');
      setItems([{ text: '', category: 'other' }]);
    }
  }, [initialData, selectedDate]);

  const handleAddItem = () => {
    if (items.length < 10) {
      setItems((prev) => [...prev, { text: '', category: 'other' }]);
    }
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate that the first item is not empty
    if (!items[0].text.trim()) {
      setErrorMsg('First gratitude item is required.');
      return;
    }

    // Validate that at least one item has valid text content
    const validItems = items.filter((item) => item.text.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('Please specify at least one thing you are grateful for.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        mood,
        affirmation,
        entries: validItems.map((item) => ({
          text: item.text.trim(),
          category: item.category,
          _id: item._id,
        })),
      });
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'An error occurred saving gratitude.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container gratitude-form-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? '✍️ Update Gratitude Entry' : '💖 Log Daily Gratitude'}
          </h2>
          <button className="modal-close-x" onClick={onCancel} title="Close form">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errorMsg && <div className="form-error-banner">{errorMsg}</div>}

          {/* Date Picker */}
          <div className="form-field">
            <label htmlFor="gratitude-date" className="field-label">
              Date
            </label>
            <input
              id="gratitude-date"
              type="date"
              className="number-input date-picker-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Mood Selector */}
          <div className="form-field">
            <span className="field-label">How do you feel today?</span>
            <div className="gratitude-mood-selector" role="radiogroup" aria-label="Daily mood selection">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  role="radio"
                  aria-checked={mood === opt.score}
                  className={`gratitude-mood-btn ${mood === opt.score ? 'active' : ''}`}
                  onClick={() => setMood(opt.score)}
                  title={opt.label}
                >
                  <span className="gratitude-mood-emoji">{opt.emoji}</span>
                  <span className="gratitude-mood-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Affirmation Textarea */}
          <div className="form-field">
            <label htmlFor="gratitude-affirmation" className="field-label">
              Daily Affirmation (Optional)
            </label>
            <textarea
              id="gratitude-affirmation"
              className="number-input textarea-input"
              placeholder="I am grateful for this day because..."
              value={affirmation}
              onChange={(e) => setAffirmation(e.target.value)}
              rows="2"
            />
          </div>

          {/* Dynamic Gratitude Items List */}
          <div className="form-field gratitude-items-field">
            <span className="field-label">What are you grateful for? (1 to 10 items)</span>
            <div className="gratitude-items-list">
              {items.map((item, index) => (
                <div key={index} className="gratitude-item-row">
                  <span className="item-row-number">{index + 1}.</span>
                  
                  {/* Text Input */}
                  <input
                    type="text"
                    className="number-input item-text-input"
                    placeholder={index === 0 ? "I'm grateful for..." : "Something else I'm grateful for..."}
                    value={item.text}
                    onChange={(e) => handleItemChange(index, 'text', e.target.value)}
                    required={index === 0}
                    maxLength={150}
                  />

                  {/* Category Dropdown */}
                  <select
                    className="number-input category-select"
                    value={item.category}
                    onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>

                  {/* Remove Row Button */}
                  <button
                    type="button"
                    className="item-remove-btn"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 1}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Add Another Row Button */}
            {items.length < 10 && (
              <button
                type="button"
                className="add-another-item-btn"
                onClick={handleAddItem}
              >
                ➕ Add Another Thing
              </button>
            )}
          </div>

          {/* Actions Footer */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-gradient" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : initialData
                ? 'Update Gratitude'
                : 'Save Gratitude'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
