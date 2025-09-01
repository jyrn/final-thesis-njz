import React from 'react';
import { Job } from '@/types/Job';
import Button from '../ui/Button';
import { FiEye, FiEdit2, FiTrash2, FiUsers, FiClock, FiMapPin } from 'react-icons/fi';
import styles from './JobCard.module.css';

interface JobCardProps {
  job: Job;
  onView?: (job: Job) => void;
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: string | number) => void;
  onClick?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onView, onEdit, onDelete, onClick }) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest(`.${styles.jobActions}`)) {
      return;
    }
    onClick?.(job);
  };

  return (
    <div className={styles.jobCard} onClick={handleCardClick}>
      <div className={styles.jobHeader}>
        <div>
          <h3 className={styles.jobTitle}>{job.title}</h3>
          <div className={styles.jobMeta}>
            <span className={styles.jobLocation}>
              <FiMapPin className={styles.icon} />
              {job.location} • {job.type}
            </span>
            {job.salary && (
              <span className={styles.jobSalary}>{job.salary}</span>
            )}
          </div>
        </div>
        <span className={`${styles.statusBadge} ${styles[job.status.toLowerCase()]}`}>
          {job.status}
        </span>
      </div>
      
      <div className={styles.jobStats}>
        <span 
          className={`${styles.statItem} ${styles.clickableStat}`}
          onClick={(e) => {
            e.stopPropagation();
            // Use the onView handler for the applicants count
            onView?.(job);
          }}
        >
          <FiUsers className={styles.icon} />
          {job.applicants} {job.applicants === 1 ? 'applicant' : 'applicants'}
        </span>
        <span className={styles.statItem}>
          <FiClock className={styles.icon} />
          {job.posted}
        </span>
      </div>

      {job.requirements && job.requirements.length > 0 && (
        <div className={styles.requirements}>
          {job.requirements.slice(0, 3).map((req, idx) => (
            <span key={idx} className={styles.requirementTag}>
              {req}
            </span>
          ))}
          {job.requirements.length > 3 && (
            <span className={styles.moreTag}>
              +{job.requirements.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className={styles.jobActions}>
        <div className={styles.actionGroup}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(job);
            }}
          >
            <FiEye className={styles.icon} />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(job);
            }}
          >
            <FiEdit2 className={styles.icon} />
            Edit
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(job.id);
          }}
        >
          <FiTrash2 className={styles.icon} />
          Delete
        </Button>
      </div>
    </div>
  );
};
