// Mock PNR data for demo
export const mockPNRData = {
  1234567890: { trainNo: "12109", coachNo: "B2", trainName: "Mumbai LTT Exp" },
  9876543210: { trainNo: "16022", coachNo: "S1", trainName: "Kaveri Express" },
  1122334455: { trainNo: "22690", coachNo: "A1", trainName: "Dehradun Exp" },
};

// Mock porter data
export const mockPorters = [
  {
    id: "1",
    name: "Raj Kumar",
    phone: "9876543210",
    station: "Chennai Central",
    rating: 4.8,
    experience: "5 years",
    avatar: "RK",
  },
  {
    id: "2",
    name: "Santosh Yadav",
    phone: "9123456789",
    station: "Secunderabad Junction",
    rating: 4.9,
    experience: "7 years",
    avatar: "SY",
  },
  {
    id: "3",
    name: "Pradeep Singh",
    phone: "9988776655",
    station: "New Delhi",
    rating: 4.7,
    experience: "4 years",
    avatar: "PS",
  },
];

// Pricing calculation
export const calculatePrice = (
  numberOfBags,
  weight,
  isLateNight,
  isPriority
) => {
  let basePrice = 99;
  let description = "1-2 bags, ≤20 kg";

  if (numberOfBags >= 5 || weight > 40) {
    basePrice = 199;
    description = "5+ bags or >40 kg";
  } else if (numberOfBags >= 3 || weight > 20) {
    basePrice = 149;
    description = "3-4 bags, 21-40 kg";
  }

  const lateNightCharge = isLateNight ? 20 : 0;
  const priorityCharge = isPriority ? 30 : 0;
  const totalPrice = basePrice + lateNightCharge + priorityCharge;

  return {
    basePrice,
    lateNightCharge,
    priorityCharge,
    totalPrice,
    description,
  };
};

// Mock bookings data store (simulating a database)
let bookingsStore = [
  {
    id: "1",
    passengerName: "Ravi Kumar",
    phone: "9876543210",
    email: "ravi.kumar@email.com",
    pnr: "1234567890",
    trainNo: "12109",
    trainName: "Mumbai LTT Exp",
    coachNo: "B2",
    station: "Chennai Central",
    bags: 3,
    weight: 35,
    amount: 149,
    date: "2025-10-15",
    time: "14:30",
    notes: "Heavy luggage, need help to platform 2",
    status: "completed",
    assignedPorter: "Raj Kumar",
    porterId: "1",
    bookedAt: "2025-10-14 10:30 AM",
    completedAt: "2025-10-15 15:00 PM",
  },
  {
    id: "2",
    passengerName: "Priya Sharma",
    phone: "9123456789",
    email: "priya.sharma@email.com",
    pnr: "9876543210",
    trainNo: "16022",
    trainName: "Kaveri Express",
    coachNo: "S1",
    station: "Chennai Central",
    bags: 2,
    weight: 18,
    amount: 99,
    date: "2025-10-15",
    time: "16:45",
    notes: "",
    status: "accepted",
    assignedPorter: "Raj Kumar",
    porterId: "1",
    bookedAt: "2025-10-14 11:15 AM",
    completedAt: null,
  },
  {
    id: "3",
    passengerName: "Amit Patel",
    phone: "9988776655",
    email: "amit.patel@email.com",
    pnr: "1122334455",
    trainNo: "22690",
    trainName: "Dehradun Exp",
    coachNo: "A1",
    station: "Secunderabad Junction",
    bags: 5,
    weight: 45,
    amount: 199,
    date: "2025-10-16",
    time: "09:00",
    notes: "5 large suitcases",
    status: "pending",
    assignedPorter: null,
    porterId: null,
    bookedAt: "2025-10-14 02:20 PM",
    completedAt: null,
  },
];

// Functions to manage bookings
export const getAllBookings = () => {
  return [...bookingsStore];
};

export const addBooking = (booking) => {
  const newBooking = {
    ...booking,
    id: Date.now().toString(),
    status: "pending",
    assignedPorter: null,
    porterId: null,
    bookedAt: new Date().toLocaleString(),
    completedAt: null,
  };
  bookingsStore.push(newBooking);
  return newBooking;
};

export const updateBookingStatus = (bookingId, status, completedAt = null) => {
  bookingsStore = bookingsStore.map((b) =>
    b.id === bookingId ? { ...b, status, completedAt } : b
  );
  return bookingsStore.find((b) => b.id === bookingId);
};

export const assignPorterToBooking = (bookingId, porterName, porterId) => {
  bookingsStore = bookingsStore.map((b) =>
    b.id === bookingId
      ? { ...b, assignedPorter: porterName, porterId, status: "assigned" }
      : b
  );
  return bookingsStore.find((b) => b.id === bookingId);
};

export const getPorterBookings = (porterId) => {
  return bookingsStore.filter((b) => b.porterId === porterId);
};
