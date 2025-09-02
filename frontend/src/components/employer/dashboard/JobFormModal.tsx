import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  level: 'Mid-level',
  salaryMin: '',
  salaryMax: '',
  description: '',
  requirements: [''],
  responsibilities: [''],
  benefits: [''],
  department: 'Technology',
  workplaceType: 'On-site',
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
        level: job.level || job.experienceLevel || 'Mid-level',
        salaryMin,
        salaryMax,
        description: job.description || '',
        requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
        responsibilities: job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [''],
        benefits: job.benefits && job.benefits.length > 0 ? job.benefits : [''],
        department: job.department || 'Technology',
        workplaceType: job.workplaceType || (job.remote ? 'Remote' : 'On-site'),
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
          level: job.level || job.experienceLevel || 'Mid-level',
          salaryMin,
          salaryMax,
          description: job.description || '',
          requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
          responsibilities: job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [''],
          benefits: job.benefits && job.benefits.length > 0 ? job.benefits : [''],
          department: job.department || 'Technology',
          workplaceType: job.workplaceType || (job.remote ? 'Remote' : 'On-site'),
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
      level: formData.level,
      description: formData.description,
      department: formData.department,
      workplaceType: formData.workplaceType as 'On-site' | 'Hybrid' | 'Remote',
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

  const modalContent = (
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
            {/* Three-Column Layout */}
            <div className={styles.compactSection}>
              <div className={styles.threeColumnGrid}>
                {/* Column 3: Status & Salary */}
                <div className={styles.compactColumn}>
                  <h4 className={styles.compactTitle}>Job Details</h4>
                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>
                      Job Title <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.compactInput} ${errors.title ? styles.inputError : ''}`}
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Senior Frontend Developer"
                    />
                    {errors.title && <span className={styles.errorText}>{errors.title}</span>}
                  </div>

                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>
                      Location <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.compactInput} ${errors.location ? styles.inputError : ''}`}
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g. Makati City, Metro Manila"
                    />
                    {errors.location && <span className={styles.errorText}>{errors.location}</span>}
                  </div>

                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>Department</label>
                    <input
                      type="text"
                      className={styles.compactInput}
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="e.g. Engineering"
                    />
                  </div>

                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>Job Type</label>
                    <select
                      className={styles.compactSelect}
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                {/* Column 2: Employment Info */}
                <div className={styles.compactColumn}>
                  <h4 className={styles.compactTitle}>Employment</h4>
                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>Experience Level</label>
                    <select
                      className={styles.compactSelect}
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior-level">Senior-level</option>
                      <option value="Lead">Lead</option>
                      <option value="Manager">Manager</option>
                      <option value="Director">Director</option>
                    </select>
                  </div>

                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>Workplace Type</label>
                    <select
                      className={styles.compactSelect}
                      value={formData.workplaceType}
                      onChange={(e) => handleInputChange('workplaceType', e.target.value)}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>Status</label>
                    <select
                      className={styles.compactSelect}
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>Salary Range</label>
                    <div className={styles.compactSalaryRange}>
                      <div className={styles.compactSalaryInput}>
                        <span className={styles.currencySymbol}>₱</span>
                        <input
                          type="number"
                          value={formData.salaryMin}
                          onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                          className={`${styles.compactInput} ${errors.salaryMin ? styles.inputError : ''}`}
                          placeholder="Min"
                        />
                      </div>
                      <span className={styles.salaryDivider}>-</span>
                      <div className={styles.compactSalaryInput}>
                        <span className={styles.currencySymbol}>₱</span>
                        <input
                          type="number"
                          value={formData.salaryMax}
                          onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                          className={`${styles.compactInput} ${errors.salaryMax ? styles.inputError : ''}`}
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    {(errors.salaryMin || errors.salaryMax) && (
                      <span className={styles.errorText}>
                        {errors.salaryMin || errors.salaryMax}
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 3: Job Description */}
                <div className={styles.compactColumn}>
                  <h4 className={styles.compactTitle}>Description</h4>
                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>
                      Job Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      className={`${styles.compactTextarea} ${errors.description ? styles.inputError : ''}`}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the role and responsibilities..."
                      rows={8}
                    />
                    {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                  </div>
                </div>

              </div>
            </div>

            {/* Two-Column Layout for Lists */}
            <div className={styles.compactSection}>
              <div className={styles.twoColumnGrid}>
                {/* Left Column - Requirements & Responsibilities */}
                <div className={styles.compactColumn}>
                  <h4 className={styles.compactTitle}>Requirements & Responsibilities</h4>
                  
                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>
                      Requirements <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.compactListContainer}>
                      {formData.requirements.map((requirement, index) => (
                        <div key={index} className={styles.compactRequirementRow}>
                          <input
                            type="text"
                            className={styles.compactInput}
                            value={requirement}
                            onChange={(e) => handleRequirementChange(index, e.target.value)}
                            placeholder="e.g. React, TypeScript, 3+ years"
                          />
                          {formData.requirements.length > 1 && (
                            <button
                              type="button"
                              className={styles.compactRemoveButton}
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
                        className={styles.compactAddButton}
                        onClick={addRequirement}
                      >
                        <FiPlus /> Add
                      </button>
                    </div>
                  </div>

                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>Key Responsibilities</label>
                    <div className={styles.compactListContainer}>
                      {formData.responsibilities.map((responsibility, index) => (
                        <div key={index} className={styles.compactRequirementRow}>
                          <input
                            type="text"
                            className={styles.compactInput}
                            value={responsibility}
                            onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                            placeholder="e.g. Design user interfaces"
                          />
                          {formData.responsibilities.length > 1 && (
                            <button
                              type="button"
                              className={styles.compactRemoveButton}
                              onClick={() => removeResponsibility(index)}
                            >
                              <FiMinus />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className={styles.compactAddButton}
                        onClick={addResponsibility}
                      >
                        <FiPlus /> Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Benefits */}
                <div className={styles.compactColumn}>
                  <h4 className={styles.compactTitle}>What We Offer</h4>
                  <div className={styles.compactGroup}>
                    <label className={styles.compactLabel}>Benefits & Perks</label>
                    <div className={styles.compactListContainer}>
                      {formData.benefits.map((benefit, index) => (
                        <div key={index} className={styles.compactRequirementRow}>
                          <input
                            type="text"
                            className={styles.compactInput}
                            value={benefit}
                            onChange={(e) => handleBenefitChange(index, e.target.value)}
                            placeholder="e.g. Health insurance"
                          />
                          {formData.benefits.length > 1 && (
                            <button
                              type="button"
                              className={styles.compactRemoveButton}
                              onClick={() => removeBenefit(index)}
                            >
                              <FiMinus />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className={styles.compactAddButton}
                        onClick={addBenefit}
                      >
                        <FiPlus /> Add
                      </button>
                    </div>
                  </div>
                </div>
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

  return createPortal(modalContent, document.body);
};
