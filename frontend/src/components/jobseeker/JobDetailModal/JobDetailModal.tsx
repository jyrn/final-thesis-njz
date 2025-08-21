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
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
            </p>
            <button className={styles.readMoreButton}>Read more</button>
          </div>

          <div className={styles.requirements}>
            <h3>Requirements</h3>
            <ul>
              <li>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</li>
              <li>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</li>
              <li>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.</li>
              <li>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</li>
            </ul>
          </div>

          <div className={styles.location}>
            <h3>Location</h3>
            <div className={styles.locationInfo}>
              <FiMapPin className={styles.locationIcon} />
              <span>Overlook Avenue, Belleville, NJ, USA</span>
            </div>
            <div className={styles.mapPlaceholder}>
              {/* Map would go here */}
              <div className={styles.mapPin}>📍</div>
            </div>
          </div>

          <div className={styles.information}>
            <h3>Informations</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Position</span>
                <span className={styles.infoValue}>Senior Designer</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Qualification</span>
                <span className={styles.infoValue}>Bachelor's Degree</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Experience</span>
                <span className={styles.infoValue}>3 Years</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Job Type</span>
                <span className={styles.infoValue}>Full Time</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Specialisation</span>
                <span className={styles.infoValue}>Design</span>
              </div>
            </div>
          </div>

          <div className={styles.facilities}>
            <h3>Facilities and Others</h3>
            <div className={styles.facilitiesList}>
              <span className={styles.facilityTag}>Medical</span>
              <span className={styles.facilityTag}>Dental</span>
              <span className={styles.facilityTag}>Technical Certification</span>
              <span className={styles.facilityTag}>Meal Allowance</span>
              <span className={styles.facilityTag}>Transport Allowance</span>
              <span className={styles.facilityTag}>Regular Hours</span>
              <span className={styles.facilityTag}>Mondays-Fridays</span>
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
