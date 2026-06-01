import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#333" width="20px" height="20px">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#333" width="20px" height="20px">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="4"></circle>
    </svg>
  );
}

function EyeOffIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    )
}

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px', color: '#666' }}>
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592c.1158-.2018.0468-.4582-.1554-.574-.2026-.1158-.4589-.0464-.5748.1554l-2.0253 3.5076c-1.463-.6668-3.1235-1.037-4.8878-1.037-1.765 0-3.4255.3702-4.8885 1.037l-2.0246-3.5076c-.1158-.2018-.3725-.2712-.5744-.1554-.2018.1158-.2716.3722-.1558.574l1.9976 3.4592C2.6593 10.6698.4552 14.159.2012 18.2198h23.597c-.254-4.0608-2.458-7.55-6.3867-8.8984"/>
    </svg>
  );
}

function CoalChainLogo() {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="30" stroke="#c0392b" strokeWidth="8" strokeLinecap="round" strokeDasharray="140 100" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="16" stroke="#c0392b" strokeWidth="8" strokeLinecap="round" strokeDasharray="70 50" transform="rotate(-45 50 50)" />
      <circle cx="50" cy="50" r="5" fill="#c0392b" />
    </svg>
  );
}

function MiningIllustration() {
  return (
    <div className="mining-illustration">
        <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
            {/* Background Mountains/Walls */}
            <path d="M0 100 L50 20 L150 120 L250 50 L350 150 L400 80 L400 300 L0 300 Z" fill="#1c1c1c" />
            <path d="M50 150 L100 80 L200 180 L300 100 L400 200 L400 300 L0 300 Z" fill="#242424" />
            <path d="M0 250 Q 200 200 400 250 L400 300 L0 300 Z" fill="#2d2d2d" />
            {/* Ground Puddles */}
            <ellipse cx="100" cy="270" rx="40" ry="15" fill="#3a3a3a" opacity="0.5" />
            <ellipse cx="300" cy="260" rx="60" ry="20" fill="#3a3a3a" opacity="0.5" />
            
            {/* Whiteboard */}
            <g transform="translate(180, 50) rotate(-15) skewX(20) scale(0.8)">
                <rect x="0" y="0" width="120" height="80" fill="#e0e0e0" rx="4" />
                <rect x="0" y="0" width="120" height="80" fill="none" stroke="#ccc" strokeWidth="2" rx="4" />
                <path d="M 10 70 L 10 20 L 50 20 L 50 50 L 90 50 L 90 20 L 110 20" fill="none" stroke="#999" strokeWidth="2" />
                <path d="M 10 15 L 15 20 L 5 20 Z" fill="#999" />
                <path d="M 110 25 L 115 20 L 105 20 Z" fill="#999" />
                <circle cx="70" cy="35" r="12" fill="none" stroke="#c0392b" strokeWidth="2" />
                <path d="M 65 30 L 75 40 M 75 30 L 65 40" stroke="#c0392b" strokeWidth="2" />
            </g>
            
            {/* Worker 1 - Center Right (Tablet) */}
            <g transform="translate(240, 160)">
                <circle cx="10" cy="-30" r="8" fill="#e67e22" /> {/* Helmet */}
                <path d="M 2 -32 C 10 -35 15 -30 18 -32" stroke="#d35400" strokeWidth="2" fill="none" />
                <rect x="0" y="-20" width="20" height="35" rx="4" fill="#555" /> {/* Body */}
                <rect x="0" y="-10" width="20" height="15" fill="#e67e22" opacity="0.8" /> {/* Vest */}
                <rect x="4" y="10" width="5" height="25" fill="#444" rx="2" /> {/* Leg 1 */}
                <rect x="11" y="10" width="5" height="25" fill="#444" rx="2" /> {/* Leg 2 */}
                {/* Arm & Tablet */}
                <line x1="5" y1="-15" x2="-10" y2="-5" stroke="#555" strokeWidth="5" strokeLinecap="round" />
                <line x1="-10" y1="-5" x2="0" y2="5" stroke="#555" strokeWidth="5" strokeLinecap="round" />
                <line x1="15" y1="-15" x2="25" y2="-5" stroke="#555" strokeWidth="5" strokeLinecap="round" />
                <line x1="25" y1="-5" x2="15" y2="5" stroke="#555" strokeWidth="5" strokeLinecap="round" />
                <rect x="-5" y="0" width="15" height="20" fill="#2c3e50" transform="rotate(-30 0 0)" rx="1" />
            </g>

            {/* Worker 2 - Bottom Left (Pickaxe) */}
            <g transform="translate(100, 200)">
                <circle cx="10" cy="-30" r="8" fill="#e67e22" />
                <path d="M 2 -32 C 10 -35 15 -30 18 -32" stroke="#d35400" strokeWidth="2" fill="none" />
                <rect x="0" y="-20" width="20" height="30" rx="4" fill="#555" />
                <rect x="0" y="-10" width="20" height="15" fill="#e67e22" opacity="0.8" />
                <rect x="4" y="10" width="5" height="20" fill="#444" rx="2" transform="rotate(-15 4 10)" />
                <rect x="11" y="10" width="5" height="20" fill="#444" rx="2" transform="rotate(15 11 10)" />
                {/* Pickaxe */}
                <line x1="10" y1="-15" x2="30" y2="-30" stroke="#555" strokeWidth="5" strokeLinecap="round" />
                <line x1="30" y1="-30" x2="40" y2="-20" stroke="#8b4513" strokeWidth="3" />
                <line x1="35" y1="-35" x2="45" y2="-15" stroke="#95a5a6" strokeWidth="4" strokeLinecap="round" />
                <path d="M 33 -33 C 40 -40 48 -25 47 -13" stroke="#95a5a6" strokeWidth="3" fill="none" />
            </g>

            {/* Worker 3 - Bottom Right (Cart) */}
            <g transform="translate(280, 220)">
                <circle cx="10" cy="-30" r="8" fill="#e67e22" />
                <path d="M 2 -32 C 10 -35 15 -30 18 -32" stroke="#d35400" strokeWidth="2" fill="none" />
                <rect x="0" y="-20" width="20" height="30" rx="4" fill="#555" />
                <rect x="0" y="-10" width="20" height="15" fill="#e67e22" opacity="0.8" />
                <rect x="4" y="10" width="5" height="20" fill="#444" rx="2" />
                <rect x="11" y="10" width="5" height="20" fill="#444" rx="2" />
                {/* Cart */}
                <rect x="-40" y="10" width="35" height="20" fill="#34495e" rx="2" />
                <circle cx="-30" cy="30" r="5" fill="#2c3e50" />
                <circle cx="-10" cy="30" r="5" fill="#2c3e50" />
                <line x1="5" y1="-15" x2="-20" y2="10" stroke="#555" strokeWidth="5" strokeLinecap="round" />
                {/* Coal */}
                <circle cx="-35" cy="8" r="4" fill="#111" />
                <circle cx="-25" cy="5" r="5" fill="#222" />
                <circle cx="-15" cy="7" r="4" fill="#111" />
            </g>
        </svg>
    </div>
  )
}



