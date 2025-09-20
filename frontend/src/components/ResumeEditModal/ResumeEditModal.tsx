import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSave, FiPlus, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiEdit3 } from 'react-icons/fi';
import styles from './ResumeEditModal.module.css';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface Training {
  name: string;
  provider: string;
  date: string;
  location: string;
  duration: string;
  type: 'training' | 'seminar' | 'workshop' | 'certification' | 'course';
  description: string;
}

interface ParsedResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  languages: string[];
  experience: Experience[];
  education: Education[];
  trainings: Training[];
  certifications: string[];
}

interface ResumeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resumeData: ParsedResumeData) => void;
  initialData: ParsedResumeData;
  fileName: string;
}

const ResumeEditModal: React.FC<ResumeEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  fileName
}) => {
  const [resumeData, setResumeData] = useState<ParsedResumeData>(initialData || {
    personalInfo: { name: '', email: '', phone: '', address: '' },
    summary: '',
    skills: [],
    languages: [],
    experience: [],
    education: [],
    trainings: [],
    certifications: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('personal');

  useEffect(() => {
    if (initialData) {
      setResumeData(initialData);
    }
  }, [initialData]);

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleSkillAdd = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleSkillChange = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const handleSkillRemove = (index: number) => {
    const updatedSkills = [...resumeData.skills];
    updatedSkills.splice(index, 1);
    setResumeData({
      ...resumeData,
      skills: updatedSkills
    });
  };

  const handleLanguageAdd = () => {
    if (newLanguage.trim() && !resumeData.languages?.includes(newLanguage.trim())) {
      setResumeData({
        ...resumeData,
        languages: [...(resumeData.languages || []), newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const handleLanguageRemove = (index: number) => {
    const updatedLanguages = [...(resumeData.languages || [])];
    updatedLanguages.splice(index, 1);
    setResumeData({
      ...resumeData,
      languages: updatedLanguages
    });
  };

  const handleExperienceAdd = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', duration: '', description: '' }]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleExperienceRemove = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationAdd = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', year: '' }]
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleEducationRemove = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationAdd = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const handleCertificationChange = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? value : cert)
    }));
  };

  const handleCertificationRemove = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clean up empty entries
      const cleanedData = {
        ...resumeData,
        skills: resumeData.skills.filter(skill => skill.trim() !== ''),
        languages: resumeData.languages?.filter(language => language.trim() !== ''),
        experience: resumeData.experience.filter(exp => 
          exp.company.trim() !== '' || exp.position.trim() !== ''
        ),
        education: resumeData.education.filter(edu => 
          edu.institution.trim() !== '' || edu.degree.trim() !== ''
        ),
        trainings: (resumeData.trainings || []).filter(training => 
          training.name.trim() !== '' || training.provider.trim() !== ''
        ),
        certifications: resumeData.certifications.filter(cert => cert.trim() !== '')
      };
      
      await onSave(cleanedData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrainingAdd = () => {
    setResumeData(prev => ({
      ...prev,
      trainings: [...(prev.trainings || []), { 
        name: '', 
        provider: '', 
        date: '', 
        location: '', 
        duration: '', 
        type: 'training' as const, 
        description: '' 
      }]
    }));
  };

  const handleTrainingChange = (index: number, field: keyof Training, value: string) => {
    setResumeData(prev => ({
      ...prev,
      trainings: (prev.trainings || []).map((training, i) => 
        i === index ? { ...training, [field]: value } : training
      )
    }));
  };

  const handleTrainingRemove = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      trainings: (prev.trainings || []).filter((_, i) => i !== index)
    }));
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'summary', label: 'Summary', icon: FiEdit3 },
    { id: 'skills', label: 'Skills', icon: FiEdit3 },
    { id: 'languages', label: 'Languages', icon: FiEdit3 },
    { id: 'experience', label: 'Experience', icon: FiEdit3 },
    { id: 'education', label: 'Education', icon: FiEdit3 },
    { id: 'trainings', label: 'Trainings & Seminars', icon: FiEdit3 },
    { id: 'certifications', label: 'Certifications', icon: FiEdit3 }
  ];

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>Review & Edit Resume Data</h2>
            <p className={styles.modalSubtitle}>
              Please review the extracted information from <strong>{fileName}</strong> and make any necessary corrections.
            </p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.allSectionsContent}>
            {/* Personal Information Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Personal Information</h3>
              <div className={styles.twoColumnRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <FiUser className={styles.labelIcon} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={resumeData?.personalInfo?.name || ''}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    className={styles.input}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <FiPhone className={styles.labelIcon} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={resumeData?.personalInfo?.phone || ''}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className={styles.input}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FiMail className={styles.labelIcon} />
                  Email Addresses
                </label>
                <div className={styles.skillsContainer}>
                  {resumeData?.personalInfo?.email && resumeData.personalInfo.email.split(',').map((email, index) => (
                    <div key={index} className={styles.skillItem}>
                      {email.trim()}
                      <button 
                        type="button" 
                        className={styles.removeButton}
                        onClick={() => {
                          const emails = resumeData.personalInfo.email.split(',').filter((_, i) => i !== index);
                          handlePersonalInfoChange('email', emails.join(','));
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.addItem}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Add an email address"
                    className={styles.textInput}
                  />
                  <button 
                    type="button" 
                    className={styles.addButton}
                    onClick={() => {
                      if (newEmail.trim()) {
                        const currentEmails = resumeData?.personalInfo?.email ? resumeData.personalInfo.email.split(',') : [];
                        currentEmails.push(newEmail.trim());
                        handlePersonalInfoChange('email', currentEmails.join(','));
                        setNewEmail('');
                      }
                    }}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <FiMapPin className={styles.labelIcon} />
                  Address
                </label>
                <input
                  type="text"
                  value={resumeData?.personalInfo?.address || ''}
                  onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                  className={styles.input}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Professional Summary Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Professional Summary</h3>
              <div className={styles.inputGroup}>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Enter a brief professional summary..."
                />
              </div>
            </div>

            {/* Skills and Languages Row */}
            <div className={styles.twoColumnRow}>
              {/* Skills Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Skills</h3>
                <div className={styles.skillsContainer}>
                  {resumeData.skills?.map((skill, index) => (
                    <div key={index} className={styles.skillItem}>
                      {skill}
                      <button 
                        type="button" 
                        className={styles.removeButton}
                        onClick={() => handleSkillRemove(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.addItem}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className={styles.textInput}
                  />
                  <button 
                    type="button" 
                    className={styles.addButton}
                    onClick={handleSkillAdd}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Languages Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Languages</h3>
                <div className={styles.skillsContainer}>
                  {resumeData.languages?.map((language, index) => (
                    <div key={index} className={styles.skillItem}>
                      {language}
                      <button 
                        type="button" 
                        className={styles.removeButton}
                        onClick={() => handleLanguageRemove(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.addItem}>
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language"
                    className={styles.textInput}
                  />
                  <button 
                    type="button" 
                    className={styles.addButton}
                    onClick={handleLanguageAdd}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Work Experience</h3>
                <button onClick={handleExperienceAdd} className={styles.addButton}>
                  <FiPlus /> Add Experience
                </button>
              </div>
              <div className={styles.compactList}>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className={styles.compactItem}>
                    <div className={styles.compactHeader}>
                      <h4>Experience {index + 1}</h4>
                      <button
                        onClick={() => handleExperienceRemove(index)}
                        className={styles.removeButton}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className={styles.compactForm}>
                      <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            className={styles.input}
                            placeholder="Company name"
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            className={styles.input}
                            placeholder="Job title/position"
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Duration</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                            className={styles.input}
                            placeholder="e.g., Jan 2020 - Dec 2022"
                          />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Job Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          className={styles.compactTextarea}
                          rows={2}
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education and Certifications Row */}
            <div className={styles.twoColumnRow}>
              {/* Education Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Education</h3>
                  <button onClick={handleEducationAdd} className={styles.addButton}>
                    <FiPlus />
                  </button>
                </div>
                <div className={styles.compactList}>
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className={styles.compactItem}>
                      <div className={styles.compactHeader}>
                        <h4>Education {index + 1}</h4>
                        <button
                          onClick={() => handleEducationRemove(index)}
                          className={styles.removeButton}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <div className={styles.compactForm}>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          className={styles.input}
                          placeholder="Institution name"
                        />
                        <div className={styles.formRow}>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className={styles.input}
                            placeholder="Degree/Program"
                          />
                          <input
                            type="text"
                            value={edu.year}
                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                            className={styles.input}
                            placeholder="Year"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Section */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Certifications</h3>
                  <button onClick={handleCertificationAdd} className={styles.addButton}>
                    <FiPlus />
                  </button>
                </div>
                <div className={styles.compactList}>
                  {resumeData.certifications.length > 0 ? (
                    resumeData.certifications.map((cert, index) => (
                      <div key={index} className={styles.compactCertItem}>
                        <input
                          type="text"
                          value={cert}
                          onChange={(e) => handleCertificationChange(index, e.target.value)}
                          className={styles.input}
                          placeholder="Certification name"
                        />
                        <button
                          onClick={() => handleCertificationRemove(index)}
                          className={styles.removeButton}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <p>No certifications found. Click the + button to add certifications.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trainings Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Trainings & Seminars</h3>
                <button onClick={handleTrainingAdd} className={styles.addButton}>
                  <FiPlus /> Add Training
                </button>
              </div>
              <div className={styles.compactList}>
                {(resumeData.trainings && resumeData.trainings.length > 0) ? (
                  resumeData.trainings.map((training, index) => (
                    <div key={index} className={styles.compactItem}>
                      <div className={styles.compactHeader}>
                        <h4>Training {index + 1}</h4>
                        <button
                          onClick={() => handleTrainingRemove(index)}
                          className={styles.removeButton}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <div className={styles.compactForm}>
                        <div className={styles.formRow}>
                          <input
                            type="text"
                            value={training.name}
                            onChange={(e) => handleTrainingChange(index, 'name', e.target.value)}
                            className={styles.input}
                            placeholder="Training name"
                          />
                          <input
                            type="text"
                            value={training.provider}
                            onChange={(e) => handleTrainingChange(index, 'provider', e.target.value)}
                            className={styles.input}
                            placeholder="Provider"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No trainings found. Click the "Add Training" button to add one.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.saveButton} disabled={isSaving}>
            <FiSave className={styles.buttonIcon} />
            {isSaving ? 'Saving...' : 'Save Resume Data'}
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export default ResumeEditModal;
