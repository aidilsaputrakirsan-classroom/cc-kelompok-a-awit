// Mock Data for Driver MVP
const MOCK_TRIPS = [
  {
    id: "trip-001",
    ticket_no: "TBS-2025-101",
    block_name: "Blok A1",
    vendor_name: "CV Maju Bersama",
    status: "PENDING", // PENDING, LOADING, ON_THE_WAY, WEIGHING, COMPLETED
    date: "2025-06-10",
  },
  {
    id: "trip-002",
    ticket_no: "TBS-2025-102",
    block_name: "Blok C3",
    vendor_name: "PT Kelapa Mas",
    status: "ON_THE_WAY",
    date: "2025-06-10",
  }
];

export const driverService = {
  getTrips: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_TRIPS];
  },
  
  getTripById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const trip = MOCK_TRIPS.find(t => t.id === id);
    if (!trip) throw new Error("Trip not found");
    return { ...trip };
  },

  updateTripStatus: async (id, newStatus) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const tripIndex = MOCK_TRIPS.findIndex(t => t.id === id);
    if (tripIndex === -1) throw new Error("Trip not found");
    
    // Update local mock data
    MOCK_TRIPS[tripIndex] = { ...MOCK_TRIPS[tripIndex], status: newStatus };
    return MOCK_TRIPS[tripIndex];
  }
};
