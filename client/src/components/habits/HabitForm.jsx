/**
 * HabitForm.jsx — Modal form to create or edit a habit
 */

import { useState, useEffect } from 'react';
import styles from './HabitForm.module.css';

/**
 * HabitForm component
 * @param {{
 *   onSubmit: (habitData: object) => Promise<void>,
 *   onCancel: () => void,
 *   initialData: object
 * }} props
 */
function HabitForm({ onSubmit, onCancel, initialData }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('✅');
  const [frequency, setFrequency] = useState('daily');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setIcon(initialData.icon || '✅');
      setFrequency(initialData.frequency || 'daily');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Habit name is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        icon,
        frequency,
      });
    } catch (err) {
      setError(err || 'Failed to save habit');
      setSubmitting(false);
    }
  };

  const emojiOptions = ['✅', '🔥', '🎯', '📓', '⏱️', '💪', '💧', '🍎', '🧘', '🚶'];

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <h2 id="form-title" className={styles.title}>
          {isEdit ? 'Edit Habit' : 'Add New Habit'}
        </h2>

        {error && (
          <div className={styles.error} style={{ color: '#f87171', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="habit-icon" className={styles.label}>
              Icon
            </label>
            <div className={styles.emojiGroup}>
              <input
                id="habit-icon"
                type="text"
                className={`${styles.input} ${styles.emojiInput}`}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                required
              />
              <div className={styles.emojiSuggestions}>
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={styles.emojiBtn}
                    onClick={() => setIcon(emoji)}
                    aria-label={`Select icon ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="habit-name" className={styles.label}>
              Name *
            </label>
            <input
              id="habit-name"
              type="text"
              className={styles.input}
              placeholder="E.g., Read 10 pages"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="habit-desc" className={styles.label}>
              Description
            </label>
            <textarea
              id="habit-desc"
              className={styles.textarea}
              placeholder="E.g., Daily reading goal for self-development"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="habit-freq" className={styles.label}>
              Frequency
            </label>
            <select
              id="habit-freq"
              className={styles.select}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
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
              {submitting ? 'Saving...' : isEdit ? 'Update Habit' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HabitForm;