function BackgroundPattern() {
    return (
        <div className="bg-pattern-container">
            <div className="bg-shape circle-1"></div>
            <div className="bg-shape circle-2"></div>
            <div className="bg-shape circle-3"></div>
            <div className="bg-shape triangle-1"></div>
            <div className="bg-shape cross-1"></div>
            <div className="bg-shape dots-1"></div>
            <div className="bg-shape dots-2"></div>
        </div>
    )
}

function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The context login likely takes email and password, 
      // but if we only have a username field as per design, we pass it as the first argument.
      // E-TrashHub or PalmTrack context may have specific needs.
      await login(formData.username, formData.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coal-login-wrapper">
      <BackgroundPattern />
      <div className="coal-login-card">
        {/* Left Side */}
        <div className="coal-login-left">
          <div className="coal-brand">
            <CoalChainLogo />
            <h1>Palm Chain</h1>
          </div>
          <MiningIllustration />
        </div>

        {/* Right Side */}
        <div className="coal-login-right">
          <div className="coal-login-form-container">
            <h2 className="coal-login-title">Login</h2>
            
            {error && <div className="coal-login-error">{error}</div>}

            <form onSubmit={handleSubmit} className="coal-form">
              <div className="coal-input-group">
                <div className="coal-input-icon">
                    <UserIcon />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="coal-input-group">
                <div className="coal-input-icon">
                    <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="coal-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <button type="submit" className="coal-submit-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <button className="coal-download-btn" type="button">
                <AndroidIcon />
                <div className="coal-download-divider"></div>
                <div className="coal-download-text">
                    <span className="small-text">Download</span>
                    <span className="large-text">Android Apps</span>
                </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
