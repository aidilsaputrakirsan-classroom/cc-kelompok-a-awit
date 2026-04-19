import { useState } from "react"

function LoginPage({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
        await onRegister(formData)
      } else {
        await onLogin(formData.email, formData.password)
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
        <aside className="login-page__brand" aria-hidden="true">
          <div className="login-page__brand-inner">
            <p className="login-page__eyebrow">Sistem informasi</p>
            <h1 className="login-page__brand-title">Cloud App</h1>
            <p className="login-page__brand-desc">
              Komputasi Awan — SI ITK. Akses aman ke dashboard operasional Anda.
            </p>
            <div className="login-page__brand-accent" />
            <ul className="login-page__brand-list">
              <li>Monitoring layanan</li>
              <li>Manajemen data terpusat</li>
              <li>Lingkungan korporat</li>
            </ul>
          </div>
        </aside>

        <main className="login-page__main">
          <div className="login-page__card">
            <header className="login-page__card-header">
              <h2 className="login-page__card-title">Masuk ke akun</h2>
              <p className="login-page__card-sub">
                Gunakan kredensial institusi untuk melanjutkan.
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
                <label className="login-page__label" htmlFor="login-email">Email</label>
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
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isRegister ? "Min: 8 char, 1 huruf, 1 angka, 1 special char" : "Password"}
                  required
                  className="login-page__input"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
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

              <button
                type="submit"
                className="login-page__submit"
                disabled={loading}
              >
                {loading ? "Memproses…" : isRegister ? "Buat akun" : "Masuk"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default LoginPage