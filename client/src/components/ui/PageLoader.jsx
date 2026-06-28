import React from 'react';

/**
 * PageLoader — Centered loading overlay with an animated spinner
 */
export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="page-loader-overlay" role="progressbar" aria-label={message}>
      <div className="page-loader-spinner" />
      <span className="page-loader-text">{message}</span>
    </div>
  );
}
