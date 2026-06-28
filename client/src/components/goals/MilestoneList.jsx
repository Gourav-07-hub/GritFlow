/**
 * MilestoneList.jsx — Milestone task sub-list inside GoalCard
 */

import { formatDate } from '../../utils/helpers';
import styles from './MilestoneList.module.css';

/**
 * MilestoneList component
 * @param {{
 *   milestones: array,
 *   goalId: string,
 *   onToggle: (goalId: string, milestoneId: string) => void
 * }} props
 */
function MilestoneList({ milestones, goalId, onToggle }) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <ul className={styles.list} aria-label="Goal milestones checklist">
      {milestones.map((milestone) => (
        <li key={milestone._id} className={styles.item}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={milestone.isComplete}
            onChange={() => onToggle(goalId, milestone._id)}
            aria-label={`Mark milestone "${milestone.title}" as ${
              milestone.isComplete ? 'incomplete' : 'complete'
            }`}
          />
          <div className={styles.content}>
            <span
              className={`${styles.title} ${
                milestone.isComplete ? styles.completedTitle : ''
              }`}
            >
              {milestone.title}
            </span>
            {milestone.isComplete && milestone.completedAt && (
              <span className={styles.date}>
                Done on {formatDate(milestone.completedAt)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default MilestoneList;
