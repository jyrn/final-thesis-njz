"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import styles from "./RegisterPage.module.css"

// Google OAuth configuration
const GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com" // Replace with your actual client ID

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadGoogleOAuthScript()
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

  // Handle Google OAuth response
  const handleGoogleResponse = async (response: any) => {
    setIsUploading(true)
    try {
      const userInfo = parseJwt(response.credential)
      await handleGoogleAuthSuccess(userInfo)
    } catch (error) {
      console.error("Google sign-up error:", error)
      alert("Google authentication failed. Please try again.")
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
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        token: userInfo.sub, // or the credential JWT
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        role: localStorage.getItem("selectedRole") || "jobseeker",
      })

      localStorage.setItem("user", JSON.stringify(res.data.user))
      localStorage.setItem("isAuthenticated", "true")

      // Auto-fill form fields for resume upload
      const [firstName, middleName, ...lastNameParts] = userInfo.name.split(" ")
      const lastName = lastNameParts.join(" ")

      setFormData((prev) => ({
        ...prev,
        email: userInfo.email,
        firstName: firstName || "",
        middleName: middleName || "",
        lastName: lastName || "",
      }))

      alert(`Welcome ${res.data.user.fullname || userInfo.name}! Please upload your resume to complete registration.`)
    } catch (error) {
      console.error("Google signup error:", error)
      alert("Google sign-up failed. Please try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only PDF, DOC, or DOCX files.")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.")
        return
      }
      setResumeFile(file)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.")
      return
    }

    if (!resumeFile) {
      alert("Please upload your resume.")
      return
    }

    setIsUploading(true)

    try {
      const uploadData = new FormData()
      uploadData.append("resume", resumeFile)
      uploadData.append("firstName", formData.firstName)
      uploadData.append("middleName", formData.middleName)
      uploadData.append("lastName", formData.lastName)
      uploadData.append("email", formData.email)
      uploadData.append("password", formData.password)
      uploadData.append("role", localStorage.getItem("selectedRole") || "jobseeker")

      const res = await axios.post("http://localhost:5000/api/auth/register", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      alert("Registration successful!")
      localStorage.setItem("user", JSON.stringify(res.data.user))
      localStorage.setItem("isAuthenticated", "true")

      navigate(`/${res.data.user.role}/dashboard`)
    } catch (err: any) {
      console.error(err)
      alert("Registration failed: " + (err.response?.data?.error || err.message))
    } finally {
      setIsUploading(false)
    }
  }

  const handleGoogleSignUp = () => {
    if (window.google) {
      window.google.accounts.id.prompt()
    } else {
      alert("Google OAuth is loading. Please try again in a moment.")
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
          <p className={styles.subtitle}>Create an account so you can explore all possible jobs!</p>
        </div>

        {/* Registration Form */}
        <form className={styles.form} onSubmit={handleRegister}>
          {/* Last Name */}
          <div className={styles.inputGroup}>
            <label htmlFor="lastName" className={styles.label}>Last Name</label>
            <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} className={styles.input} placeholder="Enter your last name" required />
          </div>

          {/* First Name */}
          <div className={styles.inputGroup}>
            <label htmlFor="firstName" className={styles.label}>First Name</label>
            <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} className={styles.input} placeholder="Enter your first name" required />
          </div>

          {/* Middle Name */}
          <div className={styles.inputGroup}>
            <label htmlFor="middleName" className={styles.label}>Middle Name</label>
            <input id="middleName" name="middleName" type="text" value={formData.middleName} onChange={handleInputChange} className={styles.input} placeholder="Enter your middle name" />
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={styles.input} placeholder="Enter your email" required />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} className={styles.input} placeholder="Enter your password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>Show</button>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} className={styles.input} placeholder="Confirm your password" required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>Show</button>
          </div>

          {/* Resume Upload */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Upload Resume</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
            {resumeFile && <p>Selected file: {resumeFile.name}</p>}
          </div>

          <button type="submit" disabled={isUploading}>{isUploading ? "UPLOADING..." : "SIGN UP"}</button>
        </form>

        {/* Google Sign Up */}
        <button onClick={handleGoogleSignUp} disabled={isUploading}>{isUploading ? "CONNECTING..." : "SIGN UP WITH GOOGLE"}</button>

        {/* Sign In Link */}
        <p>
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

declare global {
  interface Window { google: any }
}

export default RegisterPage
