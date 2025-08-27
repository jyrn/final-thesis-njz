import React, { useState, useEffect } from 'react';
import { JobPosting } from '@/types/dashboard';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import Button from '../ui/Button';
import styles from './JobFormModal.module.css';

interface JobFormModalProps {
  job?: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Partial<JobPosting>) => void;
  isEditing?: boolean;
}

const defaultJobData = {
  title: '',
  location: '',
  type: 'Full-time',
  salary: '',
  description: '',
  requirements: [''],
  department: 'Engineering',
  remote: false,
  status: 'active'
};

export const JobFormModal: React.FC<JobFormModalProps> = ({
  job,
  isOpen,
  onClose,
  onSave,
  isEditing = false
}) => {
  const [formData, setFormData] = useState(defaultJobData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (isEditing && job) {
        setFormData({
          title: job.title || '',
          location: job.location || '',
          type: job.type || 'Full-time',
          salary: job.salary || '',
          description: job.description || '',
          requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
          department: job.department || 'Engineering',
          remote: job.remote || false,
          status: job.status || 'active'
        });
      } else {
        setFormData(defaultJobData);
      }
      setErrors({});
    }
  }, [isOpen, isEditing, job]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, requirements: newRequirements }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.salary.trim()) {
      newErrors.salary = 'Salary range is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (formData.requirements.every(req => !req.trim())) {
      newErrors.requirements = 'At least one requirement is needed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const filteredRequirements = formData.requirements.filter(req => req.trim());
    
    const jobData: Partial<JobPosting> = {
      ...formData,
      requirements: filteredRequirements,
      ...(isEditing && job ? { id: job.id } : {})
    };

    onSave(jobData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Job Title <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
              />
              {errors.title && <span className={styles.errorText}>{errors.title}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Location <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. Makati City, Metro Manila"
              />
              {errors.location && <span className={styles.errorText}>{errors.location}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Job Type</label>
              <select
                className={styles.select}
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Department</label>
              <select
                className={styles.select}
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Data">Data</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Salary Range <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.salary ? styles.inputError : ''}`}
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="e.g. ₱120,000 - ₱150,000"
              />
              {errors.salary && <span className={styles.errorText}>{errors.salary}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={formData.remote}
                onChange={(e) => handleInputChange('remote', e.target.checked)}
              />
              <span className={styles.checkboxLabel}>Remote work available</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Job Description <span className={styles.required}>*</span>
            </label>
            <textarea
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              rows={6}
            />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Requirements <span className={styles.required}>*</span>
            </label>
            {formData.requirements.map((requirement, index) => (
              <div key={index} className={styles.requirementRow}>
                <input
                  type="text"
                  className={styles.input}
                  value={requirement}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="e.g. React, TypeScript, 3+ years experience"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeRequirement(index)}
                  >
                    <FiMinus />
                  </button>
                )}
              </div>
            ))}
            {errors.requirements && <span className={styles.errorText}>{errors.requirements}</span>}
            <button
              type="button"
              className={styles.addButton}
              onClick={addRequirement}
            >
              <FiPlus /> Add Requirement
            </button>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? 'Update Job' : 'Create Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
