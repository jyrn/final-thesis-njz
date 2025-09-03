import React from 'react'
import { FiBookmark, FiMapPin, FiDollarSign, FiClock, FiBriefcase, FiTrendingUp } from 'react-icons/fi'
import styles from './JobCard.module.css'
import { Job } from '../../../types/Job'

interface JobCardProps {
  job: Job
  onSave?: (jobId: number) => void
  onApply?: (jobId: number) => void
  onJobClick?: (job: Job) => void
  isSaved?: boolean
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onSave,
  onApply,
  onJobClick,
  isSaved = false
}) => {
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
  const getCompanyLogo = (company: string) => {
    switch (company.toLowerCase()) {
      case 'google':
        return (
          <div className={`${styles.companyLogo} ${styles.google}`}>
            G
          </div>
        )
      case 'apple':
        return (
          <div className={`${styles.companyLogo} ${styles.apple}`}>
            
          </div>
        )
      default:
        return (
          <div className={styles.companyLogo}>
            {company.charAt(0)}
          </div>
        )
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if clicking on the card itself, not buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    console.log(' JobCard clicked:', job.title);
    onJobClick?.(job);
  };

  return (
    <div 
      className={styles.jobCard}
      onClick={handleCardClick}
    >
      <div className={styles.jobCardHeader}>
        <div className={styles.jobTitleRow}>
          {getCompanyLogo(job.company)}
          <div className={styles.jobInfo}>
            <h4 className={styles.jobTitle}>{job.title}</h4>
            <p className={styles.companyName}>{job.company}</p>
          </div>
          <button 
            className={`${styles.saveJobButton} ${isSaved ? styles.saved : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(Number(job.id));
            }}
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
          >
            <span className={styles.buttonContent}>
              <FiBookmark className={styles.icon} />
            </span>
          </button>
        </div>
        
        <div className={styles.jobDetails}>
          <div className={styles.detailItem}>
            <FiMapPin className={styles.detailIcon} />
            <span>{job.location}</span>
          </div>
          <div className={styles.detailItem}>
            <FiClock className={styles.detailIcon} />
            <span>{job.type}</span>
          </div>
          {job.level && (
            <div className={styles.detailItem}>
              <FiTrendingUp className={styles.detailIcon} />
              <span>{job.level}</span>
            </div>
          )}
          {job.department && (
            <div className={styles.detailItem}>
              <FiBriefcase className={styles.detailIcon} />
              <span>{job.department}</span>
            </div>
          )}
          {(job.salaryMin !== undefined || job.salaryMax !== undefined || job.salary) && (
            <div className={styles.detailItem}>
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
            <div className={styles.detailItem}>
              <span>{job.workplaceType || (job.remote ? 'Remote' : 'On-site')}</span>
            </div>
          )}
        </div>
        
        {job.matchScore && (
          <div className={styles.matchScore}>
            <div className={styles.matchBar} style={{ width: `${job.matchScore}%` }} />
            <span className={styles.matchText}>{job.matchScore}% Match</span>
          </div>
        )}
        
        {job.description && (
          <div className={styles.jobDescription}>
            <p className={styles.descriptionText}>
              {job.description}
            </p>
          </div>
        )}
        
        <div className={styles.jobFooter}>
          <span className={styles.postedDate}>{formatPostedDate()}</span>
          <button 
            className={styles.applyButton}
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(Number(job.id));
            }}
          >
            <span className={styles.buttonContent}>
              <span>Apply Now</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobCard
