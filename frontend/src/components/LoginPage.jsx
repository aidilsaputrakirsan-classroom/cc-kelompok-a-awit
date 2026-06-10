import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Lock, Eye, EyeOff } from "lucide-react";

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
      <circle cx="32" cy="18" r="7" fill="#10b981"/>
      <path d="M19 28 C19 36.5, 45 36.5, 45 28" stroke="#10b981" strokeWidth="6" strokeLinecap="round"/>
      <path d="M7 23 C7 48, 57 48, 57 23" stroke="#10b981" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationSVG() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full h-auto">
      {/* Background Mountains */}
      <path d="M-50 300 L100 150 L250 300 Z" fill="#282828" opacity="0.4" />
      <path d="M150 300 L250 200 L450 300 Z" fill="#2A2A2A" opacity="0.4" />
      
      {/* Floating Board */}
      <g transform="translate(140, 70) rotate(-15) skewX(20)">
        <rect x="0" y="0" width="120" height="70" fill="#E0E0E0" rx="4" />
        <path d="M10 35 L110 35" stroke="#BDBDBD" strokeWidth="2" />
        <path d="M60 10 L60 60" stroke="#BDBDBD" strokeWidth="2" />
        <circle cx="60" cy="35" r="10" stroke="#10b981" strokeWidth="2" fill="none" />
        <path d="M55 30 L65 40 M65 30 L55 40" stroke="#10b981" strokeWidth="2" />
      </g>
      
      {/* Worker 1 (Left) */}
      <g transform="translate(90, 180)">
        <circle cx="10" cy="10" r="8" fill="#10b981" />
        <rect x="2" y="20" width="16" height="24" fill="#666666" rx="4" />
        <rect x="4" y="44" width="4" height="20" fill="#444444" />
        <rect x="12" y="44" width="4" height="20" fill="#444444" />
        <path d="M18 24 L30 18" stroke="#666666" strokeWidth="4" strokeLinecap="round" />
        <rect x="28" y="14" width="10" height="14" fill="#BDBDBD" rx="2" />
      </g>

      {/* Worker 2 (Middle) */}
      <g transform="translate(200, 160)">
        <circle cx="10" cy="10" r="8" fill="#10b981" />
        <rect x="2" y="20" width="16" height="24" fill="#666666" rx="4" />
        <rect x="4" y="44" width="4" height="20" fill="#444444" />
        <rect x="12" y="44" width="4" height="20" fill="#444444" />
        <path d="M2 24 L-10 18" stroke="#666666" strokeWidth="4" strokeLinecap="round" />
        <rect x="-24" y="4" width="18" height="18" fill="#0ea5e9" rx="2" />
      </g>

      {/* Worker 3 (Right) */}
      <g transform="translate(260, 200)">
        <circle cx="10" cy="10" r="8" fill="#10b981" />
        <rect x="2" y="20" width="16" height="24" fill="#666666" rx="4" />
        <rect x="4" y="44" width="4" height="20" fill="#444444" />
        <rect x="12" y="44" width="4" height="20" fill="#444444" />
        <rect x="-30" y="30" width="24" height="14" fill="#0ea5e9" rx="2" />
        <circle cx="-25" cy="48" r="4" fill="#222" />
        <circle cx="-11" cy="48" r="4" fill="#222" />
        <path d="M-6 34 L2 24" stroke="#666666" strokeWidth="4" strokeLinecap="round" />
      </g>
      
      <ellipse cx="200" cy="270" rx="140" ry="20" fill="#000000" opacity="0.1" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] overflow-hidden z-10 border border-gray-100">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col flex-1 bg-gray-900 p-12 text-white relative items-center justify-center">
          <div className="absolute top-12 left-12 flex items-center gap-3">
            <LogoIcon />
            <h1 className="text-2xl font-bold tracking-wide">Palm Chain</h1>
          </div>
          <div className="w-full max-w-[400px] mt-12">
            <IllustrationSVG />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-16 relative">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
            <LogoIcon />
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">Palm Chain</h1>
          </div>

          <div className="w-full max-w-[400px] mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-gray-500 mb-8">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className="flex flex-col gap-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  placeholder="agus@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] active:translate-y-0 flex items-center justify-center" 
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "Login"}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-center">
              <button className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl transition-colors w-full sm:w-auto justify-center shadow-md">
                <IconAndroid />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] opacity-80 mb-0.5">Download</span>
                  <strong className="text-sm">Android Apps</strong>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
