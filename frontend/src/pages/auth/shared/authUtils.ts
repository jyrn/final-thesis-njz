const GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com"
const GOOGLE_REDIRECT_URI = window.location.origin + "/auth/google/callback"

export const loadGoogleOAuthScript = (callback?: () => void) => {
  if (document.getElementById("google-oauth-script")) return

  const script = document.createElement("script")
  script.id = "google-oauth-script"
  script.src = "https://accounts.google.com/gsi/client"
  script.async = true
  script.defer = true
  script.onload = callback || (() => {})
  document.head.appendChild(script)
}

export const initializeGoogleOAuth = (handleResponse: (response: any) => void) => {
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    })
  }
}

export const parseJwt = (token: string) => {
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

export const handleGoogleAuthSuccess = async (userInfo: any, role: string) => {
  try {
    const parts = userInfo.name.trim().split(/\s+/)
    const firstName = parts[0] || ""
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : ""
    const lastName = parts.length > 1 ? parts[parts.length - 1] : ""

    const userData = {
      id: userInfo.sub || userInfo.id,
      email: userInfo.email,
      picture: userInfo.picture,
      verified_email: userInfo.email_verified || userInfo.verified_email,
      authProvider: "google",
      loginTime: new Date().toISOString(),
      role,
    }

    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("isAuthenticated", "true")

    return {
      email: userInfo.email,
      firstName,
      middleName,
      lastName,
    }
  } catch (error) {
    console.error("Error processing Google auth:", error)
    throw new Error("Failed to process Google authentication.")
  }
}

export const handleGoogleSignIn = (role: string, isLogin: boolean) => {
  if (window.google) {
    window.google.accounts.id.prompt()
  } else {
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${role}_${isLogin ? "login" : "register"}`

    window.location.href = authUrl
  }
}
