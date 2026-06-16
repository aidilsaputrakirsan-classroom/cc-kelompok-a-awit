import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "./LoginPage.css";
import { User, Lock, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";

function IconAndroid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.625 10.155L19.4625 6.95251C19.575 6.75001 19.515 6.49501 19.32 6.37501C19.1175 6.25501 18.8625 6.32251 18.75 6.51751L16.89 9.75751C15.42 9.07501 13.77 8.67001 12 8.67001C10.23 8.67001 8.58 9.07501 7.11 9.75751L5.25 6.51751C5.1375 6.32251 4.8825 6.25501 4.68 6.37501C4.485 6.49501 4.4175 6.75001 4.5375 6.95251L6.375 10.155C2.865 12.0675 0.51 15.6525 0 19.83H24C23.49 15.6525 21.135 12.0675 17.625 10.155ZM6.555 16.59C5.97 16.59 5.49 16.11 5.49 15.525C5.49 14.94 5.97 14.46 6.555 14.46C7.14 14.46 7.62 14.94 7.62 15.525C7.62 16.11 7.14 16.59 6.555 16.59ZM17.445 16.59C16.86 16.59 16.38 16.11 16.38 15.525C16.38 14.94 16.86 14.46 17.445 14.46C18.03 14.46 18.51 14.94 18.51 15.525C18.51 16.11 18.03 16.59 17.445 16.59Z" />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="18" r="7" fill="#D6382F"/>
      <path d="M19 28 C19 36.5, 45 36.5, 45 28" stroke="#D6382F" strokeWidth="6" strokeLinecap="round"/>
      <path d="M7 23 C7 48, 57 48, 57 23" stroke="#D6382F" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationSVG() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M-50 300 L100 150 L250 300 Z" fill="#282828" />
      <path d="M150 300 L250 200 L450 300 Z" fill="#2A2A2A" />
      <g transform="translate(140, 70) rotate(-15) skewX(20)">
        <rect x="0" y="0" width="120" height="70" fill="#E0E0E0" rx="4" />
        <path d="M10 35 L110 35" stroke="#BDBDBD" strokeWidth="2" />
        <path d="M60 10 L60 60" stroke="#BDBDBD" strokeWidth="2" />
        <circle cx="60" cy="35" r="10" stroke="#D6382F" strokeWidth="2" fill="none" />
        <path d="M55 30 L65 40 M65 30 L55 40" stroke="#D6382F" strokeWidth="2" />
      </g>
      <g transform="translate(90, 180)">
        <circle cx="10" cy="10" r="8" fill="#F07C35" />
        <rect x="2" y="20" width="16" height="24" fill="#666666" rx="4" />
        <rect x="4" y="44" width="4" height="20" fill="#444444" />
        <rect x="12" y="44" width="4" height="20" fill="#444444" />
        <path d="M18 24 L30 18" stroke="#666666" strokeWidth="4" strokeLinecap="round" />
        <rect x="28" y="14" width="10" height="14" fill="#BDBDBD" rx="2" />
      </g>
      <g transform="translate(200, 160)">
        <circle cx="10" cy="10" r="8" fill="#F07C35" />
        <rect x="2" y="20" width="16" height="24" fill="#666666" rx="4" />
        <rect x="4" y="44" width="4" height="20" fill="#444444" />
        <rect x="12" y="44" width="4" height="20" fill="#444444" />
        <path d="M2 24 L-10 18" stroke="#666666" strokeWidth="4" strokeLinecap="round" />
        <rect x="-24" y="4" width="18" height="18" fill="#4285F4" rx="2" />
      </g>
      <g transform="translate(260, 200)">
        <circle cx="10" cy="10" r="8" fill="#F07C35" />
        <rect x="2" y="20" width="16" height="24" fill="#666666" rx="4" />
        <rect x="4" y="44" width="4" height="20" fill="#444444" />
        <rect x="12" y="44" width="4" height="20" fill="#444444" />
        <rect x="-30" y="30" width="24" height="14" fill="#4285F4" rx="2" />
        <circle cx="-25" cy="48" r="4" fill="#222" />
        <circle cx="-11" cy="48" r="4" fill="#222" />
        <path d="M-6 34 L2 24" stroke="#666666" strokeWidth="4" strokeLinecap="round" />
      </g>
      <ellipse cx="200" cy="270" rx="140" ry="20" fill="#000000" opacity="0.1" />
    </svg>
  );
}

