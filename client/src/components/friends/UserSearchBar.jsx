import React from 'react';
import styles from './FriendsComponents.module.css';

/**
 * Search input component for finding new friends.
 * @param {{ onSearch: (val: string) => void, loading: boolean, resultCount: number, value: string }} props
 */
const UserSearchBar = ({ onSearch, loading, resultCount, value }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  const handleClear = () => {
    onSearch('');
  };

  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name or username..."
          value={value || ''}
          onChange={handleChange}
        />
        {loading && <div className={styles.spinner} aria-label="Loading"></div>}
        {!loading && value && (
          <button 
            className={styles.clearButton} 
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {value && value.trim() && (
        <div className={styles.resultCount}>
          {resultCount > 0 ? (
            `${resultCount} user${resultCount === 1 ? '' : 's'} found`
          ) : (
            `No users found for '${value}'`
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchBar;
