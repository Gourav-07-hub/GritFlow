/**
 * HabitsPage.jsx — Habit Tracker page layout and logic
 */

import { useState, useEffect } from 'react';
import useHabits from '../hooks/useHabits';
import HabitList from '../components/habits/HabitList';
import HabitForm from '../components/habits/HabitForm';
import styles from './HabitsPage.module.css';

function HabitsPage() {
  useEffect(() => {
    document.title = 'Habits | GritFlow';
  }, []);
  const {
    habits,
    loading,
    error,
    addHabit,
    editHabit,
    removeHabit,
    toggleComplete,
  } = useHabits();

  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Helper to determine if a habit was completed today
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

  // Compute summary bar figures
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => isCompletedToday(h.completedDates)).length;
  const bestStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak || 0)) : 0;

  const handleEditClick = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingHabit(null);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleFormSubmit = async (formData) => {
    if (editingHabit) {
      await editHabit(editingHabit._id, formData);
    } else {
      await addHabit(formData);
    }
    setShowForm(false);
    setEditingHabit(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerArea}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Habit Tracker</h2>
          <p className={styles.subheading}>Build consistency, one day at a time</p>
        </div>
        <button className={styles.addBtn} onClick={handleAddClick}>
          <span>+</span> Add Habit
        </button>
      </header>

      {/* Summary Bar */}
      <section className={styles.summaryBar} aria-label="Habits Summary Statistics">
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Habits</span>
          <span className={styles.statValue}>{totalHabits}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Completed Today</span>
          <span className={styles.statValue}>{completedToday}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Best Streak</span>
          <span className={styles.statValue}>{bestStreak} days</span>
        </div>
      </section>

      {/* Habits Grid */}
      <HabitList
        habits={habits}
        loading={loading}
        error={error}
        onToggle={toggleComplete}
        onEdit={handleEditClick}
        onDelete={removeHabit}
      />

      {/* Form Dialog Modal */}
      {showForm && (
        <HabitForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingHabit}
        />
      )}
    </div>
  );
}

export default HabitsPage;
