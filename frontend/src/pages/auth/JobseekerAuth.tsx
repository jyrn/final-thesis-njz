"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./AuthPage.module.css"
import RoleAgreementModal, { type UserRole } from "../../components/RoleAgreementModal"
import TermsModal from "../../components/TermsModal"
import SuccessModal from '../../components/SuccessModal'
import { FormErrors, JobseekerFormData } from "./shared/authTypes"
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from "./shared/authValidation"
import { loadGoogleOAuthScript, initializeGoogleOAuth, parseJwt, handleGoogleAuthSuccess, handleGoogleSignIn } from "./shared/authUtils"

const JobseekerAuth: React.FC = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showAgreement, setShowAgreement] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [fieldTouched, setFieldTouched] = useState<{ [key: string]: boolean }>({})
  const [realTimeErrors, setRealTimeErrors] = useState<FormErrors>({})
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [formData, setFormData] = useState<JobseekerFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    middleName: "",
  })

  useEffect(() => {
    loadGoogleOAuthScript(() => initializeGoogleOAuth(handleGoogleResponse))
  }, [])

  const handleGoogleResponse = async (response: any) => {
    setIsUploading(true)
    try {
      const userInfo = parseJwt(response.credential)
      const userData = await handleGoogleAuthSuccess(userInfo, "jobseeker")
      setFormData(prev => ({ 
        ...prev, 
        email: userData.email,
        firstName: userData.firstName,
        middleName: userData.middleName,
        lastName: userData.lastName
      }))
      // Removed alert modal - direct navigation instead
    } catch (error) {
      console.error("Google sign-in error:", error)
      setErrors(prev => ({ ...prev, general: "Google authentication failed. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else {
      const emailError = validateEmail(formData.email)
      if (emailError) {
        newErrors.email = emailError
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        newErrors.password = passwordError
      }
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = "First name is required"
      } else {
        const firstNameError = validateName(formData.firstName)
        if (firstNameError) {
          newErrors.firstName = firstNameError
        }
      }

      if (!formData.lastName) {
        newErrors.lastName = "Last name is required"
      } else {
        const lastNameError = validateName(formData.lastName)
        if (lastNameError) {
          newErrors.lastName = lastNameError
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      // Resume is now optional - no validation required

      if (!termsAccepted) {
        newErrors.terms = "You must accept the terms and conditions"
      }

      if (!privacyAccepted) {
        newErrors.privacy = "You must accept the privacy policy"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateField = (fieldName: string, value: string) => {
    const newRealTimeErrors = { ...realTimeErrors }
    
    switch (fieldName) {
      case 'email':
        const emailError = validateEmail(value)
        if (emailError) {
          newRealTimeErrors.email = emailError
        } else {
          delete newRealTimeErrors.email
        }
        break
      case 'password':
        const passwordError = validatePassword(value)
        if (passwordError) {
          newRealTimeErrors.password = passwordError
        } else {
          delete newRealTimeErrors.password
        }
        break
      case 'firstName':
        const firstNameError = validateName(value)
        if (firstNameError) {
          newRealTimeErrors.firstName = firstNameError
        } else {
          delete newRealTimeErrors.firstName
        }
        break
      case 'lastName':
        const lastNameError = validateName(value)
        if (lastNameError) {
          newRealTimeErrors.lastName = lastNameError
        } else {
          delete newRealTimeErrors.lastName
        }
        break
      case 'confirmPassword':
        const confirmPasswordError = validateConfirmPassword(formData.password, value)
        if (confirmPasswordError) {
          newRealTimeErrors.confirmPassword = confirmPasswordError
        } else {
          delete newRealTimeErrors.confirmPassword
        }
        break
    }
    
    setRealTimeErrors(newRealTimeErrors)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Clear real-time errors when user starts typing
    if (realTimeErrors[name as keyof FormErrors]) {
      setRealTimeErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Real-time validation while typing
    setFieldTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFieldTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, resume: "Please upload only PDF files." }))
        e.target.value = ""
        return
      }

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrors(prev => ({ ...prev, resume: "Please upload only PDF files." }))
        e.target.value = ""
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resume: "File size must be less than 10MB for optimal OCR processing." }))
        e.target.value = ""
        return
      }

      setResumeFile(file)
      setErrors(prev => ({ ...prev, resume: undefined }))
      setSuccessMessage("Resume uploaded successfully!")
    }
  }

  const handleFileUpload = async () => {
    if (!resumeFile) return

    setIsUploading(true)
    try {
      console.log("Preparing resume for processing:", resumeFile.name)

      const fileReader = new FileReader()
      const fileDataUrl = await new Promise<string>((resolve) => {
        fileReader.onload = () => resolve(fileReader.result as string)
        fileReader.readAsDataURL(resumeFile)
      })

      const resumeUploadData = {
        fileName: resumeFile.name,
        fileSize: resumeFile.size,
        uploadDate: new Date().toISOString(),
        needsProcessing: true,
      }

      localStorage.setItem("pendingResumeUpload", JSON.stringify(resumeUploadData))
      localStorage.setItem("pendingResumeFile", fileDataUrl)

      console.log("Resume stored for processing in dashboard")
      setSuccessMessage("Resume uploaded successfully! It will be processed when you access your dashboard.")
    } catch (error) {
      console.error("Upload preparation failed:", error)
      setErrors(prev => ({ ...prev, general: "Failed to prepare resume for upload. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsUploading(true)
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success modal for login
      setShowSuccessModal(true)
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Login failed. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleLoginSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate("/jobseeker/dashboard")
  }

  const handleBasicRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsUploading(true)
    try {
      // Upload resume if provided (optional)
      if (resumeFile) {
        await handleFileUpload()
      }
      
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success modal
      setShowSuccessModal(true)
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Registration failed. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate("/jobseeker/dashboard")
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
              <h2>Start Your Journey with Us</h2>
              <p>Upload your PDF resume for AI-powered job matching with OCR technology</p>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.roleIndicator}>
              <div className={styles.roleInfo}>
                <div className={styles.roleIcon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className={styles.roleText}>
                  <span className={styles.roleLabel}>Signing up as</span>
                  <span className={styles.roleName}>Job Seeker</span>
                </div>
              </div>
              <button type="button" className={styles.changeRoleButton} onClick={() => window.location.href = "/"}>
                Change Role
              </button>
            </div>

            {errors.general && (
              <div className={styles.errorMessage}>
                <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}



            {isLogin ? (
              <form onSubmit={handleLogin} className={styles.form}>
                <h1 className={styles.formTitle}>Welcome Back</h1>
                <p className={styles.formSubtitle}>Welcome back! Please enter your details.</p>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.email ? styles.error : ""}`}
                      placeholder="Enter your email"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.emailIcon}`}>📧</span>
                  </div>
                  {(errors.email || realTimeErrors.email) && (
                    <div className={styles.inputError}>
                      {errors.email || realTimeErrors.email}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${styles.hasEyeButton} ${errors.password ? styles.error : ""}`}
                      placeholder="Enter your password"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.passwordIcon}`}>🔒</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.eyeButton}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {(errors.password || realTimeErrors.password) && (
                    <div className={styles.inputError}>
                      {errors.password || realTimeErrors.password}
                    </div>
                  )}
                </div>

                <button type="submit" className={styles.primaryButton} disabled={isUploading}>
                  {isUploading ? "Signing In..." : "Sign In"}
                </button>

                <button type="button" onClick={() => handleGoogleSignIn("jobseeker", true)} className={styles.googleButton}>
                  Sign in with Google
                </button>

                <div className={styles.authToggle}>
                  <span>Don't have an account? </span>
                  <button type="button" onClick={() => setIsLogin(false)} className={styles.toggleLink}>
                    Sign up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBasicRegistration} className={styles.form}>
                <h1 className={styles.formTitle}>Get Started Now</h1>
                <p className={styles.formSubtitle}>
                  Upload your PDF resume and let our OCR technology extract your skills for personalized job matching.
                </p>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Last Name</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.lastName ? styles.error : ""}`}
                      placeholder="Enter your last name"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.nameIcon}`}>👤</span>
                  </div>
                  {(errors.lastName || realTimeErrors.lastName) && (
                    <div className={styles.inputError}>
                      {errors.lastName || realTimeErrors.lastName}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>First Name</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.firstName ? styles.error : ""}`}
                      placeholder="Enter your first name"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.nameIcon}`}>👤</span>
                  </div>
                  {(errors.firstName || realTimeErrors.firstName) && (
                    <div className={styles.inputError}>
                      {errors.firstName || realTimeErrors.firstName}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Middle Name</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.middleName ? styles.error : ""}`}
                      placeholder="Enter your middle name (optional)"
                    />
                    <span className={`${styles.inputIcon} ${styles.nameIcon}`}>👤</span>
                  </div>
                  {(errors.middleName || realTimeErrors.middleName) && (
                    <div className={styles.inputError}>
                      {errors.middleName || realTimeErrors.middleName}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${errors.email ? styles.error : ""}`}
                      placeholder="Enter your email"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.emailIcon}`}>📧</span>
                  </div>
                  {(errors.email || realTimeErrors.email) && (
                    <div className={styles.inputError}>
                      {errors.email || realTimeErrors.email}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${styles.hasEyeButton} ${errors.password ? styles.error : ""}`}
                      placeholder="Enter your password"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.passwordIcon}`}>🔒</span>
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {(errors.password || realTimeErrors.password) && (
                    <div className={styles.inputError}>
                      {errors.password || realTimeErrors.password}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className={`${styles.input} ${styles.hasIcon} ${styles.hasEyeButton} ${errors.confirmPassword ? styles.error : ""}`}
                      placeholder="Confirm your password"
                      required
                    />
                    <span className={`${styles.inputIcon} ${styles.passwordIcon}`}>🔒</span>
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {(errors.confirmPassword || realTimeErrors.confirmPassword) && (
                    <div className={styles.inputError}>
                      {errors.confirmPassword || realTimeErrors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Upload Resume (PDF Only) - Optional</label>
                  <p className={styles.documentDescription}>
                    Optionally upload your PDF resume for OCR processing and AI-powered job matching. You can skip this step and add your resume later in your dashboard.
                  </p>
                  <label className={styles.uploadLabel}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <div className={`${styles.uploadArea} ${resumeFile ? styles.success : ""} ${errors.resume ? styles.error : ""}`}>
                      <div className={styles.uploadIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                        </svg>
                      </div>
                      <div className={styles.uploadText}>
                        <span className={styles.uploadMainText}>
                          {resumeFile ? resumeFile.name : "Choose PDF Resume"}
                        </span>
                        <span className={styles.uploadHint}>PDF files only - OCR will extract your information</span>
                      </div>
                    </div>
                  </label>
                  {errors.resume && <div className={styles.inputError}>{errors.resume}</div>}
                </div>

                <div className={styles.termsSection}>
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <label htmlFor="termsAccepted" className={styles.checkboxLabel}>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className={styles.linkButton}
                      >
                        Terms and Conditions
                      </button>
                    </label>
                  </div>
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="privacyAccepted"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <label htmlFor="privacyAccepted" className={styles.checkboxLabel}>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className={styles.linkButton}
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.primaryButton} 
                  disabled={isUploading}
                >
                  {isUploading && <div className={styles.loadingSpinner}></div>}
                  {isUploading ? "Creating Account..." : "Create Account"}
                </button>

                <button type="button" onClick={() => handleGoogleSignIn("jobseeker", false)} className={styles.googleButton}>
                  Sign up with Google
                </button>

                <div className={styles.authToggle}>
                  <span>Already have an account? </span>
                  <button type="button" onClick={() => setIsLogin(true)} className={styles.toggleLink}>
                    Sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>


      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setTermsAccepted(true)
          setShowTermsModal(false)
        }}
        type="terms"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        title={isLogin ? "Login Successful!" : "Account Created Successfully!"}
        message={isLogin ? "Welcome back to PESO Job Portal! Redirecting to your dashboard..." : "Welcome to PESO Job Portal! Your jobseeker account has been created successfully. You can now access your dashboard and start exploring job opportunities."}
        onClose={isLogin ? handleLoginSuccessModalClose : handleSuccessModalClose}
        buttonText={isLogin ? "Go to Dashboard" : "Go to Dashboard"}
      />

      <TermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {
          setPrivacyAccepted(true)
          setShowPrivacyModal(false)
        }}
        type="privacy"
      />
    </div>
  )
}

export default JobseekerAuth
