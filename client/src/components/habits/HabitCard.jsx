/**
 * HabitCard.jsx — Displays a single habit card
 */

import styles from './HabitCard.module.css';

/**
 * HabitCard component
 * @param {{
 *   habit: object,
 *   onToggle: (id: string) => void,
 *   onEdit: (habit: object) => void,
 *   onDelete: (id: string) => void
 * }} props
 */
function HabitCard({ habit, onToggle, onEdit, onDelete }) {
  // Helper to determine if a habit has been completed today
  const isCompletedToday = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return false;
    const today = new Date();
    return completedDates.some((dateStr) => {
      const d = new Date(dateStr);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    });
  };

  const completed = isCompletedToday(habit.completedDates);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      onDelete(habit._id);
    }
  };

  return (
    <article
      className={`${styles.card} ${completed ? styles.cardCompleted : ''}`}
      aria-label={`Habit: ${habit.name}`}
    >
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.icon} aria-hidden="true">
            {habit.icon || '✅'}
          </div>
          <div className={styles.nameInfo}>
            <h3 className={styles.name}>{habit.name}</h3>
            {habit.description && (
              <p className={styles.description}>{habit.description}</p>
            )}
          </div>
        </div>

        <button
          className={styles.completeBtn}
          onClick={() => onToggle(habit._id)}
          aria-label={completed ? 'Mark habit incomplete' : 'Mark habit complete'}
        >
          {completed ? '✅' : '⭕'}
        </button>
      </div>

      <div className={styles.streakArea}>
        <span className={styles.streak}>🔥 {habit.streak || 0} day streak</span>
        {habit.longestStreak > 0 && (
          <span className={styles.bestStreak}>Best: {habit.longestStreak}</span>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.frequencyTag}>{habit.frequency}</span>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.name}`}
          >
            Edit
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={handleDelete}
            aria-label={`Delete ${habit.name}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default HabitCard;
