import React, { useState } from 'react'
import { FiArrowLeft, FiMapPin, FiX, FiGlobe, FiUsers, FiCalendar, FiHome, FiBriefcase } from 'react-icons/fi'
import styles from './JobDetailModal.module.css'

import { Job } from '../../../types/Job';

// Using the shared Job type from types/Job.ts

interface JobDetailModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onApply: (jobId: number) => void
}

const CompanyModal: React.FC<{ company: Job['companyDetails'] & { name: string }, onClose: () => void }> = ({ company, onClose }) => {
  console.log('CompanyModal company data:', company);
  
  return (
    <div className={styles.companyModalOverlay} onClick={onClose}>
      <div className={styles.companyModalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.companyModalHeader}>
          <h3>About {company.name}</h3>
          <button className={styles.companyCloseButton} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        <div className={styles.companyModalBody}>
          {company.description ? (
            <div className={styles.companySection}>
              <h4>About Us</h4>
              <p>{company.description}</p>
            </div>
          ) : (
            <div className={styles.companySection}>
              <h4>About Us</h4>
              <p>We are {company.name}, a leading company in our industry. More information coming soon.</p>
            </div>
          )}
          
          <div className={styles.companyDetails}>
            {company.industry ? (
              <div className={styles.companyDetailItem}>
                <FiBriefcase className={styles.companyDetailIcon} />
                <span>{company.industry}</span>
              </div>
            ) : (
              <div className={styles.companyDetailItem}>
                <FiBriefcase className={styles.companyDetailIcon} />
                <span>Technology & Services</span>
              </div>
            )}
            
            {company.headquarters ? (
              <div className={styles.companyDetailItem}>
                <FiHome className={styles.companyDetailIcon} />
                <span>{company.headquarters}</span>
              </div>
            ) : (
              <div className={styles.companyDetailItem}>
                <FiHome className={styles.companyDetailIcon} />
                <span>Metro Manila, Philippines</span>
              </div>
            )}
            
            {company.size ? (
              <div className={styles.companyDetailItem}>
                <FiUsers className={styles.companyDetailIcon} />
                <span>{company.size} employees</span>
              </div>
            ) : (
              <div className={styles.companyDetailItem}>
                <FiUsers className={styles.companyDetailIcon} />
                <span>Growing team</span>
              </div>
            )}
            
            {company.founded ? (
              <div className={styles.companyDetailItem}>
                <FiCalendar className={styles.companyDetailIcon} />
                <span>Founded in {company.founded}</span>
              </div>
            ) : (
              <div className={styles.companyDetailItem}>
                <FiCalendar className={styles.companyDetailIcon} />
                <span>Established company</span>
              </div>
            )}
            
            {company.website ? (
              <a 
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.companyWebsiteLink}
              >
                <FiGlobe className={styles.companyDetailIcon} />
                <span>Visit Website</span>
              </a>
            ) : (
              <div className={styles.companyDetailItem}>
                <FiGlobe className={styles.companyDetailIcon} />
                <span>Website coming soon</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, isOpen, onClose, onApply }) => {
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  
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
      {showCompanyModal && (
        <CompanyModal 
          company={{ ...(job.companyDetails || {}), name: job.company }}
          onClose={() => setShowCompanyModal(false)}
        />
      )}
      <div className={styles.modal}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onClose}>
            <FiArrowLeft />
          </button>
          <button 
            className={styles.aboutCompanyButton}
            onClick={() => setShowCompanyModal(true)}
            title="About Company"
          >
            <FiBriefcase size={16} />
            <span>About Company</span>
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
                <span className={styles.infoValue}>
                  {job.salary ? `₱${job.salary.toLocaleString('en-PH')}/month` : 'Salary not specified'}
                </span>
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
