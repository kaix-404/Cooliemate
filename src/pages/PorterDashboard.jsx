import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  MapPin,
  Star,
  Briefcase,
  Phone,
  Clock,
  Package,
  IndianRupee,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  Bell,
  TrendingUp,
  Calendar,
  Award,
  Activity
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Footer";

const API_BASE = 'https://cooliemate.onrender.com';

const PorterDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [porterData, setPorterData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [processingBooking, setProcessingBooking] = useState(null);

  // Check authentication and load porter data
  useEffect(() => {
    const token = localStorage.getItem('porterToken');
    const porterId = localStorage.getItem('porterId');

    if (!token || !porterId) {
      toast({
        title: "Authentication Required",
        description: "Please login to access the dashboard",
        variant: "destructive",
      });
      navigate("/porter-login");
      return;
    }

    loadPorterData(token, porterId);
    loadBookings(porterId, token);

    // Poll for new bookings every 5 seconds
    const interval = setInterval(() => {
      loadBookings(porterId, token);
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate, toast]);

  const loadPorterData = async (token, porterId) => {
    try {
      const response = await fetch(`${API_BASE}/api/porter/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setPorterData(data.data);
      setIsOnline(data.data.isOnline);
      setLoading(false);
    } catch (error) {
      console.error('Error loading porter data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadBookings = async (porterId, token) => {
    try {
      console.log('Fetching bookings for porterId:', porterId);
      
      const response = await fetch(`${API_BASE}/api/porter/${porterId}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to load bookings, status:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error('Failed to load bookings');
      }

      const data = await response.json();
      console.log('Bookings loaded:', data);
      
      // Ensure data.data is always an array
      const bookingsArray = Array.isArray(data.data) ? data.data : [];
      setBookings(bookingsArray);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]); // Set empty array on error
    }
  };

  const handleStatusToggle = async (newStatus) => {
    if (!porterData) return;

    setUpdatingStatus(true);
    const token = localStorage.getItem('porterToken');

    try {
      const response = await fetch(`${API_BASE}/api/porter/${porterData._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isOnline: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setIsOnline(newStatus);
      toast({
        title: "Status Updated",
        description: `You are now ${newStatus ? 'online' : 'offline'}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    const token = localStorage.getItem('porterToken');
    const porterId = localStorage.getItem('porterId');
    
    setProcessingBooking(bookingId);

    try {
      console.log(`Attempting to ${action} booking:`, bookingId);
      
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed response:', errorData);
        throw new Error(errorData.message || `Failed to ${action} booking`);
      }

      const result = await response.json();
      console.log(`Booking ${action} successfully:`, result);

      toast({
        title: "Success",
        description: `Booking ${action} successfully`,
      });

      // Reload bookings
      await loadBookings(porterId, token);
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} booking`,
        variant: "destructive",
      });
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('porterToken');
    localStorage.removeItem('porterId');
    localStorage.removeItem('porterBadgeNumber');
    localStorage.removeItem('porterName');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    
    navigate("/porter-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!porterData) {
    return null;
  }

  // Safely filter bookings with fallback to empty array
  const pendingBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'pending') : [];
  const acceptedBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'accepted') : [];
  const completedBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'completed') : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg ring-4 ring-white/30">
                <img
                  src={`${API_BASE}/uploads/${porterData.image}`}
                  alt={porterData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect fill='%23ddd' width='64' height='64'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Welcome back, {porterData.name}</h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {porterData.station}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'} shadow-lg`} />
                      <span className="font-semibold text-lg">
                        {isOnline ? 'You are Online' : 'You are Offline'}
                      </span>
                    </div>
                    <Switch
                      checked={isOnline}
                      onCheckedChange={handleStatusToggle}
                      disabled={updatingStatus}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  <p className="text-blue-100 text-sm">
                    {isOnline ? 'You can receive new booking requests' : 'Turn on to start receiving bookings'}
                  </p>
                </div>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-900 mb-1">{porterData.rating}</p>
                    <p className="text-sm text-yellow-700 font-medium">Rating</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-green-900 mb-1">{porterData.totalTrips}</p>
                    <p className="text-sm text-green-700 font-medium">Total Trips</p>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Details */}
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Profile Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Badge Number</p>
                        <p className="font-semibold text-slate-900">{porterData.badgeNumber}</p>
                      </div>
                    </div>
                    {porterData.isVerified && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 py-3 border-b">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone Number</p>
                      <p className="font-semibold text-slate-900">{porterData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-3 border-b">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Experience</p>
                      <p className="font-semibold text-slate-900">{porterData.experience}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Specialization</p>
                      <p className="font-semibold text-slate-900">{porterData.specialization}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-slate-700 mb-3">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {(porterData.languages && porterData.languages.length > 0
                        ? porterData.languages
                        : ["Telugu"]
                      ).map((lang) => (
                        <Badge key={lang} variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Pending Requests */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg">Pending Requests</p>
                      <p className="text-sm font-normal text-slate-600">{pendingBookings.length} waiting for response</p>
                    </div>
                  </CardTitle>
                  {pendingBookings.length > 0 && (
                    <Badge className="bg-orange-500 text-white px-3 py-1 text-base">
                      {pendingBookings.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-10 h-10 text-orange-400" />
                    </div>
                    <p className="text-slate-900 font-semibold mb-1">No Pending Requests</p>
                    <p className="text-sm text-slate-500">New booking requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <Card key={booking._id} className="border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                                  {booking.passengerName.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-slate-900">{booking.passengerName}</h4>
                                  <p className="text-sm text-slate-600 flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    {booking.phone}
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-orange-100 text-orange-700 border border-orange-300">
                                New Request
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                              <div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Train Details</p>
                                <p className="font-semibold text-slate-900">{booking.trainNo}</p>
                                <p className="text-sm text-slate-600">{booking.trainName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Coach Number</p>
                                <p className="font-semibold text-slate-900 text-lg">{booking.coachNo}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Luggage</p>
                                <p className="font-semibold text-slate-900">{booking.numberOfBags} bags</p>
                                <p className="text-sm text-slate-600">{booking.weight} kg</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Payment</p>
                                <p className="font-bold text-green-600 text-xl">₹{booking.totalPrice}</p>
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                                  <Activity className="w-3.5 h-3.5" />
                                  Special Instructions
                                </p>
                                <p className="text-sm text-slate-700">{booking.notes}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <Button
                                className="bg-green-600 hover:bg-green-700 shadow-md font-semibold"
                                onClick={() => handleBookingAction(booking._id, 'accepted')}
                                disabled={processingBooking === booking._id}
                              >
                                {processingBooking === booking._id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Accept Booking
                              </Button>
                              <Button
                                variant="outline"
                                className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold"
                                onClick={() => handleBookingAction(booking._id, 'declined')}
                                disabled={processingBooking === booking._id}
                              >
                                {processingBooking === booking._id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4 mr-2" />
                                )}
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Bookings */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg">Active Bookings</p>
                    <p className="text-sm font-normal text-slate-600">{acceptedBookings.length} in progress</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {acceptedBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-slate-900 font-semibold mb-1">No Active Bookings</p>
                    <p className="text-sm text-slate-500">Accepted bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedBookings.map((booking) => (
                      <Card key={booking._id} className="border-2 border-blue-200 shadow-md">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                  {booking.passengerName.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-slate-900">{booking.passengerName}</h4>
                                  <p className="text-sm text-slate-600">{booking.phone}</p>
                                </div>
                              </div>
                              <Badge className="bg-blue-600 text-white">
                                <Activity className="w-3 h-3 mr-1" />
                                In Progress
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                              <div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Station</p>
                                <p className="font-semibold text-slate-900">{booking.station}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Date</p>
                                <p className="font-semibold text-slate-900">{booking.dateOfJourney}</p>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 shadow-md font-semibold"
                              onClick={() => handleBookingAction(booking._id, 'completed')}
                              disabled={processingBooking === booking._id}
                            >
                              {processingBooking === booking._id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Mark as Completed
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Bookings */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg">Completed Trips</p>
                    <p className="text-sm font-normal text-slate-600">{completedBookings.length} successful deliveries</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {completedBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-green-400" />
                    </div>
                    <p className="text-slate-900 font-semibold mb-1">No Completed Trips Yet</p>
                    <p className="text-sm text-slate-500">Your completed bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedBookings.slice(0, 5).map((booking) => (
                      <div key={booking._id} className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{booking.passengerName}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(booking.updatedAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700 text-lg">₹{booking.totalPrice}</p>
                          <Badge className="bg-green-600 text-white text-xs">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
       <div className="h-12 md:h-20"></div>
    </div>
  );
};

export default PorterDashboard;