import React, { Component } from 'react';

/**
 * ErrorBoundary — React class component to catch layout crashes and present a fallback screen
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('⚠️ [ErrorBoundary] Caught an unhandled render error:', error);
      console.error(errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
            backgroundColor: '#0f172a',
            color: '#f1f5f9',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '4rem', marginBottom: '16px' }} role="img" aria-label="Concerned Face">
            😕
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 24px 0', maxWidth: '400px' }}>
            An unexpected error occurred while rendering the page. Try reloading or return to safety.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                background: '#1e293b',
                color: '#f87171',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                textAlign: 'left',
                overflowX: 'auto',
                maxWidth: '90%',
                marginBottom: '24px',
                border: '1px solid #334155',
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={this.handleReload}
              style={{
                background: '#6d28d9',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              type="button"
            >
              Try Refreshing
            </button>
            <button
              onClick={this.handleGoDashboard}
              style={{
                background: 'transparent',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              type="button"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
