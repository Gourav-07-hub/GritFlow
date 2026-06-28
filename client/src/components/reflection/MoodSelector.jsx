/**
 * MoodSelector.jsx — Interactive mood rating selector
 */

import styles from './MoodSelector.module.css';

/**
 * MoodSelector component
 * @param {{ value: number, onChange: (mood: number, label: string) => void }} props
 */
function MoodSelector({ value, onChange }) {
  const moodOptions = [
    { score: 1, emoji: '😢', label: 'Terrible' },
    { score: 2, emoji: '😕', label: 'Bad' },
    { score: 3, emoji: '😐', label: 'Okay' },
    { score: 4, emoji: '😊', label: 'Good' },
    { score: 5, emoji: '🤩', label: 'Amazing' },
  ];

  return (
    <div className={styles.container} role="radiogroup" aria-label="Mood Rating Selection">
      {moodOptions.map((opt) => (
        <button
          key={opt.score}
          type="button"
          role="radio"
          aria-checked={value === opt.score}
          className={`${styles.moodBtn} ${
            value === opt.score ? styles.moodBtnActive : ''
          }`}
          onClick={() => onChange(opt.score, opt.label)}
          aria-label={opt.label}
        >
          <span className={styles.moodEmoji} aria-hidden="true">
            {opt.emoji}
          </span>
          <span className={styles.moodLabel}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export default MoodSelector;
