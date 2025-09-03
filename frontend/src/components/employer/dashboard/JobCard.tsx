import React from 'react';
import { Job } from '@/types/Job';
import Button from '../ui/Button';
import { FiEye, FiEdit2, FiTrash2, FiUsers, FiClock, FiMapPin, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
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

  const formatPostedDate = () => {
    if (job.postedDate || job.posted) {
      let date;
      if (typeof (job.postedDate || job.posted) === 'string') {
        date = new Date(job.postedDate || job.posted);
      } else {
        date = new Date(job.postedDate || job.posted);
      }
      
      if (isNaN(date.getTime())) {
        return 'Recently posted';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Format full date
      const fullDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Format relative time
      let timeAgo;
      if (diffMinutes < 1) {
        timeAgo = 'Just now';
      } else if (diffMinutes < 60) {
        timeAgo = diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        timeAgo = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        timeAgo = '1 day ago';
      } else if (diffDays < 7) {
        timeAgo = `${diffDays} days ago`;
      } else if (diffDays < 30) {
        timeAgo = `${Math.ceil(diffDays / 7)} weeks ago`;
      } else {
        timeAgo = `${Math.ceil(diffDays / 30)} months ago`;
      }
      
      return `${fullDate} — ${timeAgo}`;
    }
    return 'Recently posted';
  };

  return (
    <div className={styles.jobCard} onClick={handleCardClick}>
      <div className={styles.jobHeader}>
        <div className={styles.jobHeaderContent}>
          <div className={styles.jobTitleSection}>
            <h3 className={styles.jobTitle}>{job.title}</h3>
            <p className={styles.companyName}>{job.company}</p>
          </div>
          <div className={styles.statusSection}>
            <span className={`${styles.statusBadge} ${styles[job.status.toLowerCase()]}`}>
              {job.status}
            </span>
            <span className={styles.postedDate}>{formatPostedDate()}</span>
          </div>
        </div>
        
        <div className={styles.jobMeta}>
          <div className={styles.metaItem}>
            <FiMapPin className={styles.metaIcon} />
            <span>{job.location}</span>
          </div>
          <div className={styles.metaItem}>
            <FiClock className={styles.metaIcon} />
            <span>{job.type}</span>
          </div>
          {job.level && (
            <div className={styles.metaItem}>
              <FiTrendingUp className={styles.metaIcon} />
              <span>{job.level}</span>
            </div>
          )}
          {job.department && (
            <div className={styles.metaItem}>
              <FiBriefcase className={styles.metaIcon} />
              <span>{job.department}</span>
            </div>
          )}
          {(job.salaryMin !== undefined || job.salaryMax !== undefined || job.salary) && (
            <div className={styles.metaItem}>
              <span>₱</span>
              <span>
                {(job.salaryMin !== undefined || job.salaryMax !== undefined) ? (
                  job.salaryMin && job.salaryMax 
                    ? `${job.salaryMin.toLocaleString('en-PH')} - ${job.salaryMax.toLocaleString('en-PH')}`
                    : job.salaryMin 
                      ? `${job.salaryMin.toLocaleString('en-PH')}+`
                      : `Up to ${job.salaryMax?.toLocaleString('en-PH')}`
                ) : job.salary ? (
                  job.salary
                ) : (
                  'Competitive'
                )}
              </span>
            </div>
          )}
          {(job.workplaceType || job.remote) && (
            <div className={styles.metaItem}>
              <span>{job.workplaceType || (job.remote ? 'Remote' : 'On-site')}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Job Description */}
      {job.description && (
        <div className={styles.jobDescription}>
          <p className={styles.descriptionText}>
            {job.description}
          </p>
        </div>
      )}

      <div className={styles.jobActions}>
        <Button 
          variant="ghost" 
          size="sm"
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(job.id);
          }}
        >
          <span className={styles.buttonContent}>
            <FiTrash2 className={styles.icon} />
            <span>Delete</span>
          </span>
        </Button>
        <div className={styles.actionGroup}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(job);
            }}
          >
            <span className={styles.buttonContent}>
              <FiEdit2 className={styles.icon} />
              <span>Edit</span>
            </span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(job);
            }}
          >
            <span className={styles.buttonContent}>
              <FiEye className={styles.icon} />
              <span>View</span>
            </span>
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            className={styles.applicantButton}
            onClick={(e) => {
              e.stopPropagation();
              onView?.(job);
            }}
          >
            <span className={styles.buttonContent}>
              <FiUsers className={styles.icon} />
              <span>{job.applicants || job.applicantCount || 0} {(job.applicants || job.applicantCount || 0) === 1 ? 'applicant' : 'applicants'}</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
