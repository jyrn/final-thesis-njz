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

  // Debug effect to watch modal state changes
  useEffect(() => {
    console.log('🔄 Modal state changed:', {
      showEditModal,
      parsedDataExists: !!parsedData,
      parsedDataName: parsedData?.personalInfo?.name
    });
  }, [showEditModal, parsedData]);

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

      console.log('📤 Making request to /api/jobseekers/upload-resume');
      console.log('🚀 Starting resume upload...');
      const response = await fetch('/api/jobseekers/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
        body: formData,
      });

      console.log('📡 Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('📡 Upload response result:', result);
      
      if (result.success) {
        setCurrentResumeId(result.data.resumeId);
        setUploadProgress(100);
        setProcessingStatus('completed');
        setStatusMessage('Resume uploaded and parsed successfully!');
        
        // Handle parsed data from enhanced parser
        console.log('📄 Full backend response:', result);
        console.log('📄 Backend response keys:', Object.keys(result.data || {}));
        console.log('📄 Has parsedData?', !!result.data.parsedData);
        
        if (result.data.parsedData) {
          console.log('📄 Parsed data from enhanced parser:', result.data.parsedData);
          console.log('📄 Parsed data keys:', Object.keys(result.data.parsedData));
          console.log('📄 Certifications in parsedData:', result.data.parsedData.certifications);
          console.log('📄 Trainings in parsedData:', result.data.parsedData.trainings);
          
          try {
            // Transform enhanced parser data to match our interface
            const enhancedParsedData = result.data.parsedData;
            
            // Handle both old format (name, email, phone) and new format (personalInfo)
            const personalInfo = enhancedParsedData.personalInfo || {
              name: enhancedParsedData.name || '',
              email: enhancedParsedData.email || '',
              phone: enhancedParsedData.phone || '',
              address: enhancedParsedData.address || ''
            };
            
            const transformedData: ParsedResumeData = {
              personalInfo: {
                name: personalInfo.name || '',
                email: personalInfo.email || '',
                phone: personalInfo.phone || '',
                address: personalInfo.address || ''
              },
              summary: '',
              skills: enhancedParsedData.skills || [],
              languages: enhancedParsedData.languages || [],
              experience: (enhancedParsedData.experience || []).map((exp: any) => ({
                company: exp.company || '',
                position: exp.position || '',
                duration: exp.duration || '',
                description: exp.description || ''
              })),
              education: (enhancedParsedData.education || []).map((edu: any) => ({
                institution: edu.institution || '',
                degree: edu.degree || '',
                year: edu.year || ''
              })),
              trainings: enhancedParsedData.trainings || [],
              certifications: enhancedParsedData.certifications || []
            };
            
            console.log('✅ Transformed data for modal:', transformedData);
            console.log('🔍 Data check - Name:', transformedData.personalInfo.name);
            console.log('🔍 Data check - Skills count:', transformedData.skills.length);
            console.log('🔍 Data check - Experience count:', transformedData.experience.length);
            console.log('🏆 Data check - Certifications count:', transformedData.certifications.length);
            console.log('🏆 Data check - Certifications:', transformedData.certifications);
            console.log('🏆 Raw backend certifications:', enhancedParsedData.certifications);
            
            setParsedData(transformedData);
            console.log('🎯 Setting showEditModal to true');
            setShowEditModal(true);
            
            // Force a re-render to ensure modal shows
            setTimeout(() => {
              console.log('🔄 Modal state after timeout - showEditModal:', showEditModal);
              console.log('🔄 Modal state after timeout - parsedData exists:', !!parsedData);
              console.log('🔄 Current transformed data:', transformedData);
            }, 100);
            
            // Additional debugging
            console.log('🔍 State before modal:', {
              showEditModal: showEditModal,
              parsedDataExists: !!parsedData,
              transformedDataExists: !!transformedData
            });
            
          } catch (parseError) {
            console.error('❌ Error transforming parsed data:', parseError);
            throw new Error('Failed to transform parsed data: ' + (parseError instanceof Error ? parseError.message : 'Unknown error'));
          }
        } else {
          console.log('❌ No parsedData in response, checking for other data formats...');
          console.log('📊 Available data keys:', Object.keys(result.data || {}));
          throw new Error('No data could be parsed from the resume');
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
      
      {/* Debug modal state */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', top: '100px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
          <div>showEditModal: {showEditModal.toString()}</div>
          <div>parsedData exists: {parsedData ? 'YES' : 'NO'}</div>
          <div>parsedData name: {parsedData?.personalInfo?.name || 'none'}</div>
          <div>parsedData skills: {parsedData?.skills?.length || 0}</div>
          <button 
            onClick={() => {
              console.log('🧪 Test button clicked - forcing modal open');
              setShowEditModal(true);
              setParsedData({
                personalInfo: { name: 'Test User', email: 'test@test.com', phone: '+63 9171234567', address: 'Test Address' },
                summary: '',
                skills: ['JavaScript', 'React', 'Node.js'],
                languages: ['English', 'Filipino'],
                experience: [{
                  company: 'Test Company',
                  position: 'Software Developer',
                  duration: '2020-Present',
                  description: 'Test description'
                }],
                education: [{
                  institution: 'Test University',
                  degree: 'BS Computer Science',
                  year: '2020'
                }],
                trainings: [],
                certifications: ['Test Certification']
              });
            }}
            style={{ marginTop: '10px', padding: '5px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Test Modal
          </button>
        </div>
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
