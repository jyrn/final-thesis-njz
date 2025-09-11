import React, { useState, useCallback, useEffect } from 'react';
import ResumeUpload from './ResumeUpload';
import ResumeEditModal from './ResumeEditModal/ResumeEditModal';
import styles from './ResumeUpload.module.css';
import { parseResumeText } from '../utils/resumeParser';

interface ParsedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  summary: string;
  skills: string[];
  languages: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  trainings: Array<{
    name: string;
    provider: string;
    date: string;
    location: string;
    duration: string;
    type: 'training' | 'seminar' | 'workshop' | 'certification' | 'course';
    description: string;
  }>;
  certifications: string[];
}

interface ResumeUploadWithEditProps {
  onComplete?: (resumeData: ParsedResumeData) => void;
  onError?: (error: string) => void;
  userToken?: string;
  preSelectedFile?: File;
}

const ResumeUploadWithEdit: React.FC<ResumeUploadWithEditProps> = ({
  onComplete,
  onError,
  userToken,
  preSelectedFile
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const pollProcessingStatus = useCallback(async (resumeId: string) => {
    const maxAttempts = 30; // 30 attempts with 2-second intervals = 1 minute max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/resumes/processing-status/${resumeId}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check processing status');
        }

        const result = await response.json();
        
        if (result.success) {
          const { processingStatus, parsedData: resumeParsedData, errorMessage } = result.data;
          
          setProcessingStatus(processingStatus);
          
          if (processingStatus === 'completed' && resumeParsedData) {
            // Transform the data to match our interface
            const transformedData: ParsedResumeData = {
              personalInfo: resumeParsedData.personalInfo || {
                name: '',
                email: '',
                phone: '',
                address: ''
              },
              summary: '',
              skills: resumeParsedData.skills || [],
              languages: resumeParsedData.languages || [],
              experience: resumeParsedData.experience || [],
              education: resumeParsedData.education || [],
              trainings: resumeParsedData.trainings || [],
              certifications: resumeParsedData.certifications || []
            };
            
            setParsedData(transformedData);
            setShowEditModal(true);
            setStatusMessage('Resume parsed successfully! Please review and edit the extracted data.');
            return;
          } else if (processingStatus === 'failed') {
            setProcessingStatus('error');
            setStatusMessage(errorMessage || 'Resume processing failed');
            onError?.(errorMessage || 'Resume processing failed');
            return;
          } else if (processingStatus === 'processing') {
            setStatusMessage('Analyzing resume content with AI...');
            setUploadProgress(Math.min(50 + (attempts * 2), 90));
          }
        }

        attempts++;
        if (attempts < maxAttempts && processingStatus !== 'completed' && processingStatus !== 'failed') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else if (attempts >= maxAttempts) {
          setProcessingStatus('error');
          setStatusMessage('Processing timeout. Please try again.');
          onError?.('Processing timeout. Please try again.');
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setProcessingStatus('error');
        setStatusMessage('Error checking processing status');
        onError?.('Error checking processing status');
      }
    };

    poll();
  }, [userToken, onError]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!userToken) {
      onError?.('Please log in to upload a resume');
      return;
    }

    console.log('🔐 Starting upload with token:', userToken ? 'exists' : 'missing');
    console.log('🔐 Token length:', userToken?.length);
    console.log('🔐 Token preview:', userToken?.substring(0, 50) + '...');

    setIsUploading(true);
    setProcessingStatus('uploading');
    setUploadProgress(0);
    setFileName(file.name);
    setStatusMessage('Uploading resume...');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      console.log('📤 Making request to /api/jobseekers/resume');
      const response = await fetch('/api/jobseekers/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: formData
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setCurrentResumeId(result.data.resumeId);
        setUploadProgress(100);
        setProcessingStatus('completed');
        setStatusMessage('Resume uploaded and text extracted successfully!');
        
        // Parse the extracted text into structured data
        if (result.data.extractedText) {
          console.log('📄 Extracted text:', result.data.extractedText);
          
          try {
            const parsedResumeData = parseResumeText(result.data.extractedText);
            console.log('🔍 Parsed resume data:', parsedResumeData);
            
            // Transform to match our interface
            const transformedData: ParsedResumeData = {
              personalInfo: parsedResumeData.personalInfo,
              summary: parsedResumeData.summary,
              skills: parsedResumeData.skills,
              languages: [], // Will be filled by user in edit modal
              experience: parsedResumeData.experience,
              education: parsedResumeData.education,
              trainings: [], // Will be filled by user in edit modal
              certifications: parsedResumeData.certifications
            };
            
            console.log('✅ Transformed data:', transformedData);
            setParsedData(transformedData);
            console.log('🎯 Setting showEditModal to true');
            setShowEditModal(true);
          } catch (parseError) {
            console.error('❌ Error parsing extracted text:', parseError);
            throw new Error('Failed to parse extracted text: ' + (parseError instanceof Error ? parseError.message : 'Unknown error'));
          }
        } else {
          throw new Error('No text could be extracted from the resume');
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed');
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [userToken, onError, pollProcessingStatus]);

  // Auto-upload preselected file
  useEffect(() => {
    if (preSelectedFile && userToken) {
      handleFileUpload(preSelectedFile);
    }
  }, [preSelectedFile, userToken, handleFileUpload]);

  const handleSaveResumeData = useCallback(async (editedData: ParsedResumeData) => {
    if (!currentResumeId || !userToken) {
      onError?.('Missing resume ID or authentication');
      return;
    }

    try {
      const response = await fetch('/api/jobseekers/resume/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          resumeId: currentResumeId,
          parsedData: editedData 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save resume data');
      }

      const result = await response.json();
      
      if (result.success) {
        setShowEditModal(false);
        setProcessingStatus('completed');
        setStatusMessage('Resume data saved successfully!');
        onComplete?.(editedData);
      } else {
        throw new Error(result.error || 'Failed to save resume data');
      }
    } catch (error) {
      console.error('Save error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to save resume data');
    }
  }, [currentResumeId, userToken, onComplete, onError]);

  const handleCloseModal = useCallback(() => {
    setShowEditModal(false);
    // Reset state for new upload
    setProcessingStatus('idle');
    setUploadProgress(0);
    setParsedData(null);
    setCurrentResumeId(null);
    setFileName('');
    setStatusMessage('');
  }, []);

  const getUploadStatus = () => {
    switch (processingStatus) {
      case 'uploading':
        return { isUploading: true, progress: uploadProgress };
      case 'processing':
        return { isUploading: true, progress: uploadProgress };
      default:
        return { isUploading: false, progress: 0 };
    }
  };

  const { isUploading: showUploading, progress } = getUploadStatus();

  return (
    <div className={styles.uploadContainer}>
      {!preSelectedFile && (
        <ResumeUpload
          onUpload={handleFileUpload}
          isUploading={showUploading}
          uploadProgress={progress}
        />
      )}
      
      {preSelectedFile && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingModal}>
            <h3>Processing Resume</h3>
            <div className={styles.processingStatus}>
              {processingStatus === 'uploading' && <p>Uploading resume...</p>}
              {processingStatus === 'processing' && <p>AI is analyzing your resume...</p>}
              {processingStatus === 'error' && <p className={styles.error}>Error: {statusMessage}</p>}
            </div>
            {(processingStatus === 'uploading' || processingStatus === 'processing') && (
              <div className={styles.spinner}></div>
            )}
          </div>
        </div>
      )}
      
      {statusMessage && !preSelectedFile && (
        <div className={`${styles.statusMessage} ${processingStatus === 'error' ? styles.error : styles.success}`}>
          {statusMessage}
        </div>
      )}

      {showEditModal && parsedData && (
        <ResumeEditModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          onSave={handleSaveResumeData}
          initialData={parsedData}
          fileName={fileName}
        />
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
          <div>showEditModal: {showEditModal.toString()}</div>
          <div>parsedData: {parsedData ? 'exists' : 'null'}</div>
          <div>processingStatus: {processingStatus}</div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadWithEdit;
