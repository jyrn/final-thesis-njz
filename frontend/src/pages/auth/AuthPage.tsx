"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./AuthPage.module.css"

interface DocumentUpload {
  file: File | null
  uploaded: boolean
}

interface EmployerDocuments {
  companyProfile: DocumentUpload
  businessPermit: DocumentUpload
  philgeonetRegistration: DocumentUpload
  doleNoPendingCase: DocumentUpload
}

interface FormErrors {
  email?: string
  password?: string
  fullName?: string
  companyName?: string
  confirmPassword?: string
  resume?: string
  documents?: string
  general?: string
}

// Google OAuth configuration
const GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com" // Replace with your actual client ID
const GOOGLE_REDIRECT_URI = window.location.origin + "/auth/google/callback"

const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [registrationStep, setRegistrationStep] = useState(1) // 1: Basic Info, 2: Document Verification
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")

  // Add these state variables after the existing ones
  const [fieldTouched, setFieldTouched] = useState<{ [key: string]: boolean }>({})
  const [realTimeErrors, setRealTimeErrors] = useState<FormErrors>({})

  // Employer document uploads
  const [employerDocuments, setEmployerDocuments] = useState<EmployerDocuments>({
    companyProfile: { file: null, uploaded: false },
    businessPermit: { file: null, uploaded: false },
    philgeonetRegistration: { file: null, uploaded: false },
    doleNoPendingCase: { file: null, uploaded: false },
  })

  useEffect(() => {
    const role = localStorage.getItem("selectedRole") || "jobseeker"
    setSelectedRole(role)

    // Load Google OAuth script
    loadGoogleOAuthScript()

    // Handle Google OAuth callback if present
    handleGoogleCallback()
  }, [])

  // Load Google OAuth script
  const loadGoogleOAuthScript = () => {
    if (document.getElementById("google-oauth-script")) return

    const script = document.createElement("script")
    script.id = "google-oauth-script"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = initializeGoogleOAuth
    document.head.appendChild(script)
  }

  // Initialize Google OAuth
  const initializeGoogleOAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
    }
  }

  // Handle Google OAuth callback from URL
  const handleGoogleCallback = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")

    if (code && state) {
      // Handle OAuth callback
      exchangeCodeForToken(code, state)
    }
  }

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code: string, state: string) => {
    setIsUploading(true)
    try {
      // In a real implementation, this would be done on your backend
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: "your-client-secret", // This should be on backend
          code: code,
          grant_type: "authorization_code",
          redirect_uri: GOOGLE_REDIRECT_URI,
        }),
      })

      const tokenData = await response.json()

      if (tokenData.access_token) {
        // Get user info
        const userResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`,
        )
        const userData = await userResponse.json()

        await handleGoogleAuthSuccess(userData)
      }
    } catch (error) {
      console.error("Google OAuth error:", error)
      setErrors((prev) => ({ ...prev, general: "Google authentication failed. Please try again." }))
    } finally {
      setIsUploading(false)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  // Handle Google OAuth response (for popup flow)
  const handleGoogleResponse = async (response: any) => {
    setIsUploading(true)
    try {
      // Decode the JWT token to get user info
      const userInfo = parseJwt(response.credential)
      await handleGoogleAuthSuccess(userInfo)
    } catch (error) {
      console.error("Google sign-in error:", error)
      setErrors((prev) => ({ ...prev, general: "Google authentication failed. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  // Parse JWT token
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  // Handle successful Google authentication
  const handleGoogleAuthSuccess = async (userInfo: any) => {
    try {
      // Store user information
      const userData = {
        id: userInfo.sub || userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        verified_email: userInfo.email_verified || userInfo.verified_email,
        authProvider: "google",
        loginTime: new Date().toISOString(),
      }

      // Store in localStorage (in production, use secure storage)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("isAuthenticated", "true")

      // Auto-fill form data if in registration mode
      if (!isLogin) {
        setFormData((prev) => ({
          ...prev,
          email: userInfo.email,
          fullName: userInfo.name,
        }))
      }

      setSuccessMessage(`Welcome ${userInfo.name}! Google authentication successful.`)

      // For job seekers in registration mode, still need resume upload
      if (!isLogin && selectedRole === "jobseeker") {
        setSuccessMessage(`Welcome ${userInfo.name}! Please upload your resume to complete registration.`)
        return
      }

      // For employers in registration mode, still need company info
      if (!isLogin && selectedRole === "employer") {
        setSuccessMessage(`Welcome ${userInfo.name}! Please complete your company information.`)
        return
      }

      // For login or completed registration, redirect to dashboard
      setTimeout(() => {
        navigate(`/${selectedRole}/dashboard`)
      }, 2000)
    } catch (error) {
      console.error("Error processing Google auth:", error)
      setErrors((prev) => ({ ...prev, general: "Failed to process Google authentication." }))
    }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errors.general) {
      const timer = setTimeout(() => setErrors((prev) => ({ ...prev, general: undefined })), 5000)
      return () => clearTimeout(timer)
    }
  }, [errors.general])

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters long"
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
    return undefined
  }

  const validateName = (name: string): string | undefined => {
    if (!name) return "Name is required"
    if (name.length < 2) return "Name must be at least 2 characters long"
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces"
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    // Password validation
    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    if (!isLogin) {
      // Name validation for registration
      if (selectedRole === "jobseeker") {
        const nameError = validateName(formData.fullName)
        if (nameError) newErrors.fullName = nameError
      } else {
        const companyError = validateName(formData.companyName)
        if (companyError) newErrors.companyName = companyError
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      // Resume validation for job seekers
      if (selectedRole === "jobseeker" && !resumeFile) {
        newErrors.resume = "Please upload your resume"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Add function to handle field blur
  const handleFieldBlur = (fieldName: string, value: string) => {
    setFieldTouched((prev) => ({ ...prev, [fieldName]: true }))

    // Validate the specific field
    let fieldError: string | undefined

    switch (fieldName) {
      case "email":
        fieldError = validateEmail(value)
        break
      case "password":
        fieldError = validatePassword(value)
        break
      case "fullName":
        fieldError = validateName(value)
        break
      case "companyName":
        fieldError = validateName(value)
        break
      case "confirmPassword":
        if (!value) {
          fieldError = "Please confirm your password"
        } else if (formData.password !== value) {
          fieldError = "Passwords do not match"
        }
        break
    }

    setRealTimeErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError,
    }))
  }

  // Add function to handle real-time input changes
  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear form-level errors for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    // Real-time validation for touched fields
    if (fieldTouched[name]) {
      let fieldError: string | undefined

      switch (name) {
        case "email":
          fieldError = validateEmail(value)
          break
        case "password":
          fieldError = validatePassword(value)
          break
        case "fullName":
          fieldError = validateName(value)
          break
        case "companyName":
          fieldError = validateName(value)
          break
        case "confirmPassword":
          if (!value) {
            fieldError = "Please confirm your password"
          } else if (formData.password !== value) {
            fieldError = "Passwords do not match"
          }
          break
      }

      setRealTimeErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }))
    }
  }

  // Update the existing handleInputChange to use the new function
  const handleInputChange = handleInputChangeWithValidation

  // Function to get the current error for a field (prioritizes real-time errors)
  const getFieldError = (fieldName: string) => {
    return realTimeErrors[fieldName as keyof FormErrors] || errors[fieldName as keyof FormErrors]
  }

  // Function to check if field has error
  const hasFieldError = (fieldName: string) => {
    return !!(realTimeErrors[fieldName as keyof FormErrors] || errors[fieldName as keyof FormErrors])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type - only PDF allowed
      const allowedTypes = ["application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, resume: "Please upload only PDF files." }))
        e.target.value = "" // Clear the input
        return
      }

      // Check file extension
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrors((prev) => ({ ...prev, resume: "Please upload only PDF files." }))
        e.target.value = "" // Clear the input
        return
      }

      // Check file size (10MB limit for OCR processing)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: "File size must be less than 10MB for optimal OCR processing." }))
        e.target.value = "" // Clear the input
        return
      }

      setResumeFile(file)
      setErrors((prev) => ({ ...prev, resume: undefined }))
      setSuccessMessage("Resume uploaded successfully!")
    }
  }

  const handleEmployerDocumentChange = (documentType: keyof EmployerDocuments, file: File | null) => {
    if (file) {
      const allowedTypes = ["application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, documents: "Please upload only PDF files." }))
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, documents: "File size must be less than 10MB." }))
        return
      }
    }

    setEmployerDocuments((prev) => ({
      ...prev,
      [documentType]: { file, uploaded: false },
    }))
    setErrors((prev) => ({ ...prev, documents: undefined }))
  }

  // Modified handleFileUpload to store file for later processing
  const handleFileUpload = async () => {
    if (!resumeFile) return

    setIsUploading(true)
    try {
      console.log("Preparing resume for processing:", resumeFile.name)

      // Convert file to base64 for storage
      const fileReader = new FileReader()
      const fileDataUrl = await new Promise<string>((resolve) => {
        fileReader.onload = () => resolve(fileReader.result as string)
        fileReader.readAsDataURL(resumeFile)
      })

      // Store resume file and metadata for processing in dashboard
      const resumeUploadData = {
        fileName: resumeFile.name,
        fileSize: resumeFile.size,
        uploadDate: new Date().toISOString(),
        needsProcessing: true, // Flag to indicate OCR processing needed
      }

      // Store both the upload metadata and the file data
      localStorage.setItem("pendingResumeUpload", JSON.stringify(resumeUploadData))
      localStorage.setItem("pendingResumeFile", fileDataUrl)

      console.log("Resume stored for processing in dashboard")
      setSuccessMessage("Resume uploaded successfully! It will be processed when you access your dashboard.")
    } catch (error) {
      console.error("Upload preparation failed:", error)
      setErrors((prev) => ({ ...prev, general: "Failed to prepare resume for upload. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsUploading(true)

    // Simulate login process
    setTimeout(() => {
      setIsUploading(false)
      setSuccessMessage("Login successful! Redirecting...")
      setTimeout(() => {
        navigate(`/${selectedRole}/dashboard`)
      }, 1000)
    }, 1500)
  }

  const handleBasicRegistration = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (selectedRole === "employer") {
      // Move to document verification step for employers
      setRegistrationStep(2)
      setSuccessMessage("Basic information saved! Please upload required documents.")
    } else {
      // For job seekers, prepare resume for processing and complete registration
      setIsUploading(true)
      try {
        await handleFileUpload()
        setTimeout(() => {
          setSuccessMessage("Account created successfully! Your resume will be processed in the dashboard.")
          setTimeout(() => {
            navigate(`/${selectedRole}/dashboard`)
          }, 1000)
        }, 1000)
      } catch (error) {
        setErrors((prev) => ({ ...prev, general: "Registration failed. Please try again." }))
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleEmployerVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if all documents are uploaded
    const allDocumentsUploaded = Object.values(employerDocuments).every((doc) => doc.file !== null)

    if (!allDocumentsUploaded) {
      setErrors((prev) => ({ ...prev, documents: "Please upload all required documents." }))
      return
    }

    setIsUploading(true)
    try {
      // Simulate document upload and verification
      console.log("Uploading employer documents...")
      await new Promise((resolve) => setTimeout(resolve, 3000))
      console.log("Documents uploaded successfully")
      setSuccessMessage("Documents uploaded successfully! Your account is pending verification.")
      setTimeout(() => {
        navigate(`/${selectedRole}/dashboard`)
      }, 2000)
    } catch (error) {
      console.error("Document upload failed:", error)
      setErrors((prev) => ({ ...prev, general: "Failed to upload documents. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  // Updated Google sign-in handlers
  const handleGoogleSignIn = () => {
    if (window.google) {
      // Use popup flow
      window.google.accounts.id.prompt()
    } else {
      // Fallback to redirect flow
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `state=${selectedRole}_${isLogin ? "login" : "register"}`

      window.location.href = authUrl
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setRegistrationStep(1) // Reset to step 1 when switching modes
    setErrors({}) // Clear errors
    setSuccessMessage("") // Clear success message
    setFormData({
      email: "",
      password: "",
      fullName: "",
      companyName: "",
      confirmPassword: "",
    })
    setResumeFile(null)
  }

  const renderErrorMessage = (error: string) => (
    <div className={styles.errorMessage}>
      <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {error}
    </div>
  )

  const renderSuccessMessage = (message: string) => (
    <div className={styles.successMessage}>
      <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  )

  const renderDocumentUpload = (documentType: keyof EmployerDocuments, label: string, description: string) => {
    const document = employerDocuments[documentType]

    return (
      <div className={styles.inputGroup} key={documentType}>
        <label className={styles.inputLabel}>{label}</label>
        <p className={styles.documentDescription}>{description}</p>
        <label className={styles.uploadLabel}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleEmployerDocumentChange(documentType, e.target.files?.[0] || null)}
            className={styles.fileInput}
          />
          <div className={`${styles.uploadArea} ${document.file ? styles.success : ""}`}>
            <div className={styles.uploadIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
            </div>
            <div className={styles.uploadText}>
              <span className={styles.uploadMainText}>{document.file ? document.file.name : "Choose File"}</span>
              <span className={styles.uploadHint}>PDF files only</span>
            </div>
          </div>
        </label>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        {/* Left Panel - Visual Background */}
        <div className={styles.leftPanel}>
          <div className={styles.visualContent}>
            {/* PESO Logo */}
            <div className={styles.logoContainer}>
              <img src="/peso-logo.png" alt="Public Employment Service Office Logo" className={styles.pesoLogo} />
            </div>

            {/* Journey Text */}
            <div className={styles.journeyText}>
              <h2>
                {!isLogin && selectedRole === "employer" && registrationStep === 2
                  ? "Verify Your Company"
                  : "Start Your Journey with Us"}
              </h2>
              <p>
                {!isLogin && selectedRole === "employer" && registrationStep === 2
                  ? "Upload required documents to verify your company before posting jobs"
                  : selectedRole === "jobseeker" && !isLogin
                    ? "Upload your PDF resume for AI-powered job matching with OCR technology"
                    : "Connect with opportunities that match your skills and aspirations"}
              </p>
            </div>

            {/* Decorative Elements */}
            <div className={styles.decorativeCircle1}></div>
            <div className={styles.decorativeCircle2}></div>
            <div className={styles.decorativeCircle3}></div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>
                {isLogin
                  ? "Welcome Back"
                  : !isLogin && selectedRole === "employer" && registrationStep === 2
                    ? "Verify your Company"
                    : selectedRole === "employer"
                      ? "Create an Account"
                      : "Get Started Now"}
              </h1>
              <p className={styles.formSubtitle}>
                {isLogin
                  ? "Welcome back! Please enter your details."
                  : !isLogin && selectedRole === "employer" && registrationStep === 2
                    ? "Please upload the required documents before posting jobs. These will be verified by PESO."
                    : selectedRole === "employer"
                      ? "Create an account so you can upload jobs!"
                      : selectedRole === "jobseeker"
                        ? "Upload your PDF resume and let our OCR technology extract your skills for personalized job matching."
                        : "Create your account to get started."}
              </p>
            </div>

            {/* Error and Success Messages */}
            {errors.general && renderErrorMessage(errors.general)}
            {successMessage && renderSuccessMessage(successMessage)}

            {isLogin ? (
              /* Login Form */
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("email", e.target.value)}
                      className={`${styles.input} ${hasFieldError("email") ? styles.error : ""}`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {getFieldError("email") && (
                    <div className={styles.inputError}>
                      <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getFieldError("email")}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("password", e.target.value)}
                      className={`${styles.input} ${hasFieldError("password") ? styles.error : ""}`}
                      placeholder="Enter your password"
                      required
                    />
                    <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        {showPassword ? (
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                        ) : (
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {getFieldError("password") && (
                    <div className={styles.inputError}>
                      <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getFieldError("password")}
                    </div>
                  )}
                </div>

                <div className={styles.formOptions}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="/auth/forgot-password" className={styles.forgotPassword}>
                    Forgot password?
                  </a>
                </div>

                <button type="submit" className={styles.primaryButton} disabled={isUploading}>
                  {isUploading && <div className={styles.loadingSpinner}></div>}
                  {isUploading ? "Signing In..." : "Sign In"}
                </button>

                <div className={styles.socialSeparator}>
                  <span>Or</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className={styles.googleButton}
                  disabled={isUploading}
                >
                  <svg viewBox="0 0 24 24" className={styles.googleIcon}>
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isUploading ? "Connecting..." : "Sign in with Google"}
                </button>

                <div className={styles.authToggle}>
                  <span>Don't have an account? </span>
                  <button type="button" onClick={toggleAuthMode} className={styles.toggleLink}>
                    Sign up
                  </button>
                </div>
              </form>
            ) : selectedRole === "employer" && registrationStep === 2 ? (
              /* Employer Document Verification Form */
              <form onSubmit={handleEmployerVerification} className={styles.form}>
                {errors.documents && renderErrorMessage(errors.documents)}

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
                  "philgeonetRegistration",
                  "Upload Philgeonet Registration",
                  "Philgeonet registration certificate",
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
                  <button type="button" onClick={() => setRegistrationStep(1)} className={styles.toggleLink}>
                    Back to Basic Information
                  </button>
                </div>
              </form>
            ) : (
              /* Registration Form - Step 1 */
              <form onSubmit={handleBasicRegistration} className={styles.form}>
                {selectedRole === "employer" ? (
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Company Name</label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        onBlur={(e) => handleFieldBlur("companyName", e.target.value)}
                        className={`${styles.input} ${hasFieldError("companyName") ? styles.error : ""}`}
                        placeholder="Enter your company name"
                        required
                      />
                    </div>
                    {getFieldError("companyName") && (
                      <div className={styles.inputError}>
                        <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {getFieldError("companyName")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Full Name</label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        onBlur={(e) => handleFieldBlur("fullName", e.target.value)}
                        className={`${styles.input} ${hasFieldError("fullName") ? styles.error : ""}`}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    {getFieldError("fullName") && (
                      <div className={styles.inputError}>
                        <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {getFieldError("fullName")}
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("email", e.target.value)}
                      className={`${styles.input} ${hasFieldError("email") ? styles.error : ""}`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {getFieldError("email") && (
                    <div className={styles.inputError}>
                      <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getFieldError("email")}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("password", e.target.value)}
                      className={`${styles.input} ${hasFieldError("password") ? styles.error : ""}`}
                      placeholder="Enter your password"
                      required
                    />
                    <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        {showPassword ? (
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                        ) : (
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {getFieldError("password") && (
                    <div className={styles.inputError}>
                      <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getFieldError("password")}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur("confirmPassword", e.target.value)}
                      className={`${styles.input} ${hasFieldError("confirmPassword") ? styles.error : ""}`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        {showConfirmPassword ? (
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                        ) : (
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {getFieldError("confirmPassword") && (
                    <div className={styles.inputError}>
                      <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getFieldError("confirmPassword")}
                    </div>
                  )}
                </div>

                {/* Resume Upload for Job Seekers */}
                {selectedRole === "jobseeker" && (
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Upload Resume (PDF Only)</label>
                    <p className={styles.documentDescription}>
                      Upload your PDF resume for OCR processing and AI-powered job matching. Our system will extract
                      your skills, experience, and qualifications automatically.
                    </p>
                    <label className={styles.uploadLabel}>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                      />
                      <div
                        className={`${styles.uploadArea} ${resumeFile ? styles.success : ""} ${errors.resume ? styles.error : ""}`}
                      >
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
                    {errors.resume && (
                      <div className={styles.inputError}>
                        <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.resume}
                      </div>
                    )}
                  </div>
                )}

                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} required />
                  <span>I agree to the terms and conditions</span>
                </label>

                <button type="submit" className={styles.primaryButton} disabled={isUploading}>
                  {isUploading && <div className={styles.loadingSpinner}></div>}
                  {selectedRole === "employer" ? "Continue" : isUploading ? "Creating Account..." : "Sign Up"}
                </button>

                <div className={styles.socialSeparator}>
                  <span>Or</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className={styles.googleButton}
                  disabled={isUploading}
                >
                  <svg viewBox="0 0 24 24" className={styles.googleIcon}>
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isUploading ? "Connecting..." : "Sign up with Google"}
                </button>

                <div className={styles.authToggle}>
                  <span>Already have an account? </span>
                  <button type="button" onClick={toggleAuthMode} className={styles.toggleLink}>
                    Sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Extend the Window interface to include Google OAuth
declare global {
  interface Window {
    google: any
  }
}

export default AuthPage
