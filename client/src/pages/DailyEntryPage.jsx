import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';

const moods = [
  { emoji: '😢', label: 'Tough', value: 1 },
  { emoji: '😟', label: 'Low', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😊', label: 'Good', value: 4 },
  { emoji: '🌟', label: 'Amazing', value: 5 },
];

const moodLabelMap = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Amazing',
};

const stepLabels = ['Mood', 'Habits', 'Goals'];

function isTodayCompleted(habit) {
  if (!habit.completedDates || habit.completedDates.length === 0) return false;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return habit.completedDates.some((d) => {
    const date = new Date(d);
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return dateStart === todayStart;
  });
}

export default function DailyEntryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(3);
  const [reflection, setReflection] = useState('');
  const [habits, setHabits] = useState([]);
  const [checkedHabits, setCheckedHabits] = useState({});
  const [goals, setGoals] = useState([]);
  const [originalGoalProgress, setOriginalGoalProgress] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingError, setSavingError] = useState(null);
  const [habitLoading, setHabitLoading] = useState(false);
  const [goalLoading, setGoalLoading] = useState(false);
  const [habitError, setHabitError] = useState(null);
  const [goalError, setGoalError] = useState(null);
  const [slideDir, setSlideDir] = useState('right');

  useEffect(() => {
    document.title = 'Daily Entry | GritFlow';
  }, []);

  const fetchHabits = useCallback(async () => {
    setHabitLoading(true);
    setHabitError(null);
    try {
      const res = await api.get('/habits');
      const data = res.data || [];
      setHabits(data);
      const initialChecked = {};
      data.forEach((h) => {
        initialChecked[h._id] = isTodayCompleted(h);
      });
      setCheckedHabits(initialChecked);
    } catch (err) {
      setHabitError('Failed to load habits');
      console.error(err);
    } finally {
      setHabitLoading(false);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    setGoalLoading(true);
    setGoalError(null);
    try {
      const res = await api.get('/goals');
      const data = res.data || [];
      const active = data.filter((g) => g.status === 'active' || !g.status);
      setGoals(active);
      const original = {};
      active.forEach((g) => {
        original[g._id] = g.progress || 0;
      });
      setOriginalGoalProgress(original);
    } catch (err) {
      setGoalError('Failed to load goals');
      console.error(err);
    } finally {
      setGoalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 1 && habits.length === 0 && !habitLoading) {
      fetchHabits();
    }
  }, [step, habits.length, habitLoading, fetchHabits]);

  useEffect(() => {
    if (step === 2 && goals.length === 0 && !goalLoading) {
      fetchGoals();
    }
  }, [step, goals.length, goalLoading, fetchGoals]);

  const handleNext = () => {
    setSlideDir('right');
    if (step < 2) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setSlideDir('left');
    if (step > 0) setStep((s) => s - 1);
  };

  const handleToggleHabit = (habitId) => {
    setCheckedHabits((prev) => ({ ...prev, [habitId]: !prev[habitId] }));
  };

  const handleProgressChange = (goalId, value) => {
    setGoals((prev) =>
      prev.map((g) =>
        g._id === goalId ? { ...g, progress: Math.min(100, Math.max(0, value)) } : g
      )
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSavingError(null);
    const errors = [];
    const today = new Date().toISOString().split('T')[0];

    try {
      let existingReflection = null;
      try {
        const existingRes = await api.get(`/reflections/date/${today}`);
        existingReflection = existingRes.data;
      } catch (existingErr) {
        if (existingErr.response?.status !== 404) {
          console.error('Reflection check error:', existingErr);
        }
      }

      if (existingReflection && existingReflection._id) {
        await api.put(`/reflections/${existingReflection._id}`, {
          mood,
          moodLabel: moodLabelMap[mood],
          learned: reflection.trim(),
        });
      } else {
        await api.post('/reflections', {
          date: today,
          mood,
          moodLabel: moodLabelMap[mood],
          learned: reflection.trim(),
          grateful: '',
          improvements: '',
          highlights: '',
        });
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 400 && err.response?.data?.message?.includes('already exists')) {
        console.warn('Reflection already exists for today — skipping');
      } else {
        const msg = err.response?.data?.message || 'Failed to save reflection';
        errors.push(msg);
        console.error('Reflection save error:', err);
      }
    }

    for (const habit of habits) {
      const isNowChecked = checkedHabits[habit._id];
      const wasAlreadyDone = isTodayCompleted(habit);
      if (isNowChecked && !wasAlreadyDone) {
        try {
          await api.patch(`/habits/${habit._id}/toggle`);
        } catch (err) {
          const msg = err.response?.data?.message || `Failed to log habit: ${habit.name}`;
          errors.push(msg);
          console.error('Habit toggle error:', err);
        }
      }
    }

    for (const goal of goals) {
      const newProgress = goal.progress || 0;
      const originalProgress = originalGoalProgress[goal._id] || 0;
      if (newProgress !== originalProgress) {
        try {
          await api.patch(`/goals/${goal._id}/progress`, { progress: newProgress });
        } catch (err) {
          const msg = err.response?.data?.message || `Failed to update goal: ${goal.title}`;
          errors.push(msg);
          console.error('Goal progress error:', err);
        }
      }
    }

    setSaving(false);

    if (errors.length > 0) {
      setSavingError(errors.join('; '));
    }

    setSaved(true);
  };

  if (saved) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: '1.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
          Daily check-in complete! Great job! 🎉
        </h2>
        <p style={{ color: '#8892a4', margin: 0 }}>
          You&apos;re on a streak! Keep it going! 🔥
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 32px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.4)',
              background: 'rgba(99,102,241,0.15)', color: '#f0f4ff', fontSize: '0.95rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            View Dashboard
          </button>
          <button
            onClick={() => navigate('/dashboard/stats')}
            style={{
              padding: '12px 32px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
              fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            View Stats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#f0f4ff' }}>
          Daily Check-In
        </h2>
        <p style={{ color: '#8892a4', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
          One quick step at a time
        </p>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem',
        alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700,
                background:
                  step > i ? '#22c55e'
                  : step === i ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : '#1a1f2e',
                color: step >= i ? '#fff' : '#4a5568',
                border: step < i ? '2px solid #2a3040' : '2px solid transparent',
                transition: 'all 0.3s ease',
              }}>
                {step > i ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: step === i ? 600 : 400,
                color: step === i ? '#f0f4ff' : '#4a5568',
              }}>
                {stepLabels[i]}
              </span>
            </div>
            {i < 2 && (
              <div style={{
                width: '48px', height: '2px',
                background: step > i ? '#22c55e' : '#1a1f2e',
                transition: 'background 0.3s ease',
                borderRadius: '1px',
              }} />
            )}
          </div>
        ))}
      </div>

      {savingError && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '0.875rem',
          marginBottom: '1rem',
        }}>
          {savingError}
        </div>
      )}

      <div style={{
        background: '#111827', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.15)',
        padding: '2rem', minHeight: '320px', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem',
          animation: slideDir === 'right' ? 'slideInRight 0.3s ease' : 'slideInLeft 0.3s ease',
        }}>
          {step === 0 && (
            <>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
                  How are you feeling?
                </h3>
                <p style={{ color: '#8892a4', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
                  Pick the mood that best describes your day
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      type="button"
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                        padding: '12px 16px', borderRadius: '12px',
                        border: mood === m.value ? '2px solid #6366f1' : '1px solid #2a3040',
                        background: mood === m.value ? 'rgba(99,102,241,0.12)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.2s ease', minWidth: '70px',
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>{m.emoji}</span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 500,
                        color: mood === m.value ? '#f0f4ff' : '#8892a4',
                      }}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f4ff', margin: '0 0 0.75rem' }}>
                  Anything on your mind?
                </h3>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Write a short reflection about your day..."
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                    border: '1px solid #2a3040', background: '#0d1117',
                    color: '#f0f4ff', fontSize: '0.9rem', resize: 'vertical',
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
                  How are your habits today? ✅
                </h3>
                <p style={{ color: '#8892a4', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
                  Check off the habits you completed today
                </p>
              </div>
              {habitLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8892a4' }}>
                  <div style={{
                    width: '32px', height: '32px', border: '3px solid #2a3040',
                    borderTopColor: '#6366f1', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 1rem',
                  }} />
                  Loading habits...
                </div>
              ) : habitError ? (
                <p style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                  {habitError}
                </p>
              ) : habits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#8892a4', fontSize: '0.9rem', margin: '0 0 1rem' }}>
                    No habits yet! Add habits from Habit Tracker first
                  </p>
                  <Link to="/dashboard/habits" style={{
                    color: '#a5b4fc', fontSize: '0.9rem', fontWeight: 600,
                  }}>
                    Go to Habit Tracker →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {habits.map((habit) => {
                    const wasDone = isTodayCompleted(habit);
                    const isChecked = checkedHabits[habit._id];
                    return (
                      <label
                        key={habit._id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '12px 16px', borderRadius: '10px',
                          border: '1px solid #2a3040', cursor: 'pointer',
                          background: isChecked ? 'rgba(99,102,241,0.08)' : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!isChecked}
                          onChange={() => handleToggleHabit(habit._id)}
                          style={{
                            width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer',
                          }}
                        />
                        <span style={{ fontSize: '1.1rem' }}>{habit.icon || '✅'}</span>
                        <span style={{
                          flex: 1, fontSize: '0.9rem', fontWeight: 500,
                          color: isChecked ? '#f0f4ff' : '#8892a4',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          opacity: isChecked ? 0.7 : 1,
                        }}>
                          {habit.name}
                        </span>
                        {habit.streak > 0 && (
                          <span style={{
                            fontSize: '0.75rem', color: '#f59e0b',
                            background: 'rgba(245,158,11,0.1)', padding: '2px 8px',
                            borderRadius: '6px', fontWeight: 600,
                          }}>
                            🔥 {habit.streak}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
                  How are your goals going? 🎯
                </h3>
                <p style={{ color: '#8892a4', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
                  Slide to update your progress
                </p>
              </div>
              {goalLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8892a4' }}>
                  <div style={{
                    width: '32px', height: '32px', border: '3px solid #2a3040',
                    borderTopColor: '#6366f1', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 1rem',
                  }} />
                  Loading goals...
                </div>
              ) : goalError ? (
                <p style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                  {goalError}
                </p>
              ) : goals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#8892a4', fontSize: '0.9rem', margin: '0 0 1rem' }}>
                    No active goals! Add goals from Goals page first
                  </p>
                  <Link to="/dashboard/goals" style={{
                    color: '#a5b4fc', fontSize: '0.9rem', fontWeight: 600,
                  }}>
                    Go to Goals →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {goals.map((goal) => (
                    <div key={goal._id} style={{
                      padding: '14px 16px', borderRadius: '10px',
                      border: '1px solid #2a3040',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f4ff' }}>
                          {goal.title}
                        </span>
                        <span style={{
                          background: goal.category
                            ? 'rgba(99,102,241,0.12)' : 'transparent',
                          color: goal.category ? '#a5b4fc' : '#6366f1',
                          fontSize: '0.75rem', fontWeight: 600,
                          padding: goal.category ? '2px 10px' : '0',
                          borderRadius: '6px',
                        }}>
                          {goal.category || ''}
                        </span>
                      </div>
                      <div style={{
                        height: '6px', background: '#1a1f2e', borderRadius: '3px',
                        marginBottom: '0.5rem', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${goal.progress || 0}%`,
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          borderRadius: '3px', transition: 'width 0.2s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress || 0}
                          onChange={(e) => handleProgressChange(goal._id, parseInt(e.target.value))}
                          style={{ flex: 1, accentColor: '#6366f1', cursor: 'pointer' }}
                        />
                        <span style={{
                          fontSize: '0.85rem', fontWeight: 700, color: '#6366f1',
                          minWidth: '36px', textAlign: 'right',
                        }}>
                          {goal.progress || 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={step === 0 ? () => navigate('/dashboard') : handleBack}
            disabled={saving}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: '1px solid #2a3040',
              background: 'transparent', color: '#8892a4',
              fontSize: '0.9rem', fontWeight: 600, cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.4 : 1, transition: 'all 0.2s ease',
            }}
          >
            {step === 0 ? 'Back to Dashboard' : 'Back'}
          </button>

          {step < 2 ? (
            <button
              onClick={handleNext}
              style={{
                padding: '10px 32px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              style={{
                padding: '10px 32px', borderRadius: '10px', border: 'none',
                background: saving ? '#2a3040' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: saving ? '#4a5568' : '#fff',
                fontSize: '0.9rem', fontWeight: 600, cursor: saving ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {saving ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
