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
            {job.level && (
              <span className={styles.jobLevel}>{job.level}</span>
            )}
            {(job.salaryMin && job.salaryMax) ? (
              <span className={styles.jobSalary}>₱{job.salaryMin.toLocaleString('en-PH')} - ₱{job.salaryMax.toLocaleString('en-PH')}</span>
            ) : job.salary ? (
              <span className={styles.jobSalary}>₱{job.salary.toLocaleString('en-PH')}</span>
            ) : null}
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
            onView?.(job);
          }}
        >
          <FiUsers className={styles.icon} />
          {job.applicants || job.applicantCount || 0} {(job.applicants || job.applicantCount || 0) === 1 ? 'applicant' : 'applicants'}
        </span>
        <span className={styles.statItem}>
          <FiClock className={styles.icon} />
          {job.postedDate ? new Date(job.postedDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }) : job.posted ? new Date(job.posted).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }) : 'Recently'}
        </span>
        {job.department && (
          <span className={styles.statItem}>
            {job.department}
          </span>
        )}
        {(job.workplaceType || job.remote) && (
          <span className={styles.statItem}>
            {job.workplaceType || (job.remote ? 'Remote' : 'On-site')}
          </span>
        )}
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
