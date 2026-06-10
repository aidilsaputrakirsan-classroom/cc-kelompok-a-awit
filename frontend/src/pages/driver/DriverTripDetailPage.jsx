import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { driverService } from "../../services/mockDriverService";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

const STATUS_FLOW = ["PENDING", "LOADING", "ON_THE_WAY", "WEIGHING", "COMPLETED"];

const STATUS_ACTIONS = {
  PENDING: { label: "Mulai Muat Buah", color: "bg-blue-600 hover:bg-blue-700", next: "LOADING" },
  LOADING: { label: "Selesai Muat, Berangkat!", color: "bg-yellow-600 hover:bg-yellow-700", next: "ON_THE_WAY" },
  ON_THE_WAY: { label: "Tiba di Pabrik (PKS)", color: "bg-purple-600 hover:bg-purple-700", next: "WEIGHING" },
  WEIGHING: { label: "Selesai Timbang (Trip Selesai)", color: "bg-emerald-600 hover:bg-emerald-700", next: "COMPLETED" },
  COMPLETED: { label: "Trip Selesai", color: "bg-gray-400 cursor-not-allowed", next: null }
};

export default function DriverTripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext() || {};
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const data = await driverService.getTripById(id);
      setTrip(data);
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Gagal mengambil detail trip", "error");
      navigate("/driver/trips");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!trip) return;
    const action = STATUS_ACTIONS[trip.status];
    if (!action || !action.next) return;

    try {
      setUpdating(true);
      const updated = await driverService.updateTripStatus(id, action.next);
      setTrip(updated);
      if (showToast) showToast(`Status diperbarui ke: ${action.next}`, "success");
      
      if (action.next === "COMPLETED") {
        setTimeout(() => navigate("/driver/trips"), 1500);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Gagal memperbarui status", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !trip) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>;
  }

  const currentAction = STATUS_ACTIONS[trip.status];
  const isCompleted = trip.status === "COMPLETED";

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] pb-6">
      {/* Top Nav */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate("/driver/trips")}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-2">Detail Trip</h2>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-auto">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nomor Tiket</div>
        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          {trip.ticket_no}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lokasi Muat (Blok)</div>
            <div className="font-semibold text-gray-900 dark:text-white text-lg">{trip.block_name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tujuan Pabrik (Vendor)</div>
            <div className="font-semibold text-gray-900 dark:text-white text-lg">{trip.vendor_name}</div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="my-8 mx-4">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>
          {STATUS_FLOW.map((s, index) => {
            const isActive = STATUS_FLOW.indexOf(trip.status) >= index;
            return (
              <div 
                key={s} 
                className={`relative z-10 w-4 h-4 rounded-full ring-4 ring-gray-50 dark:ring-gray-900 transition-colors duration-300 ${isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} 
              />
            );
          })}
        </div>
        <div className="text-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          Status: <span className="text-gray-900 dark:text-white">{trip.status}</span>
        </div>
      </div>

      {/* Giant Action Button */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleUpdateStatus}
          disabled={updating || isCompleted}
          className={`w-full p-4 rounded-2xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed ${currentAction.color}`}
        >
          {updating ? (
            <><Loader2 className="animate-spin" /> Memperbarui...</>
          ) : isCompleted ? (
            <><CheckCircle /> Trip Selesai</>
          ) : (
            currentAction.label
          )}
        </button>
      </div>
    </div>
  );
}
