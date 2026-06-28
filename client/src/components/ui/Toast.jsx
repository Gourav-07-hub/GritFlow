import React from 'react';
import useToast from '../../hooks/useToast';

/**
 * Toast — Global toast container and item renderer
 */
export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => {
        let icon = 'ℹ️';
        if (toast.type === 'success') icon = '✅';
        if (toast.type === 'error') icon = '❌';
        if (toast.type === 'warning') icon = '⚠️';

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <span className="toast-icon" aria-hidden="true">
              {icon}
            </span>
            <div className="toast-message">{toast.message}</div>
            <button
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Close Alert"
              type="button"
            >
              ✕
            </button>
            <div
              className="toast-progress"
              style={{ animationDuration: `${toast.duration || 4000}ms` }}
            />
          </div>
        );
      })}
    </div>
  );
}
