"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { apiService } from "../../services/api"
import styles from "./RegisterPage.module.css"

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError("") // Clear error when user types
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload only PDF, DOC, or DOCX files.')
        return
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.')
        return
      }
      setResumeFile(file)
      setError("")
    }
  }

  const handleFileUpload = async () => {
    if (!resumeFile) return
    
    setIsUploading(true)
    try {
      const result = await apiService.uploadResume(resumeFile)
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      console.log('Resume uploaded successfully')
      return result.data
    } catch (error) {
      console.error('Upload failed:', error)
      throw new Error('Failed to upload resume. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
  
    if (!resumeFile) {
      setError("Please upload your resume.")
      return
    }
  
    setIsUploading(true)
    try {
      // 1. Create Firebase user account
      const userCredential = await signUp(formData.email, formData.password)
  
      // 2. Wait for Firebase auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))
  
      // 3. Create MongoDB user profile
      const selectedRole = localStorage.getItem('selectedRole') || 'job_seeker'
      const profileResponse = await apiService.createUserProfile({
        fullName: formData.fullName,
        role: selectedRole
      })
      
      if (!profileResponse.success) {
        throw new Error(profileResponse.error || "Failed to create user profile")
      }
  
      // 4. Upload resume
      await handleFileUpload()
  
      // 5. Navigate to dashboard
      navigate(`/${selectedRole}/dashboard`)
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }
  

  const handleGoogleSignUp = async () => {
    setIsUploading(true)
    setError("")
    try {
      await signInWithGoogle()
      const selectedRole = localStorage.getItem('selectedRole') || 'job_seeker'
      navigate(`/${selectedRole}/dashboard`)
    } catch (error: any) {
      console.error('Google sign-up error:', error)
      setError('Google authentication failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <h1 className={styles.logoText}>PESO</h1>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Create an Account</h2>
          <p className={styles.subtitle}>
            Create an account so you can explore all possible jobs!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName" className={styles.label}>Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.passwordContainer}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className={styles.passwordInput}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg className={styles.eyeIcon} fill="currentColor" viewBox="0 0 20 20">
                  {showPassword ? (
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  ) : (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  )}
                  <path fillRule="evenodd" d="M.458 10C1.732 15.057 5.522 18 10 18s8.268-2.943 9.542-8C18.268 4.943 14.478 2 10 2S1.732 4.943.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <div className={styles.passwordContainer}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={styles.passwordInput}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <svg className={styles.eyeIcon} fill="currentColor" viewBox="0 0 20 20">
                  {showConfirmPassword ? (
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  ) : (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  )}
                  <path fillRule="evenodd" d="M.458 10C1.732 15.057 5.522 18 10 18s8.268-2.943 9.542-8C18.268 4.943 14.478 2 10 2S1.732 4.943.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Resume Upload */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Upload Resume</label>
            <div className={styles.uploadContainer}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="resumeUpload"
              />
              <label htmlFor="resumeUpload" className={styles.uploadButton}>
                <div className={styles.uploadIcon}>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className={styles.uploadText}>
                  {resumeFile ? resumeFile.name : 'Click to upload resume'}
                </span>
                <span className={styles.uploadHint}>PDF, DOC, DOCX only</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.registerButton}
            disabled={isUploading}
          >
            {isUploading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
        </form>

        {/* Google Sign Up */}
        <button 
          onClick={handleGoogleSignUp} 
          className={styles.googleButton}
          disabled={isUploading}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isUploading ? 'SIGNING UP...' : 'SIGN UP WITH GOOGLE'}
        </button>

        {/* Sign In Link */}
        <p className={styles.signInText}>
          Already have an account?{' '}
          <Link to="/auth/login" className={styles.signInLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
