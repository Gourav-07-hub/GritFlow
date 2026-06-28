/**
 * HomePage.jsx — Landing / Dashboard page
 * The primary entry point of the GritFlow application.
 */

import { useEffect } from 'react';
import styles from './HomePage.module.css';

/**
 * HomePage component
 * Renders the main dashboard placeholder.
 */
function HomePage() {
  useEffect(() => {
    document.title = 'GritFlow — Level Up Your Life';
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <span className={styles.badge}>✦ Self Improvement</span>
        <h1 className={styles.title}>GritFlow</h1>
        <p className={styles.subtitle}>
          Your personal command center for growth, goals, and well-being.
        </p>
        <div className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />
          Server &amp; client are running
        </div>
      </div>
    </main>
  );
}

export default HomePage;
