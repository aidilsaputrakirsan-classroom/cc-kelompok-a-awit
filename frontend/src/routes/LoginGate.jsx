import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function LoginGate({ children }) {
  const { user, ready } = useAuth()

  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
  if (!hasSeenOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  if (!ready) {
    return (
      <div className="pt-boot">
        <div className="pt-boot__inner">Memuat…</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
