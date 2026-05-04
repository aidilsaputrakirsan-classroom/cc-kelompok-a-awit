import { useState } from "react"
import { useAuth } from "../context/AuthContext"

function KeyIcon() {
  return (
    <svg className="login-page__key-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.169.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6.002 6.002 0 0112 2.25z"
      />
    </svg>
  )
}

function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  )
}

function PalmTrackIllustration() {
  return (
    <svg
      className="login-page__illustration"
      viewBox="0 0 420 300"
      role="img"
      aria-label="Ilustrasi rantai pasok digital dan operasi perkebunan"
    >
      <defs>
        <linearGradient id="pt-illus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BA352C" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#323232" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="420" height="300" fill="url(#pt-illus-grad)" rx="12" />
      <g stroke="#323232" strokeOpacity="0.14" strokeWidth="1" fill="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="24" y1={36 + i * 28} x2="396" y2={36 + i * 28} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={32 + i * 32} y1="28" x2={32 + i * 32} y2="272" />
        ))}
      </g>
      <g stroke="#323232" strokeOpacity="0.35" strokeWidth="1.5" fill="none">
        <path d="M72 210 Q120 120 168 168 T264 132 T348 108" />
        <circle cx="72" cy="210" r="6" fill="#FFFFFF" stroke="#323232" strokeOpacity="0.45" />
        <circle cx="168" cy="168" r="6" fill="#FFFFFF" stroke="#323232" strokeOpacity="0.45" />
        <circle cx="264" cy="132" r="6" fill="#BA352C" fillOpacity="0.9" stroke="#BA352C" />
        <circle cx="348" cy="108" r="6" fill="#FFFFFF" stroke="#323232" strokeOpacity="0.45" />
      </g>
      <g fill="none" stroke="#323232" strokeOpacity="0.28" strokeWidth="1.25" strokeLinecap="round">
        <path d="M88 228c12-48 28-72 44-76m-36 92c8-36 20-56 32-60" />
        <path d="M96 236c18-8 34-20 46-36" />
      </g>
      <rect x="260" y="188" width="112" height="64" rx="6" fill="#FFFFFF" stroke="#323232" strokeOpacity="0.2" />
      <path d="M276 212h80M276 228h56M276 244h72" stroke="#323232" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LoginPage() {
  const { login, registerAndLogin } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          setError("Nama wajib diisi")
          setLoading(false)
          return
        }
        if (formData.password.length < 8) {
          setError("Password minimal 8 karakter")
          setLoading(false)
          return
        }
        await registerAndLogin(formData)
      } else {
        await login(formData.email, formData.password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__layout">
        <aside className="login-page__brand" aria-labelledby="login-brand-heading">
          <div className="login-page__brand-inner">
            <h1 id="login-brand-heading" className="login-page__brand-title">
              Digitalizing Agriculture Supply Chain
            </h1>
            <p className="login-page__brand-sub">for a Modern Palm Industry</p>
            <div className="login-page__brand-art">
              <PalmTrackIllustration />
            </div>
          </div>
        </aside>

        <main className="login-page__panel">
          <div className="login-page__form-shell">
            <header className="login-page__panel-header">
              <div className="login-page__panel-title-row">
                <KeyIcon />
                <h2 className="login-page__panel-title">
                  {isRegister ? "Register" : "Log In"}
                </h2>
              </div>
              <p className="login-page__panel-sub">
                {isRegister
                  ? "Create your PalmTrack Cloud account to get started."
                  : "Welcome back! Login to access the dashboard."}
              </p>
            </header>

            <div className="login-page__tabs" role="tablist" aria-label="Mode autentikasi">
              <button
                type="button"
                role="tab"
                aria-selected={!isRegister}
                className={`login-page__tab${isRegister ? "" : " login-page__tab--active"}`}
                onClick={() => { setIsRegister(false); setError("") }}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isRegister}
                className={`login-page__tab${isRegister ? " login-page__tab--active" : ""}`}
                onClick={() => { setIsRegister(true); setError("") }}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="login-page__error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-page__form">
              {isRegister && (
                <div className="login-page__field">
                  <label className="login-page__label" htmlFor="login-name">Nama Lengkap</label>
                  <input
                    id="login-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama Lengkap"
                    className="login-page__input"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="login-page__field">
                <label className="login-page__label" htmlFor="login-email">Username / Email</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@student.itk.ac.id"
                  required
                  className="login-page__input"
                  autoComplete="email"
                />
              </div>

              <div className="login-page__field">
                <label className="login-page__label" htmlFor="login-password">Password</label>
                <div className="login-page__password-field">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isRegister ? "Min: 8 char, 1 huruf, 1 angka, 1 special char" : "Password"}
                    required
                    className="login-page__input login-page__input--password"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="login-page__pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
                {isRegister && (
                  <div className="login-page__hint">
                    <small>
                      ✓ Password harus mengandung:<br />
                      • Minimal 8 karakter<br />
                      • Huruf (A-Z, a-z)<br />
                      • Angka (0-9)<br />
                      • Special character (!@#$%^&*)
                    </small>
                  </div>
                )}
              </div>

              {!isRegister && (
                <div className="login-page__options-row">
                  <label className="login-page__remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <a
                    href="#"
                    className="login-page__forgot"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot Password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="login-page__submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait…"
                  : isRegister
                    ? "Create account"
                    : "Sign in to Dashboard"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default LoginPage
