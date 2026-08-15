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
  const [otp, setOtp] = useState("");
  const [bookings, setBookings] = useState([]);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

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

  const handleRequestOtp = async (e) => {
    e?.preventDefault();

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setRequestingOtp(true);

    try {
      const response = await fetch(`${API_BASE}/api/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep("otp");
      startCooldown();
      toast({
        title: "OTP Sent",
        description: "Enter the 6-digit OTP to view your bookings",
      });
    } catch (error) {
      console.error('Error requesting OTP:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{6}$/.test(otp)) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setVerifyingOtp(true);

    try {
      const verifyResponse = await fetch(`${API_BASE}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || 'OTP verification failed');
      }

      setLoading(true);

      const response = await fetch(`${API_BASE}/api/bookings/phone/${phoneNumber}`, {
        headers: { 'Authorization': `Bearer ${verifyData.token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data || []);
      setSearched(true);
      setStep("phone");

      if (data.data.length === 0) {
        toast({
          title: "No Bookings Found",
          description: "No bookings found for this phone number",
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("phone");
    setOtp("");
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
              <form onSubmit={handleRequestOtp}>
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
                      We'll send a one-time password to verify it's you
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={requestingOtp}
                  >
                    {requestingOtp ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change number ({phoneNumber})
                  </button>
                  <div>
                    <Label htmlFor="otp" className="flex items-center gap-2 text-base font-semibold mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      className="h-14 text-base text-center tracking-[0.5em] font-mono"
                      autoFocus
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      OTP sent to +91 {phoneNumber}
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        View My Bookings
                      </>
                    )}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={requestingOtp || cooldown > 0}
                      className="text-sm text-blue-600 hover:text-blue-700 disabled:text-slate-400"
                    >
                      {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              </form>
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