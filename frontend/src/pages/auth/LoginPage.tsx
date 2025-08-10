"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import styles from "./LoginPage.module.css"

// Google OAuth configuration
const GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com" // Replace with your actual client ID

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "brandonelouis@gmail.com",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load Google OAuth script
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
    setIsLoading(true)
    try {
      // Decode the JWT token to get user info
      const userInfo = parseJwt(response.credential)
      await handleGoogleAuthSuccess(userInfo)
    } catch (error) {
      console.error("Google sign-in error:", error)
      alert("Google authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
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

      const selectedRole = localStorage.getItem("selectedRole") || "jobseeker"
      navigate(`/${selectedRole}/dashboard`)
    } catch (error) {
      console.error("Error processing Google auth:", error)
      alert("Failed to process Google authentication.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login process
    setTimeout(() => {
      const selectedRole = localStorage.getItem("selectedRole") || "jobseeker"
      navigate(`/${selectedRole}/dashboard`)
      setIsLoading(false)
    }, 1500)
  }

  const handleGoogleSignIn = () => {
    if (window.google) {
      // Use popup flow
      window.google.accounts.id.prompt()
    } else {
      // Fallback message
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

        {/* Welcome Text */}
        <div className={styles.welcomeSection}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to continue your job search journey</p>
        </div>

        {/* Login Form */}
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
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
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordContainer}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                className={styles.passwordInput}
                placeholder="Enter your password"
                required
              />
              <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                <svg className={styles.eyeIcon} fill="currentColor" viewBox="0 0 20 20">
                  {showPassword ? (
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  )}
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 15.057 5.522 18 10 18s8.268-2.943 9.542-8C18.268 4.943 14.478 2 10 2S1.732 4.943.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.optionsRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Remember me</span>
            </label>
            <Link to="/auth/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className={styles.loginButton} disabled={isLoading}>
            {isLoading ? "SIGNING IN..." : "LOGIN"}
          </button>
        </form>

        {/* Google Sign In */}
        <button onClick={handleGoogleSignIn} className={styles.googleButton} disabled={isLoading}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? "CONNECTING..." : "SIGN IN WITH GOOGLE"}
        </button>

        {/* Sign Up Link */}
        <p className={styles.signUpText}>
          You don't have an account yet?{" "}
          <Link to="/auth/register" className={styles.signUpLink}>
            Sign up
          </Link>
        </p>
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

export default LoginPage
