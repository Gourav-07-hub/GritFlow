/**
 * HabitList.jsx — Renders a grid of HabitCards, or loading/error/empty states
 */

import HabitCard from './HabitCard';
import styles from './HabitList.module.css';

/**
 * HabitList component
 * @param {{
 *   habits: array,
 *   loading: boolean,
 *   error: string|null,
 *   onToggle: (id: string) => void,
 *   onEdit: (habit: object) => void,
 *   onDelete: (id: string) => void
 * }} props
 */
function HabitList({ habits, loading, error, onToggle, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className={styles.skeletonCard}
            data-testid="skeleton-loader"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <p>⚠️ Error loading habits: {error}</p>
      </div>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3 className={styles.emptyTitle}>No habits yet!</h3>
        <p>Add your first habit to get started 🚀</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {habits.map((habit) => (
        <HabitCard
          key={habit._id}
          habit={habit}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default HabitList;
