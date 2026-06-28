import React, { useState, useEffect, useCallback } from 'react';

/**
 * AchievementToast — Animated toast popup shown when achievements are unlocked.
 * Automatically handles queues by rendering multiple achievements sequentially with a 1s delay.
 */
export default function AchievementToast({ achievements, onDismiss }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setCurrentIndex(0);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [achievements]);

  const handleNext = useCallback(() => {
    setVisible(false);

    // Wait for the slide-out transition (350ms), then wait 1 second (1000ms delay)
    // before displaying the next achievement, if any.
    setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setTimeout(() => {
          setVisible(true);
        }, 1000); // 1s delay between sequential toasts
      } else {
        onDismiss();
      }
    }, 400);
  }, [currentIndex, achievements, onDismiss]);

  useEffect(() => {
    if (!visible || !achievements || achievements.length === 0) return;

    // Auto dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      handleNext();
    }, 5000);

    return () => clearTimeout(dismissTimer);
  }, [visible, achievements, handleNext]);

  if (!achievements || achievements.length === 0) return null;

  const current = achievements[currentIndex];
  if (!current) return null;

  return (
    <div className="achievement-toast-container">
      <div className={`achievement-toast-card ${visible ? 'visible' : ''}`}>
        <div className="achievement-toast-icon">{current.icon}</div>
        <div className="achievement-toast-content">
          <div className="achievement-toast-header">🏆 Achievement Unlocked!</div>
          <h4 className="achievement-toast-title">{current.title}</h4>
          <p className="achievement-toast-desc">{current.description}</p>
        </div>
        <button
          className="achievement-toast-close"
          onClick={handleNext}
          aria-label="Close Toast"
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
