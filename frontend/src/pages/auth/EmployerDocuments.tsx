"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./AuthPage.module.css"
import { FormErrors, EmployerDocuments as EmployerDocsType } from "./shared/authTypes"
import SuccessModal from '../../components/SuccessModal'

const EmployerDocuments: React.FC = () => {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [employerDocuments, setEmployerDocuments] = useState<EmployerDocsType>({
    companyProfile: { file: null, uploaded: false },
    businessPermit: { file: null, uploaded: false },
    philjobnetRegistration: { file: null, uploaded: false },
    doleNoPendingCase: { file: null, uploaded: false },
  })

  const handleEmployerDocumentChange = (documentType: keyof EmployerDocsType, file: File | null) => {
    if (file) {
      const allowedTypes = ["application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, documents: "Please upload only PDF files." }))
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, documents: "File size must be less than 10MB." }))
        return
      }
    }

    setEmployerDocuments(prev => ({
      ...prev,
      [documentType]: { file, uploaded: false },
    }))
    setErrors(prev => ({ ...prev, documents: undefined }))
  }

  const handleEmployerVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    const allDocumentsUploaded = Object.values(employerDocuments).every(doc => doc.file !== null)

    if (!allDocumentsUploaded) {
      setErrors(prev => ({ ...prev, documents: "Please upload all required documents." }))
      return
    }

    setIsUploading(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      
      // Add each document to FormData
      Object.entries(employerDocuments).forEach(([key, doc]) => {
        if (doc.file) {
          formData.append(key, doc.file)
        }
      })

      // Get Firebase auth token
      const { auth } = await import('../../config/firebase')
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const token = await user.getIdToken()

      // Upload documents to backend
      const response = await fetch('http://localhost:3001/api/employers/upload-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError)
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        console.error('Upload failed with response:', result)
        throw new Error(result.message || result.error || 'Failed to upload documents')
      }

      console.log("Documents uploaded successfully:", result)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Document upload failed:", error)
      setErrors(prev => ({ 
        ...prev, 
        general: error instanceof Error ? error.message : "Failed to upload documents. Please try again." 
      }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate("/employer/dashboard")
  }

  const renderDocumentUpload = (documentType: keyof EmployerDocsType, label: string, description: string) => {
    const document = employerDocuments[documentType]

    return (
      <div className={styles.inputGroup} key={documentType}>
        <label className={styles.inputLabel}>{label}</label>
        <p className={styles.documentDescription}>{description}</p>
        <label className={styles.uploadLabel}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleEmployerDocumentChange(documentType, e.target.files?.[0] || null)}
            className={styles.fileInput}
          />
          <div className={`${styles.uploadArea} ${document.file ? styles.success : ""} ${errors.documents ? styles.error : ""}`}>
            <div className={styles.uploadIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
            </div>
            <div className={styles.uploadText}>
              <span className={styles.uploadMainText}>
                {document.file ? document.file.name : "Choose PDF Document"}
              </span>
              <span className={styles.uploadHint}>PDF files only - Required for verification</span>
            </div>
          </div>
        </label>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.leftPanel}>
          <div className={styles.visualContent}>
            <div className={styles.logoContainer}>
              <img src="/peso-logo.png" alt="PESO Logo" className={styles.pesoLogo} />
            </div>
            <div className={styles.journeyText}>
              <h2>Verify Your Company</h2>
              <p>Upload required documents to verify your company before posting jobs</p>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.roleIndicator}>
              <div className={styles.roleInfo}>
                <div className={styles.roleIcon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                  </svg>
                </div>
                <div className={styles.roleText}>
                  <span className={styles.roleLabel}>Signing up as</span>
                  <span className={styles.roleName}>Employer</span>
                </div>
              </div>
            </div>

            <h1 className={styles.formTitle}>Verify your Company</h1>
            <p className={styles.formSubtitle}>
              Please upload the required documents before posting jobs. These will be verified by PESO.
            </p>

            {errors.general && (
              <div className={styles.errorMessage}>
                <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}


            <form onSubmit={handleEmployerVerification} className={styles.form}>
              {errors.documents && (
                <div className={styles.errorMessage}>
                  <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.documents}
                </div>
              )}

              {renderDocumentUpload(
                "companyProfile",
                "Upload Company Profile",
                "Company profile document or business registration",
              )}

              {renderDocumentUpload(
                "businessPermit",
                "Upload Business Permit",
                "Valid business permit from local government",
              )}

              {renderDocumentUpload(
                "philjobnetRegistration",
                "Upload PhilJobNet Registration",
                "PhilJobNet registration certificate",
              )}

              {renderDocumentUpload(
                "doleNoPendingCase",
                "Upload DOLE No Pending Case Certificate",
                "Certificate showing no pending labor cases",
              )}

              <button type="submit" className={styles.primaryButton} disabled={isUploading}>
                {isUploading && <div className={styles.loadingSpinner}></div>}
                {isUploading ? "Submitting..." : "Submit"}
              </button>

              <div className={styles.authToggle}>
                <button type="button" onClick={() => navigate("/auth/employer")} className={styles.toggleLink}>
                  Back to Basic Information
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Documents Submitted Successfully!"
        message="Your company documents have been uploaded successfully and are now under review by PESO. You will be notified once verification is complete. You can now access your employer dashboard."
        onClose={handleSuccessModalClose}
        buttonText="Go to Dashboard"
      />
    </div>
  )
}

export default EmployerDocuments
