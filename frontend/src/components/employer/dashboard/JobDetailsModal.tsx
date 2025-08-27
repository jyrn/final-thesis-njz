import React from 'react';
import { 
  FiX, 
  FiMapPin, 
  FiBriefcase, 
  FiCalendar, 
  FiUsers, 
  FiClock, 
  FiTag,
  FiEdit2,
  FiTrash2,
  FiDollarSign
} from 'react-icons/fi';
import { JobPosting } from '@/types/dashboard';
import styles from './JobDetailsModal.module.css';

interface JobDetailsModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: JobPosting) => void;
  onDelete: (job: JobPosting) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'paused':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'closed':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.jobInfo}>
            <div className={styles.jobIcon}>
              <FiBriefcase size={36} />
            </div>
            <div className={styles.jobDetails}>
              <h2 className={styles.jobTitle}>{job.title}</h2>
              <p className={styles.jobLocation}>{job.location}</p>
              <div className={styles.jobMeta}>
                <span className={styles.location}>
                  <FiMapPin size={14} />
                  {job.type}
                </span>
                <span 
                  className={styles.statusBadge} 
                  style={getStatusColor(job.status)}
                >
                  {job.status}
                </span>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.metaSection}>
          <div className={styles.metaItem}>
            <FiBriefcase className={styles.metaIcon} />
            <span>{job.department || 'Engineering'}</span>
          </div>
          <div className={styles.metaItem}>
            <FiClock className={styles.metaIcon} />
            <span>{job.type}</span>
          </div>
          <div className={styles.metaItem}>
            <FiTag className={styles.metaIcon} />
            <span>{job.salary}</span>
          </div>
          <div className={styles.metaItem}>
            <FiCalendar className={styles.metaIcon} />
            <span>Posted {formatDate(job.postedDate || job.posted)}</span>
          </div>
          <div className={styles.metaItem}>
            <FiUsers className={styles.metaIcon} />
            <span>{job.applicants} applicants</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Job Description</h3>
          <div className={styles.description}>
            <div className={styles.descriptionContent}>
              <p>
                We are looking for a talented <strong>{job.title}</strong> to join our dynamic team. 
                This is an excellent opportunity to work on exciting projects and grow your career 
                in a collaborative and innovative environment.
              </p>
              <p>
                The successful candidate will be responsible for developing and maintaining 
                high-quality software solutions, collaborating with cross-functional teams, 
                and contributing to our cutting-edge products that serve the Filipino market.
              </p>
              <p>
                Join us in building technology solutions that make a real impact in the Philippines 
                while advancing your professional development in a supportive workplace.
              </p>
            </div>
          </div>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Requirements</h3>
            <div className={styles.requirements}>
              {job.requirements.map((req, index) => (
                <span key={index} className={styles.requirementTag}>
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Key Responsibilities</h3>
          <ul className={styles.responsibilities}>
            <li>Develop and maintain software applications using modern technologies</li>
            <li>Collaborate with designers and product managers to implement features</li>
            <li>Write clean, maintainable, and well-documented code</li>
            <li>Participate in code reviews and contribute to team knowledge sharing</li>
            <li>Stay updated with industry trends and best practices</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>What We Offer</h3>
          <ul className={styles.benefits}>
            <li>Competitive salary package in Philippine Peso (₱)</li>
            <li>Comprehensive health and wellness benefits</li>
            <li>Flexible working arrangements and remote options</li>
            <li>Professional development and training opportunities</li>
            <li>13th month pay and performance bonuses</li>
            <li>Collaborative and inclusive work environment</li>
          </ul>
        </div>

        <div className={styles.modalActions}>
          <button 
            className={styles.editButton}
            onClick={() => onEdit(job)}
          >
            <FiEdit2 />
            Edit Job
          </button>
          <button 
            className={styles.deleteButton}
            onClick={() => onDelete(job)}
          >
            <FiTrash2 />
            Delete Job
          </button>
        </div>
      </div>
    </div>
  );
};
