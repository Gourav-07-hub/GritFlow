/**
 * DashboardLayout.jsx — Top-level layout with sidebar, navbar, and main content area
 * Styled with Cosmic Premium spacing rules and Lucide-react icon consistency.
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from './DashboardLayout.module.css';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Open by default on desktop, closed on mobile
    return window.innerWidth > 768;
  });

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        // Force open on desktop
        setSidebarOpen(true);
      } else {
        // Force close on mobile
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Overlay backdrop */}
      <div
        className={`${styles.backdrop} ${isMobile && sidebarOpen ? styles.show : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div
        className={`${styles.mainContent} ${
          sidebarOpen && !isMobile ? '' : styles.sidebarClosed
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className={styles.pageBody}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