export default function LoginPage() {
  const { login, registerAndLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"


  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const switchMode = (m) => { setMode(m); setError(""); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message === "UNAUTHORIZED"
        ? "Sesi atau kredensial tidak valid."
        : err.message || "Login gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPw) { setError("Semua field wajib diisi."); return; }
    if (password !== confirmPw) { setError("Konfirmasi password tidak cocok."); return; }
    if (password.length < 8) { setError("Password minimal 8 karakter."); return; }
    if (!/[a-zA-Z]/.test(password)) { setError("Password harus mengandung huruf (A-Z atau a-z)."); return; }
    if (!/[0-9]/.test(password)) { setError("Password harus mengandung angka (0-9)."); return; }
    if (!/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password)) {
      setError("Password harus mengandung karakter spesial (contoh: ! @ # $ %)."); return;
    }
    setLoading(true);
    try {
      await registerAndLogin({ name, email, password });
    } catch (err) {
      // Tampilkan pesan error dari backend secara langsung jika ada
      const msg = err.message;
      if (msg && msg !== "Validasi gagal") {
        setError(msg);
      } else {
        setError("Registrasi gagal. Pastikan email belum terdaftar dan password memenuhi syarat.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button className="back-btn" onClick={() => navigate('/onboarding')} type="button">
        <ArrowLeft size={20} />
        <span>Kembali</span>
      </button>
      <div className="bg-dots"></div>
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      <div className="bg-circle bg-circle-3"></div>

      <div className="login-card">
        {/* Left Side: Branding */}
        <div className="login-left">
          <div className="login-brand">
            <LogoIcon />
            <h1>Palm Chain</h1>
          </div>
          <div className="login-illustration">
            <IllustrationSVG />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="login-right">
          <div className="login-form-wrapper">
            {/* Tab switcher Login / Daftar */}
            <div className="login-tabs">
              <button
                id="tab-login"
                className={`login-tab${mode === "login" ? " login-tab--active" : ""}`}
                onClick={() => switchMode("login")}
                type="button"
              >Masuk</button>
              <button
                id="tab-register"
                className={`login-tab${mode === "register" ? " login-tab--active" : ""}`}
                onClick={() => switchMode("register")}
                type="button"
              >Daftar</button>
              <div className={`login-tab-bar${mode === "register" ? " login-tab-bar--right" : ""}`} />
            </div>

            {error && <div className="login-alert">{error}</div>}

            {/* ── LOGIN FORM ── */}
            {mode === "login" && (
              <form id="form-login" onSubmit={handleLogin} noValidate className="login-form">
                <div className="input-group">
                  <span className="input-icon"><Mail size={15} /></span>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="agus@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon"><Lock size={15} /></span>
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button id="btn-login" type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Memproses..." : "Login"}
                </button>
                <p className="switch-hint">
                  Belum punya akun?{" "}
                  <button type="button" className="switch-link" onClick={() => switchMode("register")}>Daftar sekarang</button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {mode === "register" && (
              <form id="form-register" onSubmit={handleRegister} noValidate className="login-form">
                <div className="input-group">
                  <span className="input-icon"><User size={15} /></span>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon"><Mail size={15} /></span>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="agus@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon"><Lock size={15} /></span>
                  <input
                    id="reg-password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 karakter, angka & simbol (!@#$)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="input-group">
                  <span className="input-icon"><Lock size={15} /></span>
                  <input
                    id="reg-confirm"
                    type={showPw2 ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw2(v => !v)}>
                    {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button id="btn-register" type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Mendaftar..." : "Buat Akun"}
                </button>
                <p className="switch-hint">
                  Sudah punya akun?{" "}
                  <button type="button" className="switch-link" onClick={() => switchMode("login")}>Masuk</button>
                </p>
              </form>
            )}

            <div className="download-app">
              <button className="download-btn">
                <IconAndroid />
                <div className="download-text">
                  <span>Download</span>
                  <strong>Android Apps</strong>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
