import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

/* ── Icons ── */
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

/* ── Background blobs ── */
function Blobs() {
  return (
    <div className="lp-blobs" aria-hidden="true">
      <div className="lp-blob lp-blob-1"/>
      <div className="lp-blob lp-blob-2"/>
      <div className="lp-blob lp-blob-3"/>
      <div className="lp-blob lp-blob-4"/>
    </div>
  );
}

/* ── Main Component ── */
export default function LoginPage() {
  const { login, registerAndLogin } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* login fields */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* register extra fields */
  const [name, setName] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const switchMode = (m) => {
    setMode(m);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message === "UNAUTHORIZED"
        ? "Email atau password salah."
        : err.message || "Login gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPw) {
      setError("Semua field wajib diisi."); return;
    }
    if (password !== confirmPw) {
      setError("Konfirmasi password tidak cocok."); return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter."); return;
    }
    setLoading(true);
    try {
      await registerAndLogin({ name, email, password });
    } catch (err) {
      setError(err.message || "Registrasi gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      <Blobs />

      {/* ── Left panel ── */}
      <div className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-logo-wrap">
            <div className="lp-logo-icon">
              <IconLeaf />
            </div>
            <span className="lp-logo-text">PalmChain</span>
          </div>
          <h1 className="lp-hero-title">
            Palm Oil<br />Supply Chain<br />Monitoring
          </h1>
          <p className="lp-hero-sub">
            Kelola hauling, vendor, dan transaksi<br />
            perkebunan kelapa sawit dalam satu platform.
          </p>
          <div className="lp-stats">
            <div className="lp-stat"><span className="lp-stat-num">99.9%</span><span className="lp-stat-label">Uptime</span></div>
            <div className="lp-stat-divider"/>
            <div className="lp-stat"><span className="lp-stat-num">Real-time</span><span className="lp-stat-label">Monitoring</span></div>
            <div className="lp-stat-divider"/>
            <div className="lp-stat"><span className="lp-stat-num">Secure</span><span className="lp-stat-label">JWT Auth</span></div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="lp-form-panel">
        <div className="lp-card">
          {/* Tab switcher */}
          <div className="lp-tabs">
            <button
              id="tab-login"
              className={`lp-tab ${mode === "login" ? "lp-tab--active" : ""}`}
              onClick={() => switchMode("login")}
              type="button"
            >
              Masuk
            </button>
            <button
              id="tab-register"
              className={`lp-tab ${mode === "register" ? "lp-tab--active" : ""}`}
              onClick={() => switchMode("register")}
              type="button"
            >
              Daftar
            </button>
            <div className={`lp-tab-indicator ${mode === "register" ? "lp-tab-indicator--right" : ""}`}/>
          </div>

          {/* Error alert */}
          {error && (
            <div className="lp-alert" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16,flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form id="form-login" className="lp-form" onSubmit={handleLogin} noValidate>
              <p className="lp-greeting">Selamat datang kembali 👋</p>

              <div className="lp-field">
                <label htmlFor="login-email" className="lp-label">Email</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IconMail /></span>
                  <input
                    id="login-email"
                    type="email"
                    className="lp-input"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="lp-field">
                <label htmlFor="login-password" className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IconLock /></span>
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    className="lp-input lp-input--pw"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login"
                type="submit"
                className="lp-btn-primary"
                disabled={loading}
              >
                {loading ? <span className="lp-spinner"/> : null}
                {loading ? "Memproses…" : "Masuk"}
              </button>

              <p className="lp-switch-hint">
                Belum punya akun?{" "}
                <button type="button" className="lp-link" onClick={() => switchMode("register")}>
                  Daftar sekarang
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === "register" && (
            <form id="form-register" className="lp-form" onSubmit={handleRegister} noValidate>
              <p className="lp-greeting">Buat akun baru ✨</p>

              <div className="lp-field">
                <label htmlFor="reg-name" className="lp-label">Nama Lengkap</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IconUser /></span>
                  <input
                    id="reg-name"
                    type="text"
                    className="lp-input"
                    placeholder="Nama kamu"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="lp-field">
                <label htmlFor="reg-email" className="lp-label">Email</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IconMail /></span>
                  <input
                    id="reg-email"
                    type="email"
                    className="lp-input"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="lp-field">
                <label htmlFor="reg-password" className="lp-label">
                  Password
                  <span className="lp-label-hint">min. 8 karakter + angka + simbol</span>
                </label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IconLock /></span>
                  <input
                    id="reg-password"
                    type={showPw ? "text" : "password"}
                    className="lp-input lp-input--pw"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <div className="lp-field">
                <label htmlFor="reg-confirm" className="lp-label">Konfirmasi Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IconLock /></span>
                  <input
                    id="reg-confirm"
                    type={showPw2 ? "text" : "password"}
                    className={`lp-input lp-input--pw ${confirmPw && confirmPw !== password ? "lp-input--error" : ""}`}
                    placeholder="••••••••"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setShowPw2(v => !v)}
                    aria-label={showPw2 ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPw2 ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {confirmPw && confirmPw !== password && (
                  <p className="lp-field-error">Password tidak cocok</p>
                )}
              </div>

              <button
                id="btn-register"
                type="submit"
                className="lp-btn-primary"
                disabled={loading}
              >
                {loading ? <span className="lp-spinner"/> : null}
                {loading ? "Mendaftar…" : "Buat Akun"}
              </button>

              <p className="lp-switch-hint">
                Sudah punya akun?{" "}
                <button type="button" className="lp-link" onClick={() => switchMode("login")}>
                  Masuk
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="lp-footer">© 2025 PalmChain · Kelompok A AWIT</p>
      </div>
    </div>
  );
}
