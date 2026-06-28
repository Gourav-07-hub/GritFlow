/**
 * GoalList.jsx — Grid of GoalCards with filter bar functionality
 */

import { useState } from 'react';
import GoalCard from './GoalCard';
import styles from './GoalList.module.css';

/**
 * GoalList component
 * @param {{
 *   goals: array,
 *   loading: boolean,
 *   error: string|null,
 *   onEdit: (goal: object) => void,
 *   onDelete: (id: string) => void,
 *   onProgressUpdate: (id: string, progress: number) => void,
 *   onMilestoneToggle: (goalId: string, milestoneId: string) => void
 * }} props
 */
function GoalList({
  goals,
  loading,
  error,
  onEdit,
  onDelete,
  onProgressUpdate,
  onMilestoneToggle,
}) {
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Abandoned', value: 'abandoned' },
  ];

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <p>⚠️ Error loading goals: {error}</p>
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3 className={styles.emptyTitle}>No goals yet!</h3>
        <p>Set your first goal and start achieving 🎯</p>
      </div>
    );
  }

  // Filter list
  const filteredGoals = goals.filter((goal) => {
    if (filter === 'all') return true;
    return (goal.status || 'active').toLowerCase() === filter;
  });

  return (
    <div>
      {/* Filter Bar */}
      <div className={styles.filterBar} role="tablist" aria-label="Filter goals by status">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={filter === opt.value}
            className={`${styles.filterBtn} ${
              filter === opt.value ? styles.filterBtnActive : ''
            }`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {filteredGoals.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>No matching goals</h3>
          <p>No goals match the "{filter}" status filter.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={onEdit}
              onDelete={onDelete}
              onProgressUpdate={onProgressUpdate}
              onMilestoneToggle={onMilestoneToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalList;
