/**
 * GoalForm.jsx — Modal dialog to create or edit a Goal
 */

import { useState, useEffect } from 'react';
import styles from './GoalForm.module.css';

/**
 * GoalForm component
 * @param {{
 *   onSubmit: (goalData: object) => Promise<void>,
 *   onCancel: () => void,
 *   initialData: object
 * }} props
 */
function GoalForm({ onSubmit, onCancel, initialData }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('active');
  const [milestones, setMilestones] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!initialData;

  // Helper to format Date string to YYYY-MM-DD for native HTML date input
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'personal');
      setPriority(initialData.priority || 'medium');
      setDeadline(formatDateForInput(initialData.deadline));
      setStatus(initialData.status || 'active');
      setMilestones(initialData.milestones || []);
    }
  }, [initialData]);

  const handleAddMilestoneRow = () => {
    setMilestones([
      ...milestones,
      { _id: `temp-${Date.now()}-${Math.random()}`, title: '', isComplete: false },
    ]);
  };

  const handleRemoveMilestoneRow = (id) => {
    setMilestones(milestones.filter((m) => m._id !== id));
  };

  const handleMilestoneTextChange = (id, text) => {
    setMilestones(
      milestones.map((m) => (m._id === id ? { ...m, title: text } : m))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Goal title is required');
      return;
    }

    if (!deadline) {
      setError('Deadline date is required');
      return;
    }

    // Clean milestones array to strip temporary client IDs before sending
    const cleanedMilestones = milestones
      .map((m) => {
        const milestoneObj = { title: m.title.trim(), isComplete: m.isComplete };
        // If it was already in the database, preserve its valid ObjectId
        if (m._id && !m._id.toString().startsWith('temp-')) {
          milestoneObj._id = m._id;
          if (m.completedAt) milestoneObj.completedAt = m.completedAt;
        }
        return milestoneObj;
      })
      .filter((m) => m.title !== ''); // Filter out empty inputs

    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        category,
        priority,
        deadline,
        status,
        milestones: cleanedMilestones,
      });
    } catch (err) {
      setError(err || 'Failed to save goal');
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
        aria-labelledby="goal-form-title"
      >
        <h2 id="goal-form-title" className={styles.title}>
          {isEdit ? 'Edit Goal' : 'Create New Goal'}
        </h2>

        {error && (
          <div className={styles.error} style={{ color: '#f87171', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="goal-title" className={styles.label}>
              Goal Title *
            </label>
            <input
              id="goal-title"
              type="text"
              className={styles.input}
              placeholder="E.g., Save $5,000 for emergency fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="goal-desc" className={styles.label}>
              Description
            </label>
            <textarea
              id="goal-desc"
              className={styles.textarea}
              placeholder="Describe why this goal is important and how you plan to achieve it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="goal-category" className={styles.label}>
                Category
              </label>
              <select
                id="goal-category"
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="personal">Personal</option>
                <option value="career">Career</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="goal-priority" className={styles.label}>
                Priority
              </label>
              <select
                id="goal-priority"
                className={styles.select}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="goal-deadline" className={styles.label}>
                Deadline *
              </label>
              <input
                id="goal-deadline"
                type="date"
                className={styles.input}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            {isEdit && (
              <div className={styles.formGroup}>
                <label htmlFor="goal-status" className={styles.label}>
                  Status
                </label>
                <select
                  id="goal-status"
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
            )}
          </div>

          {/* Dynamic Milestones Section */}
          <div className={styles.milestonesSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.label}>Milestones / Tasks</span>
              <button
                type="button"
                className={styles.addMilestoneBtn}
                onClick={handleAddMilestoneRow}
              >
                + Add Milestone
              </button>
            </div>

            {milestones.map((milestone) => (
              <div key={milestone._id} className={styles.milestoneRow}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="E.g., Complete first draft"
                  value={milestone.title}
                  onChange={(e) =>
                    handleMilestoneTextChange(milestone._id, e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  className={styles.removeMilestoneBtn}
                  onClick={() => handleRemoveMilestoneRow(milestone._id)}
                  aria-label="Remove milestone input row"
                >
                  ✕
                </button>
              </div>
            ))}
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
              {submitting ? 'Saving...' : isEdit ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoalForm;
