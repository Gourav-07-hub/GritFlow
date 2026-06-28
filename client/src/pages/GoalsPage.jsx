/**
 * GoalsPage.jsx — Goal Setting Dashboard layout and logic
 */

import { useState, useEffect } from 'react';
import useGoals from '../hooks/useGoals';
import GoalList from '../components/goals/GoalList';
import GoalForm from '../components/goals/GoalForm';
import styles from './GoalsPage.module.css';

function GoalsPage() {
  useEffect(() => {
    document.title = 'Goals | GritFlow';
  }, []);
  const {
    goals,
    loading,
    error,
    addGoal,
    editGoal,
    removeGoal,
    updateProgress,
    completeMilestone,
  } = useGoals();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Helper to determine if a deadline has passed
  const isOverdue = (deadlineStr, status) => {
    if (status === 'completed' || status === 'abandoned') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    return deadline.getTime() < today.getTime();
  };

  // Compute summary metrics
  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => (g.status || 'active') === 'active').length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const overdueGoals = goals.filter((g) => isOverdue(g.deadline, g.status)).length;

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleFormSubmit = async (formData) => {
    if (editingGoal) {
      await editGoal(editingGoal._id, formData);
    } else {
      await addGoal(formData);
    }
    setShowForm(false);
    setEditingGoal(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerArea}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Goal Setting Dashboard</h2>
          <p className={styles.subheading}>Dream big, plan smart, achieve more</p>
        </div>
        <button className={styles.addBtn} onClick={handleAddClick}>
          <span>+</span> Add Goal
        </button>
      </header>

      {/* Summary Stats Bar */}
      <section className={styles.summaryBar} aria-label="Goals Summary Statistics">
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Goals</span>
          <span className={styles.statValue}>{totalGoals}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Active</span>
          <span className={styles.statValue}>{activeGoals}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Completed</span>
          <span className={styles.statValue}>{completedGoals}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Overdue</span>
          <span
            className={`${styles.statValue} ${overdueGoals > 0 ? styles.statValueOverdue : ''}`}
          >
            {overdueGoals}
          </span>
        </div>
      </section>

      {/* Goals Grid Filter & List */}
      <GoalList
        goals={goals}
        loading={loading}
        error={error}
        onEdit={handleEditClick}
        onDelete={removeGoal}
        onProgressUpdate={updateProgress}
        onMilestoneToggle={completeMilestone}
      />

      {/* Form Dialog Modal */}
      {showForm && (
        <GoalForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingGoal}
        />
      )}
    </div>
  );
}

export default GoalsPage;
