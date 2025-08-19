import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Auth() {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to role selection if no specific auth route
    navigate("/")
  }, [navigate])

  return null
}
