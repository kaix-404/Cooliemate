import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Search, Package, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
const API_BASE = 'https://cooliemate-v2.onrender.com';

const MyBookings = () => {
  const { toast } = useToast();
  const [step, setStep] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Missing Password",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    setLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/api/porter/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store authentication data in localStorage (matching PorterDashboard expectations)
      localStorage.setItem('porterToken', data.data.token);
      localStorage.setItem('porterId', data.data.id);
      localStorage.setItem('porterBadgeNumber', data.data.badgeNumber);
      localStorage.setItem('porterName', data.data.name);

      // Also store full porter data for easy access
      localStorage.setItem('porterData', JSON.stringify({
        token: data.data.token,
        id: data.data.id,
        phone: data.data.phone,
        badgeNumber: data.data.badgeNumber,
        name: data.data.name,
        station: data.data.station,
        image: data.data.image,
        rating: data.data.rating,
        totalTrips: data.data.totalTrips,
        experience: data.data.experience || '1 year',
        specialization: data.data.specialization || 'General Luggage',
        languages: data.data.languages || ['English', 'Hindi'],
        isOnline: data.data.isOnline
      }));

      setStep("phone");
      setPhoneNumber("");
      setPassword("");

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.data.name}! You are now online.`,
        variant: "success",
      });

      setTimeout(() => {
        navigate("/porter-dashboard");
      }, 1000);
    } catch (error) {
      console.error('Error logging in:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoggingIn(false);
    }
  };

  const handleBack = () => {
    setStep("phone");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <Navbar />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            My Bookings
          </h1>
          <p className="text-slate-600">
            Track your porter service bookings
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8 shadow-xl">
          <CardContent className="pt-6">
            {step === "phone" ? (
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2 text-base font-semibold mb-2">
                      <Phone className="w-4 h-4" />
                      Enter Your Mobile Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter your 10-digit mobile number"
                      maxLength={10}
                      className="h-14 text-base"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Enter your password to access your bookings
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="password" className="flex items-center gap-2 text-base font-semibold mb-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      maxLength={32}
                      className="h-14 text-base"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={loggingIn}
                  >
                    {loggingIn ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        Login
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Your Bookings ({bookings.length})
                </h2>
                {bookings.map((booking) => (
                  <Card key={booking._id} className="shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{booking.passengerName}</h3>
                          <p className="text-sm text-slate-500">
                            Booking ID: {booking._id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold ">
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Porter</p>
                          <p className="font-semibold">{booking.porterName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Station</p>
                          <p className="font-semibold">{booking.station}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Train</p>
                          <p className="font-semibold">{booking.trainNo} - {booking.trainName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Date</p>
                          <p className="font-semibold">{booking.dateOfJourney}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Luggage</p>
                          <p className="font-semibold">{booking.numberOfBags} bags, {booking.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Total Price</p>
                          <p className="font-semibold text-green-600">₹{booking.totalPrice}</p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Notes:</p>
                          <p className="text-sm">{booking.notes}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t text-xs text-slate-500">
                        Booked on: {new Date(booking.createdAt).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Bookings List */}
        {searched && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 text-lg">No bookings found</p>
                  <p className="text-slate-500 text-sm mt-2">
                    You haven't made any bookings with this number yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Your Bookings ({bookings.length})
                </h2>
                {bookings.map((booking) => (
                  <Card key={booking._id} className="shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{booking.passengerName}</h3>
                          <p className="text-sm text-slate-500">
                            Booking ID: {booking._id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Porter</p>
                          <p className="font-semibold">{booking.porterName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Station</p>
                          <p className="font-semibold">{booking.station}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Train</p>
                          <p className="font-semibold">{booking.trainNo} - {booking.trainName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Date</p>
                          <p className="font-semibold">{booking.dateOfJourney}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Luggage</p>
                          <p className="font-semibold">{booking.numberOfBags} bags, {booking.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Total Price</p>
                          <p className="font-semibold text-green-600">₹{booking.totalPrice}</p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Notes:</p>
                          <p className="text-sm">{booking.notes}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t text-xs text-slate-500">
                        Booked on: {new Date(booking.createdAt).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;