import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../pages/jobseeker/Dashboard.module.css';

interface ResumeUploadPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

const ResumeUploadPrompt: React.FC<ResumeUploadPromptProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setIsLoading(true);
      await onUpload(file);
      onClose();
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        
        <h2>Upload Your Resume</h2>
        <p className={styles.modalDescription}>
          Your resume helps us match you with the best job opportunities. 
          Upload it now to get started with personalized job recommendations.
        </p>
        
        <form onSubmit={handleSubmit} className={styles.uploadForm}>
          <div 
            className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resume-upload')?.click()}
          >
            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <div className={styles.uploadIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p className={styles.uploadText}>
              {file ? file.name : 'Drag & drop your resume here or click to browse'}
            </p>
            <p className={styles.uploadHint}>(PDF files only, max 5MB)</p>
          </div>
          
          {error && <p className={styles.errorText}>{error}</p>}
          
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/jobseeker/profile');
              }}
              className={styles.secondaryButton}
              disabled={isLoading}
            >
              Skip for Now
            </button>
            <button 
              type="submit" 
              className={styles.primaryButton}
              disabled={!file || isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeUploadPrompt;
