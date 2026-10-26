import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Search, Package, Loader2, ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
const API_BASE = 'https://cooliemate-v2.onrender.com';

const MyBookings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showRegister, setShowRegister] = useState(false);
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
      const response = await fetch(`${API_BASE}/api/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store authentication data in localStorage
      localStorage.setItem('customerToken', data.data.token);
      localStorage.setItem('customerId', data.data.id);
      localStorage.setItem('customerPhone', data.data.phone);

      toast({
        title: "Login Successful",
        description: `Welcome back! You are now authenticated.`,
        variant: "success",
      });

      setTimeout(() => {
        navigate("/book");
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

  const handleRegister = async (e) => {
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

    if (!name) {
      toast({
        title: "Missing Name",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/api/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phoneNumber, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store authentication data in localStorage directly after registration
      localStorage.setItem("customerToken", data.data.token);
      localStorage.setItem("customerId", data.data.id);
      localStorage.setItem("customerPhone", data.data.phone);

      toast({
        title: "Registration Successful",
        description: "Welcome! You are now registered and logged in.",
        variant: "success",
      });

      // Redirect to Book Porter immediately after successful registration
      setTimeout(() => {
        navigate("/book");
      }, 800);
    } catch (error) {
      console.error("Error registering:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
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
              <div className="space-y-4">
                <div className="text-center mb-3">
                  {showRegister ? (
                    <Button variant="link" onClick={() => setShowRegister(false)}>Login</Button>
                  ) : (
                    <Button variant="link" onClick={() => setShowRegister(true)}>Register</Button>
                  )}
                </div>
                {showRegister ? (
                  <form onSubmit={handleRegister}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold mb-2">
                          Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          maxLength={50}
                          className="h-12 text-sm"
                          required
                        />
                      </div>
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
                          maxLength={64}
                          className="h-14 text-base"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600" disabled={loggingIn}>
                        {loggingIn ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-5 h-5 mr-2" />
                            Register
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
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
                          maxLength={64}
                          className="h-14 text-base"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600" disabled={loggingIn}>
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
                )}
              </div>
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
                          <p className="font-semibold text-green-600">&#x20B9;{booking.totalPrice}</p>
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
                        <span className="px-3 py-1 rounded-full text-sm font-semibold">
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
                          <p className="font-semibold text-green-600">&#x20B9;{booking.totalPrice}</p>
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
      </main>
    </div>
  );
};

export default MyBookings;
