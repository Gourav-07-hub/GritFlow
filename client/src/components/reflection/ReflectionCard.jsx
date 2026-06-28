/**
 * ReflectionCard.jsx — Renders a logged journal entry
 */

import styles from './ReflectionCard.module.css';

/**
 * ReflectionCard component
 * @param {{
 *   reflection: object,
 *   onEdit: (reflection: object) => void,
 *   onDelete: (id: string) => void
 * }} props
 */
function ReflectionCard({ reflection, onEdit, onDelete }) {
  // Helper to format Date string to 'Monday, June 12, 2024'
  const getFullDateString = (dateVal) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC', // Ensure it doesn't drift due to timezone offset
    });
  };

  // Helper to map mood score to emoji
  const getMoodEmoji = (score) => {
    switch (score) {
      case 1:
        return '😢';
      case 2:
        return '😕';
      case 3:
        return '😐';
      case 4:
        return '😊';
      case 5:
        return '🤩';
      default:
        return '😐';
    }
  };

  const handleDelete = () => {
    const dateStr = new Date(reflection.date).toLocaleDateString('en-US', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    });
    if (window.confirm(`Are you sure you want to delete the reflection for ${dateStr}?`)) {
      onDelete(reflection._id);
    }
  };

  return (
    <article className={styles.card} aria-label={`Reflection for ${getFullDateString(reflection.date)}`}>
      <header className={styles.header}>
        <h3 className={styles.dateTitle}>{getFullDateString(reflection.date)}</h3>
        <div className={styles.moodBadge}>
          <span className={styles.moodEmoji} aria-hidden="true">
            {getMoodEmoji(reflection.mood)}
          </span>
          <span>{reflection.moodLabel}</span>
        </div>
      </header>

      <div className={styles.body}>
        {reflection.learned && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>📚 What I learned:</span>
            <p className={styles.sectionText}>{reflection.learned}</p>
          </div>
        )}

        {reflection.grateful && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>🙏 Grateful for:</span>
            <p className={styles.sectionText}>{reflection.grateful}</p>
          </div>
        )}

        {reflection.improvements && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>💡 Improvements for tomorrow:</span>
            <p className={styles.sectionText}>{reflection.improvements}</p>
          </div>
        )}

        {reflection.highlights && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>⭐ Today's highlight:</span>
            <p className={styles.sectionText}>{reflection.highlights}</p>
          </div>
        )}
      </div>

      {reflection.tags && reflection.tags.length > 0 && (
        <div className={styles.tagsContainer}>
          {reflection.tags.map((tag) => (
            <span key={tag} className={styles.tagChip}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <footer className={styles.footer}>
        <button
          className={styles.actionBtn}
          onClick={() => onEdit(reflection)}
          aria-label="Edit journal entry"
        >
          Edit
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={handleDelete}
          aria-label="Delete journal entry"
        >
          Delete
        </button>
      </footer>
    </article>
  );
}

export default ReflectionCard;
