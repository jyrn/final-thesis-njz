import React from 'react'
import { FiArrowLeft, FiMoreHorizontal, FiMapPin } from 'react-icons/fi'
import styles from './JobDetailModal.module.css'

import { Job } from '../../../../src/types/Job';

// Using the shared Job type from types/Job.ts

interface JobDetailModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onApply: (jobId: number) => void
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, isOpen, onClose, onApply }) => {
  if (!isOpen || !job) return null
  
  // Debug logging to check job data
  console.log('JobDetailModal job data:', job)

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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onClose}>
            <FiArrowLeft />
          </button>
          <button className={styles.moreButton}>
            <FiMoreHorizontal />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.jobHeader}>
            {getCompanyLogo(job.company)}
            <div className={styles.jobInfo}>
              <h1 className={styles.jobTitle}>{job.title}</h1>
              <div className={styles.companyInfo}>
                <span className={styles.companyName}>{job.company}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.location}>{job.location}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.postedDate}>{job.postedDate}</span>
              </div>
            </div>
          </div>

          <div className={styles.jobDescription}>
            <h3>Job Description</h3>
            <p>
              {job.description}
            </p>
          </div>

          <div className={styles.requirements}>
            <h3>Requirements</h3>
            <ul>
              {job.requirements?.map((req, index) => (
                <li key={index}>{req}</li>
              )) || (
                <li>No specific requirements listed</li>
              )}
            </ul>
          </div>

          <div className={styles.location}>
            <h3>Location</h3>
            <div className={styles.locationInfo}>
              <FiMapPin className={styles.locationIcon} />
              <span>{job.location}</span>
            </div>
            <div className={styles.mapPlaceholder}>
              {/* Map would go here */}
              <div className={styles.mapPin}>📍</div>
            </div>
          </div>

          <div className={styles.information}>
            <h3>Job Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Position</span>
                <span className={styles.infoValue}>{job.title}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Experience Level</span>
                <span className={styles.infoValue}>{job.level || job.experienceLevel}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Job Type</span>
                <span className={styles.infoValue}>{job.type}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Workplace Type</span>
                <span className={styles.infoValue}>{job.workplaceType || (job.isRemote ? 'Remote' : job.isHybrid ? 'Hybrid' : 'On-site')}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Salary</span>
                <span className={styles.infoValue}>₱{job.salary.toLocaleString('en-PH')}/month</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Posted Date</span>
                <span className={styles.infoValue}>{job.postedDate}</span>
              </div>
            </div>
          </div>

          <div className={styles.facilities}>
            <h3>Benefits & Perks</h3>
            <div className={styles.facilitiesList}>
              <span className={styles.facilityTag}>Health Insurance</span>
              <span className={styles.facilityTag}>Dental Coverage</span>
              <span className={styles.facilityTag}>Professional Development</span>
              <span className={styles.facilityTag}>Flexible Hours</span>
              <span className={styles.facilityTag}>Work from Home</span>
              <span className={styles.facilityTag}>13th Month Pay</span>
              <span className={styles.facilityTag}>Performance Bonus</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.applyButton}
            onClick={() => onApply(job.id)}
          >
            APPLY NOW
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobDetailModal
