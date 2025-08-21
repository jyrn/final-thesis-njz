import React from 'react'
import { FiBookmark, FiMapPin, FiDollarSign, FiClock, FiBriefcase } from 'react-icons/fi'
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

  return (
    <div 
      className={styles.jobCard}
      onClick={() => onJobClick?.(job)}
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
              onSave?.(job.id);
            }}
          >
            <FiBookmark />
          </button>
        </div>
        
        <div className={styles.jobDetails}>
          <div className={styles.detailItem}>
            <FiMapPin className={styles.detailIcon} />
            <span>{job.location}</span>
          </div>
          {job.salary ? (
            <div className={`${styles.detailItem} ${styles.salaryItem}`}>
              <span>₱{job.salary}</span>
            </div>
          ) : (
            <div className={styles.detailItem}>
              <span className={styles.noSalary}>Salary not specified</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <FiClock className={styles.detailIcon} />
            <span>{job.type}</span>
          </div>
          <div className={styles.detailItem}>
            <FiBriefcase className={styles.detailIcon} />
            <span>{job.level}</span>
          </div>
        </div>
        
        {job.matchScore && (
          <div className={styles.matchScore}>
            <div className={styles.matchBar} style={{ width: `${job.matchScore}%` }} />
            <span className={styles.matchText}>{job.matchScore}% Match</span>
          </div>
        )}
        
        {job.description && (
          <p className={styles.jobDescription}>
            {job.description.length > 150 
              ? `${job.description.substring(0, 150)}...` 
              : job.description}
          </p>
        )}
        
        <div className={styles.jobFooter}>
          <span className={styles.postedDate}>Posted {job.postedDate}</span>
          <button 
            className={styles.applyButton}
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(job.id);
            }}
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobCard
