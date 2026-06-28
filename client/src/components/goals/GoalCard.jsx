/**
 * GoalCard.jsx — Renders a single Goal card with progress metrics and milestones
 */

import { useState, useEffect } from 'react';
import MilestoneList from './MilestoneList';
import { formatDate } from '../../utils/helpers';
import styles from './GoalCard.module.css';

/**
 * GoalCard component
 * @param {{
 *   goal: object,
 *   onEdit: (goal: object) => void,
 *   onDelete: (id: string) => void,
 *   onProgressUpdate: (id: string, progress: number) => void,
 *   onMilestoneToggle: (goalId: string, milestoneId: string) => void
 * }} props
 */
function GoalCard({ goal, onEdit, onDelete, onProgressUpdate, onMilestoneToggle }) {
  const [sliderVal, setSliderVal] = useState(goal.progress || 0);

  // Sync slider value when goal progress updates from parent/API
  useEffect(() => {
    setSliderVal(goal.progress || 0);
  }, [goal.progress]);

  // Calculate remaining days
  const getDaysLeft = (deadlineStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', isOverdue: true };
    }
    if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false };
    }
    if (diffDays === 1) {
      return { text: '1 day left', isOverdue: false };
    }
    return { text: `${diffDays} days left`, isOverdue: false };
  };

  const daysLeftInfo = getDaysLeft(goal.deadline);
  const isCompleted = goal.status === 'completed';
  const hasMilestones = goal.milestones && goal.milestones.length > 0;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the goal "${goal.title}"?`)) {
      onDelete(goal._id);
    }
  };

  const handleSliderChange = (e) => {
    setSliderVal(Number(e.target.value));
  };

  const handleSliderRelease = () => {
    if (sliderVal !== goal.progress) {
      onProgressUpdate(goal._id, sliderVal);
    }
  };

  // Maps categories to corresponding CSS modules classes
  const getCategoryClass = (category) => {
    const cat = (category || 'personal').toLowerCase();
    switch (cat) {
      case 'health':
        return styles.catHealth;
      case 'career':
        return styles.catCareer;
      case 'education':
        return styles.catEducation;
      case 'finance':
        return styles.catFinance;
      case 'personal':
        return styles.catPersonal;
      default:
        return styles.catOther;
    }
  };

  return (
    <article
      className={`${styles.card} ${isCompleted ? styles.cardCompleted : ''}`}
      aria-label={`Goal: ${goal.title}`}
    >
      {/* Category, Priority and Status Row */}
      <div className={styles.badgeRow}>
        <span className={`${styles.categoryBadge} ${getCategoryClass(goal.category)}`}>
          {goal.category}
        </span>
        <div className={styles.metaInfo}>
          <span
            className={`${styles.priorityBadge} ${
              styles[`priority${(goal.priority || 'medium').toLowerCase()}`]
            }`}
          >
            {goal.priority}
          </span>
          <span
            className={`${styles.statusBadge} ${
              styles[`status${(goal.status || 'active').toLowerCase()}`]
            }`}
          >
            {goal.status}
          </span>
        </div>
      </div>

      {/* Goal Title & Description */}
      <div className={styles.titleGroup}>
        <h3 className={styles.title}>{goal.title}</h3>
        {goal.description && <p className={styles.description}>{goal.description}</p>}
      </div>

      {/* Progress Bar Display */}
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${goal.progress}%` }}
            role="progressbar"
            aria-valuenow={goal.progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>

      {/* Manual Slider if NO milestones exist */}
      {!hasMilestones && (
        <div className={styles.sliderContainer}>
          <label htmlFor={`slider-${goal._id}`} className={styles.sliderLabel}>
            Adjust Progress:
          </label>
          <input
            id={`slider-${goal._id}`}
            type="range"
            min="0"
            max="100"
            className={styles.slider}
            value={sliderVal}
            onChange={handleSliderChange}
            onMouseUp={handleSliderRelease}
            onTouchEnd={handleSliderRelease}
            onKeyUp={handleSliderRelease}
          />
        </div>
      )}

      {/* Milestones Checklist if milestones exist */}
      {hasMilestones && (
        <div>
          <h4 className={styles.sectionTitle}>Milestones</h4>
          <MilestoneList
            milestones={goal.milestones}
            goalId={goal._id}
            onToggle={onMilestoneToggle}
          />
        </div>
      )}

      {/* Deadline Info */}
      <div className={styles.deadlineRow}>
        <span>Deadline: {formatDate(goal.deadline)}</span>
        <span className={daysLeftInfo.isOverdue ? styles.deadlineOverdue : ''}>
          {daysLeftInfo.text}
        </span>
      </div>

      {/* Action buttons */}
      <footer className={styles.footer}>
        <button
          className={styles.actionBtn}
          onClick={() => onEdit(goal)}
          aria-label={`Edit goal ${goal.title}`}
        >
          Edit
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={handleDelete}
          aria-label={`Delete goal ${goal.title}`}
        >
          Delete
        </button>
      </footer>
    </article>
  );
}

export default GoalCard;
