// lib/mockData.ts or @/lib/mockData.ts

interface PNRData {
  trainNo: string;
  coachNo: string;
  trainName: string;
  destinationStation?: string;
  destinationStationCode?: string;
  arrivalTime?: string;
  boardingStation?: string;
  boardingStationCode?: string;
  dateOfJourney?: string;
}

export const mockPNRData: Record<string, PNRData> = {
  "1234567890": {
    trainNo: "12345",
    trainName: "Shatabdi Express",
    coachNo: "A1",
    destinationStation: "Chennai Central",
    destinationStationCode: "MAS",
    arrivalTime: "14:30",
    boardingStation: "Bangalore City",
    boardingStationCode: "SBC",
    dateOfJourney: "2025-10-15",
  },
  "9876543210": {
    trainNo: "67890",
    trainName: "Rajdhani Express",
    coachNo: "B2",
    destinationStation: "New Delhi",
    destinationStationCode: "NDLS",
    arrivalTime: "08:15",
    boardingStation: "Mumbai Central",
    boardingStationCode: "BCT",
    dateOfJourney: "2025-10-16",
  },
  "1122334455": {
    trainNo: "11223",
    trainName: "Duronto Express",
    coachNo: "C3",
    destinationStation: "Kolkata",
    destinationStationCode: "HWH",
    arrivalTime: "22:45",
    boardingStation: "Pune Junction",
    boardingStationCode: "PUNE",
    dateOfJourney: "2025-10-17",
  },
};

interface PriceCalculation {
  basePrice: number;
  lateNightCharge: number;
  priorityCharge: number;
  totalPrice: number;
  description: string;
}

export const calculatePrice = (
  numberOfBags: number,
  weight: number,
  isLateNight: boolean,
  isPriority: boolean
): PriceCalculation => {
  let basePrice = 50;

  if (numberOfBags > 3) {
    basePrice += (numberOfBags - 3) * 15;
  }

  if (weight > 30) {
    basePrice += Math.floor((weight - 30) / 10) * 10;
  }

  const lateNightCharge = isLateNight ? 20 : 0;
  const priorityCharge = isPriority ? 30 : 0;

  return {
    basePrice,
    lateNightCharge,
    priorityCharge,
    totalPrice: basePrice + lateNightCharge + priorityCharge,
    description: `Base fare for ${numberOfBags} bag(s), ${weight}kg`,
  };
};

interface Porter {
  id: number;
  name: string;
  phone: string;
  rating: number;
  experience: string;
  avatar: string;
}

export const mockPorters: Porter[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    rating: 4.8,
    experience: "5 years",
    avatar: "RK",
  },
  {
    id: 2,
    name: "Amit Sharma",
    phone: "+91 98765 43211",
    rating: 4.9,
    experience: "7 years",
    avatar: "AS",
  },
  {
    id: 3,
    name: "Vijay Singh",
    phone: "+91 98765 43212",
    rating: 4.7,
    experience: "4 years",
    avatar: "VS",
  },
  {
    id: 4,
    name: "Suresh Patel",
    phone: "+91 98765 43213",
    rating: 4.6,
    experience: "6 years",
    avatar: "SP",
  },
];
