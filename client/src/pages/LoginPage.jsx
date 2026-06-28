/**
 * LoginPage.jsx — User sign in page
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login | GritFlow';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Catch and display error message
      setLocalError(err || 'Failed to sign in');
    }
  };

  const displayError = localError || authError;

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <header>
          <div className="gritflow-logo" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', textAlign: 'center' }}>
            GritFlow
          </div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Level up your life, one day at a time 🚀</p>
        </header>

        {displayError && (
          <div className={styles.error} role="alert">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <footer className={styles.footer}>
          Don't have an account?
          <Link to="/register" className={styles.link}>
            Register
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default LoginPage;
