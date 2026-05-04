import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"
import Notification from "../components/Notification"
import {
  clearToken,
  getMe,
  login as loginApi,
  register as registerApi,
  syncTokenFromStorage,
} from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [toast, setToast] = useState({ message: "", type: "" })

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type })
  }, [])

  const clearToast = useCallback(() => {
    setToast({ message: "", type: "" })
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!syncTokenFromStorage()) {
        if (!cancelled) setReady(true)
        return
      }
      try {
        const u = await getMe()
        if (!cancelled) setUser(u)
      } catch {
        clearToken()
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (email, password) => {
      const data = await loginApi(email, password)
      setUser(data.user)
      showToast("Login berhasil", "success")
      navigate("/dashboard", { replace: true })
      return data
    },
    [navigate, showToast],
  )

  const registerAndLogin = useCallback(
    async (userData) => {
      await registerApi(userData)
      const data = await loginApi(userData.email, userData.password)
      setUser(data.user)
      showToast("Registrasi berhasil", "success")
      navigate("/dashboard", { replace: true })
      return data
    },
    [navigate, showToast],
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    navigate("/login", { replace: true })
    showToast("Logout berhasil", "info")
  }, [navigate, showToast])

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      registerAndLogin,
      logout,
      showToast,
      clearToast,
    }),
    [user, ready, login, registerAndLogin, logout, showToast, clearToast],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Notification
        message={toast.message}
        type={toast.type}
        onClose={clearToast}
      />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider")
  return ctx
}
