import { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Truck } from "lucide-react";

export default function MobileLayout() {
  const { user, logout, showToast } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const outletContext = useMemo(
    () => ({
      showToast,
    }),
    [showToast]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-emerald-600 dark:bg-emerald-700 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Truck size={24} />
          <span>PalmTrack Driver</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-90">{user?.name || "Driver"}</span>
          <button 
            onClick={handleLogout}
            className="text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-900 border-none text-white py-1 px-3 rounded-md cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto w-full max-w-lg mx-auto">
        <Outlet context={outletContext} />
      </main>
    </div>
  );
}
