import React from 'react';
import styles from '../../../../pages/jobseeker/Dashboard.module.css';
import { FiFileText } from 'react-icons/fi';

const ApplicationsTab: React.FC = () => {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Applications</h1>
        <p className={styles.pageSubtitle}>Track your job application progress</p>
      </div>
      <div className={styles.emptyState}>
        <FiFileText size={48} className={styles.emptyIcon} />
        <h3>No applications yet</h3>
        <p>Your job applications will appear here</p>
      </div>
    </div>
  );
};

export default ApplicationsTab;
