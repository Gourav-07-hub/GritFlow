/**
 * ReflectionForm.jsx — Modal form to create or edit a reflection entry
 */

import { useState, useEffect } from 'react';
import MoodSelector from './MoodSelector';
import styles from './ReflectionForm.module.css';

/**
 * ReflectionForm component
 * @param {{
 *   onSubmit: (data: object) => Promise<void>,
 *   onCancel: () => void,
 *   initialData: object,
 *   selectedDate: Date
 * }} props
 */
function ReflectionForm({ onSubmit, onCancel, initialData, selectedDate }) {
  const [date, setDate] = useState('');
  const [mood, setMood] = useState(0);
  const [moodLabel, setMoodLabel] = useState('');
  const [learned, setLearned] = useState('');
  const [grateful, setGrateful] = useState('');
  const [improvements, setImprovements] = useState('');
  const [highlights, setHighlights] = useState('');
  
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!initialData;

  // Helper to format Date string to YYYY-MM-DD
  const formatDateForInput = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (initialData) {
      setDate(formatDateForInput(initialData.date));
      setMood(initialData.mood || 0);
      setMoodLabel(initialData.moodLabel || '');
      setLearned(initialData.learned || '');
      setGrateful(initialData.grateful || '');
      setImprovements(initialData.improvements || '');
      setHighlights(initialData.highlights || '');
      setTagsList(initialData.tags || []);
    } else {
      // Default to selectedDate if available, else today
      setDate(formatDateForInput(selectedDate || new Date()));
      setMood(0);
      setMoodLabel('');
      setLearned('');
      setGrateful('');
      setImprovements('');
      setHighlights('');
      setTagsList([]);
    }
  }, [initialData, selectedDate]);

  const handleMoodChange = (score, label) => {
    setMood(score);
    setMoodLabel(label);
  };

  // Tag creation methods
  const addTag = (text) => {
    const cleaned = text.trim().toLowerCase().replace(/,/g, '');
    if (cleaned && !tagsList.includes(cleaned)) {
      setTagsList([...tagsList, cleaned]);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  };

  const handleTagBlur = () => {
    addTag(tagInput);
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setTagsList(tagsList.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Date is required');
      return;
    }

    if (mood === 0) {
      setError('Please select your mood');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        date,
        mood,
        moodLabel,
        learned: learned.trim(),
        grateful: grateful.trim(),
        improvements: improvements.trim(),
        highlights: highlights.trim(),
        tags: tagsList,
      });
    } catch (err) {
      setError(err || 'Failed to save reflection');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reflection-form-title"
      >
        <h2 id="reflection-form-title" className={styles.title}>
          {isEdit ? 'Edit Reflection' : "Log Today's Reflection"}
        </h2>

        {error && (
          <div className={styles.error} style={{ color: '#f87171', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="reflection-date" className={styles.label}>
              Date *
            </label>
            <input
              id="reflection-date"
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <span className={styles.label}>How do you feel? *</span>
            <MoodSelector value={mood} onChange={handleMoodChange} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="learned" className={styles.label}>
              What did I learn today?
            </label>
            <textarea
              id="learned"
              className={styles.textarea}
              placeholder="E.g., Learned how Mongoose handles dynamic subdocument IDs..."
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="grateful" className={styles.label}>
              What am I grateful for?
            </label>
            <textarea
              id="grateful"
              className={styles.textarea}
              placeholder="E.g., Grateful for help from my colleague..."
              value={grateful}
              onChange={(e) => setGrateful(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="improvements" className={styles.label}>
              What can I improve tomorrow?
            </label>
            <textarea
              id="improvements"
              className={styles.textarea}
              placeholder="E.g., Try to block out focus periods earlier in the day..."
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="highlights" className={styles.label}>
              What was the best part of today?
            </label>
            <textarea
              id="highlights"
              className={styles.textarea}
              placeholder="E.g., Celebrating a successful release with the team..."
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
            />
          </div>

          {/* Comma-separated Tags Input */}
          <div className={styles.tagsArea}>
            <label htmlFor="tags-input" className={styles.label}>
              Tags
            </label>
            <input
              id="tags-input"
              type="text"
              className={styles.input}
              placeholder="Type tag and press Enter or comma"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={handleTagBlur}
            />
            <div className={styles.tagsContainer}>
              {tagsList.map((tag) => (
                <span
                  key={tag}
                  className={styles.tagChip}
                  onClick={() => removeTag(tag)}
                  title="Click to remove tag"
                >
                  #{tag} <span className={styles.removeX}>✕</span>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnSubmit}`}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Reflection' : 'Save Reflection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReflectionForm;
