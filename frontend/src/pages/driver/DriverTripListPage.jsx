import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { driverService } from "../../services/mockDriverService";
import { MapPin, Building, ArrowRight, Clock } from "lucide-react";

export default function DriverTripListPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await driverService.getTrips();
      // Only show non-completed trips in the active list
      setTrips(data.filter(t => t.status !== "COMPLETED"));
    } catch (err) {
      console.error("Failed to fetch trips", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      LOADING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      ON_THE_WAY: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      WEIGHING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
    
    const labelConfig = {
      PENDING: "Menunggu",
      LOADING: "Muat Buah",
      ON_THE_WAY: "Di Jalan",
      WEIGHING: "Timbang PKS",
      COMPLETED: "Selesai"
    };

    const confClass = statusConfig[status] || statusConfig.PENDING;
    const label = labelConfig[status] || labelConfig.PENDING;
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${confClass}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading trips...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white m-0">Tugas Hari Ini</h2>
      
      {trips.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">Tidak ada tugas hauling untuk saat ini.</p>
        </div>
      ) : (
        trips.map(trip => (
          <div 
            key={trip.id} 
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 cursor-pointer transition-transform active:scale-[0.98]"
            onClick={() => navigate(`/driver/trips/${trip.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{trip.ticket_no}</span>
                <div className="font-semibold text-gray-900 dark:text-white mt-1">{trip.date}</div>
              </div>
              {getStatusBadge(trip.status)}
            </div>

            <div className="relative mt-4 flex flex-col gap-2">
              <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500 ring-4 ring-white dark:ring-gray-800">
                  <MapPin size={12} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Ambil dari</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{trip.block_name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10 mt-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500 ring-4 ring-white dark:ring-gray-800">
                  <Building size={12} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Kirim ke</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{trip.vendor_name}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center text-emerald-600 dark:text-emerald-500 text-sm font-medium hover:text-emerald-700 transition-colors">
              Update Status <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
