import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { mockPNRData, calculatePrice, mockPorters } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, IndianRupee } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";

const BookPorter = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pnr: "",
    station: "",
    numberOfBags: "",
    weight: "",
    travelDate: "",
    travelTime: "",
    notes: "",
    isLateNight: false,
    isPriority: false,
  });

  const [pnrInfo, setPnrInfo] = useState<{
    trainNo: string;
    coachNo: string;
    trainName: string;
    destinationStation?: string;
    destinationStationCode?: string;
    arrivalTime?: string;
    boardingStation?: string;
    boardingStationCode?: string;
    dateOfJourney?: string;
  } | null>(null);
  const [pricing, setPricing] = useState<ReturnType<
    typeof calculatePrice
  > | null>(null);
  const [assignedPorter, setAssignedPorter] = useState<
    (typeof mockPorters)[0] | null
  >(null);
  const [pnrLoading, setPnrLoading] = useState(false);

  // Helper function to format date from various formats to YYYY-MM-DD
  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return "";

    try {
      // Handle DD-MM-YYYY format
      if (dateStr.includes("-") && dateStr.split("-")[0].length === 2) {
        const [day, month, year] = dateStr.split("-");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      // Handle DD/MM/YYYY format
      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      // Handle YYYY-MM-DD format (already correct)
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }

      // Try to parse as date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error("Date formatting error:", e);
    }

    return "";
  };

  // Helper function to format time to HH:MM
  const formatTimeForInput = (timeStr: string): string => {
    if (!timeStr) return "";

    try {
      // Handle HH:MM format (already correct)
      if (timeStr.match(/^\d{2}:\d{2}$/)) {
        return timeStr;
      }

      // Handle HH:MM:SS format
      if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return timeStr.substring(0, 5);
      }

      // Handle 12-hour format with AM/PM
      const time12hrMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (time12hrMatch) {
        let hours = parseInt(time12hrMatch[1]);
        const minutes = time12hrMatch[2];
        const period = time12hrMatch[3].toUpperCase();

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        return `${String(hours).padStart(2, "0")}:${minutes}`;
      }
    } catch (e) {
      console.error("Time formatting error:", e);
    }

    return "";
  };

  const handlePNRLookup = async () => {
    if (formData.pnr.length !== 10) {
      toast({
        title: "Invalid PNR",
        description: "PNR number must be 10 digits",
        variant: "destructive",
      });
      return;
    }

    setPnrLoading(true);

    try {
      // Using RapidAPI's PNR Status API with axios
      const response = await axios.get(
        `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${formData.pnr}`,
        {
          headers: {
            "X-RapidAPI-Key":
              "a573387291mshe81994cefb4fb8fp1cc772jsna726329b87de", // Replace with your actual API key
            "X-RapidAPI-Host": "irctc-indian-railway-pnr-status.p.rapidapi.com",
          },
        }
      );

      const data = response.data;

      // Parse the API response
      if (data.success && data.data) {
        const pnrData = data.data;
        const info = {
          trainNo: pnrData.trainNumber || pnrData.train_number || "",
          trainName: pnrData.trainName || pnrData.train_name || "",
          coachNo:
            pnrData.passengers?.[0]?.coach ||
            pnrData.passengers?.[0]?.currentCoach ||
            "",
          destinationStation:
            pnrData.destinationStation || pnrData.to_station || "",
          destinationStationCode:
            pnrData.to || pnrData.destinationStationCode || "",
          arrivalTime: pnrData.arrivalTime || pnrData.arrival_time || "",
          boardingStation: pnrData.boardingPoint || pnrData.from_station || "",
          boardingStationCode:
            pnrData.from || pnrData.boardingStationCode || "",
          dateOfJourney: pnrData.dateOfJourney || pnrData.doj || "",
        };

        setPnrInfo(info);

        // Auto-fill form fields with formatted values
        const updates: any = {};

        if (info.destinationStation && info.destinationStationCode) {
          updates.station = `${info.destinationStation} (${info.destinationStationCode})`;
        } else if (info.destinationStation) {
          updates.station = info.destinationStation;
        }

        if (info.dateOfJourney) {
          const formattedDate = formatDateForInput(info.dateOfJourney);
          if (formattedDate) {
            updates.travelDate = formattedDate;
          }
        }

        if (info.arrivalTime) {
          const formattedTime = formatTimeForInput(info.arrivalTime);
          if (formattedTime) {
            updates.travelTime = formattedTime;
          }
        }

        // Update form data with all fields at once
        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({ ...prev, ...updates }));
        }

        toast({
          title: "PNR Verified & Auto-filled!",
          description: `Train ${info.trainNo} - ${info.trainName}. Station, date & time updated.`,
        });
      } else {
        throw new Error("Invalid PNR or no data found");
      }
    } catch (error) {
      console.error("PNR lookup error:", error);

      // Fallback to mock data for testing
      const info = mockPNRData[formData.pnr];
      if (info) {
        setPnrInfo(info);

        // Auto-fill with mock data
        const updates: any = {};

        if (info.destinationStation && info.destinationStationCode) {
          updates.station = `${info.destinationStation} (${info.destinationStationCode})`;
        }

        if (info.dateOfJourney) {
          const formattedDate = formatDateForInput(info.dateOfJourney);
          if (formattedDate) updates.travelDate = formattedDate;
        }

        if (info.arrivalTime) {
          const formattedTime = formatTimeForInput(info.arrivalTime);
          if (formattedTime) updates.travelTime = formattedTime;
        }

        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({ ...prev, ...updates }));
        }

        toast({
          title: "PNR Verified (Demo Mode)",
          description: `Train ${info.trainNo} - ${info.trainName}. Fields auto-filled!`,
        });
      } else {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Unknown error occurred";

        toast({
          title: "PNR Lookup Failed",
          description: `Error: ${errorMessage}. For demo, try: 1234567890`,
          variant: "destructive",
        });
      }
    } finally {
      setPnrLoading(false);
    }
  };

  const handleCalculatePrice = () => {
    if (formData.numberOfBags && formData.weight) {
      const price = calculatePrice(
        parseInt(formData.numberOfBags),
        parseInt(formData.weight),
        formData.isLateNight,
        formData.isPriority
      );
      setPricing(price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.pnr ||
      !formData.station ||
      !formData.numberOfBags ||
      !formData.weight ||
      !formData.travelDate ||
      !formData.travelTime
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be 10 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate booking process
    setTimeout(() => {
      const porter =
        mockPorters[Math.floor(Math.random() * mockPorters.length)];
      setAssignedPorter(porter);
      setBookingSuccess(true);
      setLoading(false);

      toast({
        title: "Booking Confirmed!",
        description: `Porter ${porter.name} has been assigned to you`,
      });
    }, 2000);
  };

  if (bookingSuccess && assignedPorter) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto shadow-elevated">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Passenger Name</p>
                    <p className="font-medium">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PNR Number</p>
                    <p className="font-medium">{formData.pnr}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Station</p>
                    <p className="font-medium">{formData.station}</p>
                  </div>
                  {pnrInfo && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Train Number</p>
                        <p className="font-medium">
                          {pnrInfo.trainNo} - {pnrInfo.trainName}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Coach Number</p>
                        <p className="font-medium">{pnrInfo.coachNo}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-muted-foreground">Luggage</p>
                    <p className="font-medium">
                      {formData.numberOfBags} bags, {formData.weight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Travel Date & Time</p>
                    <p className="font-medium">
                      {formData.travelDate} at {formData.travelTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Assigned Porter</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {assignedPorter.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{assignedPorter.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {assignedPorter.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ⭐ {assignedPorter.rating} • {assignedPorter.experience}{" "}
                      experience
                    </p>
                  </div>
                </div>
              </div>

              {pricing && (
                <div className="bg-secondary/10 p-6 rounded-lg space-y-3">
                  <h3 className="font-semibold text-lg flex items-center">
                    <IndianRupee className="w-5 h-5 mr-1" />
                    Fare Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {pricing.description}
                      </span>
                      <span className="font-medium">₹{pricing.basePrice}</span>
                    </div>
                    {pricing.lateNightCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Late Night Charge
                        </span>
                        <span className="font-medium">
                          ₹{pricing.lateNightCharge}
                        </span>
                      </div>
                    )}
                    {pricing.priorityCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Priority Service
                        </span>
                        <span className="font-medium">
                          ₹{pricing.priorityCharge}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-primary">
                        ₹{pricing.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button onClick={() => navigate("/")} className="w-full">
                  Back to Home
                </Button>
                <Button
                  onClick={() => {
                    setBookingSuccess(false);
                    setFormData({
                      fullName: "",
                      phone: "",
                      pnr: "",
                      station: "",
                      numberOfBags: "",
                      weight: "",
                      travelDate: "",
                      travelTime: "",
                      notes: "",
                      isLateNight: false,
                      isPriority: false,
                    });
                    setPnrInfo(null);
                    setPricing(null);
                    setAssignedPorter(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Book Another Porter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-4 pb-8">
        <Card className="max-w-2xl mx-auto shadow-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl md:text-3xl text-center">
              Book Your Porter
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Fill in your travel details for instant porter booking
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      placeholder="10 digit number"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Travel Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Travel Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="pnr">PNR Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pnr"
                      value={formData.pnr}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pnr: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      placeholder="10 digit PNR"
                      maxLength={10}
                      required
                    />
                    <Button
                      type="button"
                      onClick={handlePNRLookup}
                      variant="secondary"
                      disabled={pnrLoading}
                    >
                      {pnrLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                  {pnrInfo && (
                    <div className="text-sm space-y-1 bg-green-50 p-3 rounded-md border border-green-200">
                      <p className="text-green-700 font-medium flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Train {pnrInfo.trainNo} - {pnrInfo.trainName}, Coach{" "}
                        {pnrInfo.coachNo}
                      </p>
                      {pnrInfo.boardingStation && (
                        <p className="text-muted-foreground">
                          <strong>From:</strong> {pnrInfo.boardingStation} (
                          {pnrInfo.boardingStationCode})
                        </p>
                      )}
                      {pnrInfo.destinationStation && (
                        <p className="text-muted-foreground">
                          <strong>To:</strong> {pnrInfo.destinationStation} (
                          {pnrInfo.destinationStationCode})
                        </p>
                      )}
                      {pnrInfo.arrivalTime && (
                        <p className="text-muted-foreground">
                          <strong>Arrival:</strong> {pnrInfo.arrivalTime}
                        </p>
                      )}
                      {pnrInfo.dateOfJourney && (
                        <p className="text-muted-foreground">
                          <strong>Date:</strong> {pnrInfo.dateOfJourney}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station">Destination Station *</Label>
                  <Input
                    id="station"
                    value={formData.station}
                    onChange={(e) =>
                      setFormData({ ...formData, station: e.target.value })
                    }
                    placeholder="e.g., Chennai Central"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be auto-filled when you verify PNR
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="travelDate">Travel Date *</Label>
                    <Input
                      id="travelDate"
                      type="date"
                      value={formData.travelDate}
                      onChange={(e) =>
                        setFormData({ ...formData, travelDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="travelTime">Arrival Time *</Label>
                    <Input
                      id="travelTime"
                      type="time"
                      value={formData.travelTime}
                      onChange={(e) =>
                        setFormData({ ...formData, travelTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Luggage Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Luggage Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfBags">Number of Bags *</Label>
                    <Input
                      id="numberOfBags"
                      type="number"
                      min="1"
                      value={formData.numberOfBags}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          numberOfBags: e.target.value,
                        });
                        handleCalculatePrice();
                      }}
                      placeholder="e.g., 3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Approx Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      value={formData.weight}
                      onChange={(e) => {
                        setFormData({ ...formData, weight: e.target.value });
                        handleCalculatePrice();
                      }}
                      placeholder="e.g., 35"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lateNight"
                      checked={formData.isLateNight}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          isLateNight: checked as boolean,
                        });
                        handleCalculatePrice();
                      }}
                    />
                    <Label
                      htmlFor="lateNight"
                      className="text-sm cursor-pointer"
                    >
                      Late Night Service (11 PM - 5 AM) +₹20
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="priority"
                      checked={formData.isPriority}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          isPriority: checked as boolean,
                        });
                        handleCalculatePrice();
                      }}
                    />
                    <Label
                      htmlFor="priority"
                      className="text-sm cursor-pointer"
                    >
                      Priority Service +₹30
                    </Label>
                  </div>
                </div>
              </div>

              {/* Pricing Display */}
              {pricing && (
                <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    Estimated Fare
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {pricing.description}
                      </span>
                      <span>₹{pricing.basePrice}</span>
                    </div>
                    {pricing.lateNightCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Late Night
                        </span>
                        <span>₹{pricing.lateNightCharge}</span>
                      </div>
                    )}
                    {pricing.priorityCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <span>₹{pricing.priorityCharge}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{pricing.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any special requirements or instructions..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookPorter;
