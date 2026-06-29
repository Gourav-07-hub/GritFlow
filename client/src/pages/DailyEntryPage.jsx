import { useState, useEffect } from 'react';
import api from '../services/axiosConfig';

const moods = [
  { emoji: '😢', label: 'Tough', value: 1 },
  { emoji: '😟', label: 'Low', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😊', label: 'Good', value: 4 },
  { emoji: '🌟', label: 'Amazing', value: 5 },
];

const steps = ['Mood & Reflection', 'Habits', 'Goals'];

export default function DailyEntryPage() {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(3);
  const [reflection, setReflection] = useState('');
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Daily Entry | GritFlow';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitsRes, goalsRes] = await Promise.all([
          api.get('/habits'),
          api.get('/goals'),
        ]);
        setHabits(habitsRes.data || []);
        setGoals(goalsRes.data || []);
      } catch (err) {
        console.error('Failed to load daily data:', err);
      }
    };
    fetchData();
  }, []);

  const handleToggleHabit = (habitId) => {
    setHabits((prev) =>
      prev.map((h) =>
        h._id === habitId ? { ...h, completed: !h.completed } : h
      )
    );
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
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];

      if (reflection.trim()) {
        await api.post('/reflections', {
          mood,
          content: reflection.trim(),
          date: today,
        });
      }

      for (const habit of habits) {
        if (habit.completed) {
          try {
            await api.post(`/habits/${habit._id}/log`, { date: today });
          } catch (e) {
            if (e.response?.status !== 400) throw e;
          }
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return true;
    if (step === 2) return true;
    return true;
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (saved) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: '1.5rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem' }}>✨</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
          All saved!
        </h2>
        <p style={{ color: '#8892a4', margin: 0 }}>
          Great job logging your day. Come back tomorrow.
        </p>
        <button
          onClick={() => { setStep(0); setSaved(false); setReflection(''); setMood(3); }}
          style={{
            padding: '12px 32px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.4)',
            background: 'rgba(99,102,241,0.15)', color: '#f0f4ff', fontSize: '0.95rem',
            fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem'
          }}
        >
          Start New Entry
        </button>
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
        display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem'
      }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700,
              background: i === step ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : i < step ? 'rgba(99,102,241,0.3)' : '#1a1f2e',
              color: i <= step ? '#fff' : '#4a5568',
              border: i > step ? '1px solid #2a3040' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '0.8rem', fontWeight: i === step ? 600 : 400,
              color: i === step ? '#f0f4ff' : '#4a5568',
              display: 'none'
            }}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div style={{
                width: '40px', height: '2px',
                background: i < step ? 'rgba(99,102,241,0.5)' : '#1a1f2e',
                borderRadius: '1px'
              }} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: '#111827', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.15)',
        padding: '2rem', minHeight: '320px', display: 'flex', flexDirection: 'column'
      }}>
        {/* Step 0: Mood & Reflection */}
        {step === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                      padding: '12px 16px', borderRadius: '12px', border: mood === m.value
                        ? '2px solid #6366f1' : '1px solid #2a3040',
                      background: mood === m.value ? 'rgba(99,102,241,0.12)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s ease', minWidth: '70px'
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{m.emoji}</span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 500,
                      color: mood === m.value ? '#f0f4ff' : '#8892a4'
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
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Habits */}
        {step === 1 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
                What habits did you keep?
              </h3>
              <p style={{ color: '#8892a4', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
                Check off the habits you completed today
              </p>
            </div>
            {habits.length === 0 ? (
              <p style={{ color: '#4a5568', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                No habits yet. Create one in Settings!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {habits.map((habit) => (
                  <label
                    key={habit._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '12px 16px', borderRadius: '10px',
                      border: '1px solid #2a3040', cursor: 'pointer',
                      background: habit.completed ? 'rgba(99,102,241,0.08)' : 'transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!habit.completed}
                      onChange={() => handleToggleHabit(habit._id)}
                      style={{
                        width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      flex: 1, fontSize: '0.9rem', fontWeight: 500,
                      color: habit.completed ? '#f0f4ff' : '#8892a4',
                      textDecoration: habit.completed ? 'line-through' : 'none',
                      opacity: habit.completed ? 0.7 : 1
                    }}>
                      {habit.name}
                    </span>
                    <span style={{
                      fontSize: '0.75rem', color: '#4a5568',
                      background: '#0d1117', padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {habit.frequency}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f4ff', margin: 0 }}>
                How are your goals coming along?
              </h3>
              <p style={{ color: '#8892a4', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
                Slide to update your progress
              </p>
            </div>
            {goals.length === 0 ? (
              <p style={{ color: '#4a5568', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                No goals yet. Create one in Settings!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {goals.map((goal) => (
                  <div key={goal._id} style={{
                    padding: '14px 16px', borderRadius: '10px',
                    border: '1px solid #2a3040'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f4ff' }}>
                        {goal.title}
                      </span>
                      <span style={{
                        fontSize: '0.85rem', fontWeight: 700, color: '#6366f1'
                      }}>
                        {goal.progress || 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress || 0}
                      onChange={(e) => handleProgressChange(goal._id, parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                    />
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem',
                      color: '#4a5568', marginTop: '0.25rem'
                    }}>
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}>
          <button
            onClick={handleBack}
            disabled={step === 0 || saving}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: '1px solid #2a3040',
              background: 'transparent', color: step === 0 ? '#4a5568' : '#8892a4',
              fontSize: '0.9rem', fontWeight: 600, cursor: step === 0 ? 'default' : 'pointer',
              opacity: step === 0 ? 0.4 : 1, transition: 'all 0.2s ease'
            }}
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              style={{
                padding: '10px 32px', borderRadius: '10px', border: 'none',
                background: canProceed() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#2a3040',
                color: canProceed() ? '#fff' : '#4a5568',
                fontSize: '0.9rem', fontWeight: 600, cursor: canProceed() ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
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
                transition: 'all 0.2s ease'
              }}
            >
              {saving ? 'Saving...' : 'Save All'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
