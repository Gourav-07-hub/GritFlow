import React from 'react';

/**
 * Recent Reflection widget displaying the latest reflection entry with quotation stylings.
 */
export default function RecentReflection({ reflections }) {
  const sorted = [...(reflections || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="widget-card widget-reflection-card fade-in-up delay-4">
      <h3 className="widget-section-title">
        <span className="widget-title-icon pink">📓</span> Recent Reflection
      </h3>

      {!latest ? (
        <div className="widget-empty-state">
          <span className="empty-state-illustration">📓</span>
          <p className="widget-empty-text">No reflections recorded yet.</p>
        </div>
      ) : (
        <div className="widget-reflection-content-area">
          <div className="widget-reflection-date">{formatDate(latest.date)}</div>
          <div className="widget-reflection-preview-card">
            <span className="quote-mark">“</span>
            <p className="widget-reflection-body">{latest.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
