import React, { useState, useEffect } from 'react';
import { Job } from '@/types/Job';
import { FiX, FiPlus, FiMinus, FiBriefcase } from 'react-icons/fi';
import Button from '../ui/Button';
import styles from './JobFormModal.module.css';

interface JobFormModalProps {
  job?: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Partial<Job>) => void;
  isEditing?: boolean;
}

const defaultJobData = {
  title: '',
  location: '',
  type: 'Full-time',
  salaryMin: '',
  salaryMax: '',
  description: '',
  requirements: [''],
  responsibilities: [''],
  benefits: [''],
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
  const [formData, setFormData] = useState(() => {
    if (isEditing && job) {
      // Parse existing salary range if it exists
      let salaryMin = '';
      let salaryMax = '';
      if (job.salaryMin && job.salaryMax) {
        salaryMin = job.salaryMin.toString();
        salaryMax = job.salaryMax.toString();
      } else if (job.salary) {
        // If only main salary is provided, use it as both min and max
        const salaryValue = job.salary.toString();
        salaryMin = salaryValue;
        salaryMax = salaryValue;
      }
      
      return {
        title: job.title || '',
        location: job.location || '',
        type: job.type || 'Full-time',
        salaryMin,
        salaryMax,
        description: job.description || '',
        requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
        responsibilities: job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [''],
        benefits: job.benefits && job.benefits.length > 0 ? job.benefits : [''],
        department: job.department || 'Engineering',
        remote: job.remote || false,
        status: job.status || 'active'
      };
    }
    return defaultJobData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(defaultJobData);
      setErrors({});
    }
  }, [isOpen]);

  // Load job data when editing
  useEffect(() => {
    if (isOpen && isEditing && job) {
      console.log('Loading job data for editing:', job);
      
      // Parse existing salary range if it exists
      let salaryMin = '';
      let salaryMax = '';
      if (job.salaryMin && job.salaryMax) {
        salaryMin = job.salaryMin.toString();
        salaryMax = job.salaryMax.toString();
      } else if (job.salary) {
        // If only main salary is provided, use it as both min and max
        const salaryValue = job.salary.toString();
        salaryMin = salaryValue;
        salaryMax = salaryValue;
      }
      
      // Use setTimeout to ensure the form is ready
      setTimeout(() => {
        const newFormData = {
          title: job.title || '',
          location: job.location || '',
          type: job.type || 'Full-time',
          salaryMin,
          salaryMax,
          description: job.description || '',
          requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
          responsibilities: job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [''],
          benefits: job.benefits && job.benefits.length > 0 ? job.benefits : [''],
          department: job.department || 'Engineering',
          remote: job.remote || false,
          status: job.status || 'active'
        };
        
        console.log('Setting form data:', newFormData);
        setFormData(newFormData);
      }, 100);
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

  const handleResponsibilityChange = (index: number, value: string) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[index] = value;
    setFormData(prev => ({ ...prev, responsibilities: newResponsibilities }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, requirements: newRequirements }));
    }
  };

  const removeResponsibility = (index: number) => {
    if (formData.responsibilities.length > 1) {
      const newResponsibilities = formData.responsibilities.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, responsibilities: newResponsibilities }));
    }
  };

  const removeBenefit = (index: number) => {
    if (formData.benefits.length > 1) {
      const newBenefits = formData.benefits.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, benefits: newBenefits }));
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
    const filteredResponsibilities = formData.responsibilities.filter(resp => resp.trim());
    const filteredBenefits = formData.benefits.filter(ben => ben.trim());
    
    // Calculate average salary as a number
    const salary = formData.salaryMin && formData.salaryMax 
      ? Math.round((parseInt(formData.salaryMin) + parseInt(formData.salaryMax)) / 2)
      : undefined;
    
    const jobData: Partial<Job> = {
      title: formData.title,
      location: formData.location,
      type: formData.type,
      description: formData.description,
      department: formData.department,
      remote: formData.remote,
      status: formData.status,
      salary,
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      requirements: filteredRequirements,
      responsibilities: filteredResponsibilities,
      benefits: filteredBenefits,
      ...(isEditing && job ? { id: job.id } : {})
    };

    onSave(jobData);
  };

  if (!isOpen) return null;

  // Debug log to check if job data is being passed correctly
  console.log('JobFormModal - isEditing:', isEditing, 'job:', job, 'formData:', formData);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.jobIcon}>
              <FiBriefcase size={32} />
            </div>
            <div className={styles.headerText}>
              <h2 className={styles.title}>
                {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
              </h2>
              <p className={styles.subtitle}>
                {isEditing ? 'Update job details and requirements' : 'Fill in the details to create a new job posting'}
              </p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
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
                Salary Range
              </label>
              <div className={styles.salaryRange}>
                <div className={styles.salaryInput}>
                  <span className={styles.currencySymbol}>₱</span>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                    className={`${styles.input} ${errors.salaryMin ? styles.inputError : ''}`}
                    placeholder="Min salary"
                  />
                </div>
                <span className={styles.salaryDivider}>to</span>
                <div className={styles.salaryInput}>
                  <span className={styles.currencySymbol}>₱</span>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                    className={`${styles.input} ${errors.salaryMax ? styles.inputError : ''}`}
                    placeholder="Max salary"
                  />
                </div>
              </div>
              {(errors.salaryMin || errors.salaryMax) && (
                <span className={styles.errorText}>
                  {errors.salaryMin || errors.salaryMax}
                </span>
              )}
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
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Job Description</h3>
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
                  readOnly={false}
                  disabled={false}
                  autoComplete="off"
                />
                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Requirements & Responsibilities</h3>
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

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Key Responsibilities
                </label>
                {formData.responsibilities.map((responsibility, index) => (
                  <div key={index} className={styles.requirementRow}>
                    <input
                      type="text"
                      className={styles.input}
                      value={responsibility}
                      onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                      placeholder="e.g. Design and develop user interfaces"
                    />
                    {formData.responsibilities.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeResponsibility(index)}
                      >
                        <FiMinus />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addResponsibility}
                >
                  <FiPlus /> Add Responsibility
                </button>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  What We Offer
                </label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className={styles.requirementRow}>
                    <input
                      type="text"
                      className={styles.input}
                      value={benefit}
                      onChange={(e) => handleBenefitChange(index, e.target.value)}
                      placeholder="e.g. Competitive salary package"
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeBenefit(index)}
                      >
                        <FiMinus />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addBenefit}
                >
                  <FiPlus /> Add Benefit
                </button>
              </div>
            </div>
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
