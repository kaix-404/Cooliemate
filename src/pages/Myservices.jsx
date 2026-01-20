import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Search, Package, Loader2 } from "lucide-react";
import NaNvbar from "@/components/Navbar";
const API_BASE = 'https://cooliemate.onrender.com';

const MyBookings = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(false);

    try {
      const response = await fetch(`${API_BASE}/api/bookings/phone/${phoneNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data || []);
      setSearched(true);

      if (data.data.length === 0) {
        toast({
          title: "No Bookings Found",
          description: "No bookings found for this phone number",
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <NaNvbar />
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
            <form onSubmit={handleSearch}>
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
                  <p className="text-xs text-slate-500 mt-2">
                    Enter the phone number you used while booking
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      View My Bookings
                    </>
                  )}
                </Button>
              </div>
            </form>
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