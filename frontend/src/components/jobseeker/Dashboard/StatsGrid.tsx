import React from 'react';
import { FiFileText, FiBookmark, FiUser, FiBriefcase } from 'react-icons/fi';
import styles from './StatsGrid.module.css';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statContent}>
      <h3 className={styles.statNumber}>{value}</h3>
      <p className={styles.statLabel}>{label}</p>
    </div>
  </div>
);

interface StatsGridProps {
  applicationsCount: number;
  savedJobsCount: number;
  interviewsCount: number;
  availableJobsCount: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ 
  applicationsCount,
  savedJobsCount,
  interviewsCount,
  availableJobsCount 
}) => {
  return (
    <div className={styles.statsGrid}>
      <StatCard 
        icon={<FiFileText />} 
        label="Applications" 
        value={applicationsCount} 
      />
      <StatCard 
        icon={<FiBookmark />} 
        label="Saved Jobs" 
        value={savedJobsCount} 
      />
      <StatCard 
        icon={<FiUser />} 
        label="Interviews" 
        value={interviewsCount} 
      />
      <StatCard 
        icon={<FiBriefcase />} 
        label="Available Jobs" 
        value={availableJobsCount} 
      />
    </div>
  );
};

export default StatsGrid;
