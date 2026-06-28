/**
 * ReflectionCalendar.jsx — Monthly calendar display showing daily reflections
 */

import styles from './ReflectionCalendar.module.css';

/**
 * ReflectionCalendar component
 * @param {{
 *   reflections: array,
 *   onDayClick: (reflection: object|null, date: Date) => void,
 *   currentMonth: Date,
 *   onMonthChange: (date: Date) => void
 * }} props
 */
function ReflectionCalendar({ reflections, onDayClick, currentMonth, onMonthChange }) {
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getStartDayOfWeek = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const startDayOfWeek = getStartDayOfWeek(currentMonth);

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onMonthChange(next);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === currentMonth.getFullYear() &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getDate() === day
    );
  };

  // Safe timezone-invariant date matching
  const getISODateString = (dateVal) => {
    const d = new Date(dateVal);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const findReflectionForDay = (day) => {
    const cellDateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return reflections.find((r) => {
      if (!r.date) return false;
      return r.date.startsWith(cellDateStr) || getISODateString(r.date) === cellDateStr;
    });
  };

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
        return '';
    }
  };

  const getDotClass = (score) => {
    if (score <= 2) return styles.dotRed;
    if (score === 3) return styles.dotYellow;
    return styles.dotGreen;
  };

  // Weekdays names row
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build cells
  const cells = [];
  // Empty padding cells
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className={styles.emptyCell} />);
  }
  // Days of month cells
  for (let day = 1; day <= daysInMonth; day++) {
    const reflection = findReflectionForDay(day);
    const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    cells.push(
      <button
        key={`day-${day}`}
        type="button"
        className={`${styles.dayCell} ${isToday(day) ? styles.todayCell : ''}`}
        onClick={() => onDayClick(reflection || null, cellDate)}
        aria-label={`${cellDate.toLocaleDateString('en-US', {
          dateStyle: 'full',
        })}. ${reflection ? `Mood: ${reflection.moodLabel}` : 'No entry logged.'}`}
      >
        <span className={styles.dayNumber}>{day}</span>
        {reflection && (
          <div className={styles.cellContent}>
            <span className={styles.emoji} aria-hidden="true">
              {getMoodEmoji(reflection.mood)}
            </span>
            <div
              className={`${styles.dot} ${getDotClass(reflection.mood)}`}
              title={`Mood: ${reflection.moodLabel}`}
            />
          </div>
        )}
      </button>
    );
  }

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.monthTitle}>{monthName}</h3>
        <div className={styles.navBtns}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrevMonth}
            aria-label="Previous Month"
          >
            ◀
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handleNextMonth}
            aria-label="Next Month"
          >
            ▶
          </button>
        </div>
      </header>

      <div className={styles.weekdays}>
        {weekdays.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      <div className={styles.daysGrid}>{cells}</div>
    </div>
  );
}

export default ReflectionCalendar;
