import React from 'react';
import { FiX, FiMapPin, FiDollarSign, FiBriefcase, FiAward } from 'react-icons/fi';
import styles from './FilterModal.module.css';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    location: string;
    jobType: string;
    minSalary: string;
    experienceLevel: string;
  }) => void;
  initialFilters: {
    location: string;
    jobType: string;
    minSalary: string;
    experienceLevel: string;
  };
}

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const experienceLevels = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager'];

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, initialFilters }) => {
  const [filters, setFilters] = React.useState({
    location: initialFilters.location || '',
    jobType: initialFilters.jobType || '',
    minSalary: initialFilters.minSalary || '',
    experienceLevel: initialFilters.experienceLevel || ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearAll = () => {
    setFilters({
      location: '',
      jobType: '',
      minSalary: '',
      experienceLevel: ''
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Filter Jobs</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX size={24} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FiMapPin className={styles.filterIcon} />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              placeholder="City, state, or remote"
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FiBriefcase className={styles.filterIcon} />
              Job Type
            </label>
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleInputChange}
              className={styles.filterSelect}
            >
              <option value="">All Job Types</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FiDollarSign className={styles.filterIcon} />
              Minimum Salary (PHP)
            </label>
            <input
              type="number"
              name="minSalary"
              value={filters.minSalary}
              onChange={handleInputChange}
              placeholder="e.g. 30000"
              className={styles.filterInput}
              min="0"
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FiAward className={styles.filterIcon} />
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={filters.experienceLevel}
              onChange={handleInputChange}
              className={styles.filterSelect}
            >
              <option value="">Any Experience Level</option>
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={styles.clearButton}
            onClick={handleClearAll}
          >
            Clear All
          </button>
          <div className={styles.actionButtons}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className={styles.applyButton} 
              onClick={handleApply}
            >
              Show Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
