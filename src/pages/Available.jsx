import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star, 
  Phone, 
  Briefcase,
  User,
  Package,
  IndianRupee,
  ArrowLeft,
  Zap,
  XCircle,
  X,
  AlertCircle,
  Award,
  Send,
  Sparkles
} from "lucide-react";

const API_BASE = 'https://cooliemate.onrender.com';

const AvailablePorters = () => {
  const [bookingData, setBookingData] = useState(null);
  const [porters, setPorters] = useState([]);
  const [loadingPorters, setLoadingPorters] = useState(true);
  const [selectedPorter, setSelectedPorter] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [porterAccepted, setPorterAccepted] = useState(false);
  const [porterDeclined, setPorterDeclined] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [showApproaching, setShowApproaching] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", variant: "default" });
  const [autoRequestEnabled, setAutoRequestEnabled] = useState(true);
  const [autoRequestCountdown, setAutoRequestCountdown] = useState(null);
  const [hasAutoRequested, setHasAutoRequested] = useState(false);

  const toast = ({ title, description, variant = "default" }) => {
    setToastMessage({ title, description, variant });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const navigationState = window.history.state?.usr;
    
    if (navigationState) {
      console.log('📦 Booking data from navigation:', navigationState);
      setBookingData(navigationState);
      sessionStorage.setItem('bookingData', JSON.stringify(navigationState));
    } else {
      const savedData = sessionStorage.getItem('bookingData');
      if (savedData) {
        console.log('📦 Booking data from sessionStorage:', savedData);
        setBookingData(JSON.parse(savedData));
      } else {
        toast({
          title: "No Booking Data",
          description: "Please complete the booking form first",
          variant: "destructive",
        });
        console.warn('⚠️ No booking data found');
      }
    }
  }, []);

  useEffect(() => {
    if (!bookingData) return;

    const fetchAvailablePorters = async () => {
      try {
        setLoadingPorters(true);
        const url = `${API_BASE}/api/porters/available`;
        
        console.log('🔍 Fetching all available porters from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch porters');
        }

        const data = await response.json();
        console.log('📦 Available porters:', data);
        
        if (data.success && data.data) {
          setPorters(data.data);
          if (data.data.length === 0) {
            toast({
              title: "No Porters Available",
              description: "No porters are currently online",
            });
          } else if (data.data.length === 1 && autoRequestEnabled && !hasAutoRequested) {
            // Auto-request if only one porter available
            setTimeout(() => {
              handleAutoRequest(data.data[0]);
            }, 1500);
          }
        } else {
          setPorters([]);
        }
      } catch (error) {
        console.error('❌ Error fetching porters:', error);
        toast({
          title: "Error Loading Porters",
          description: "Could not load available porters. Please try again.",
          variant: "destructive",
        });
        setPorters([]);
      } finally {
        setLoadingPorters(false);
      }
    };

    fetchAvailablePorters();
  }, [bookingData]);

  useEffect(() => {
    if (porterAccepted) {
      setShowApproaching(true);
    }
  }, [porterAccepted]);

  useEffect(() => {
    if (!requestSent || !currentBookingId) {
      return;
    }

    console.log('🔄 Starting polling for booking:', currentBookingId);
    const startTime = Date.now();
    const timeoutDuration = 5 * 60 * 1000;

    const checkInterval = setInterval(async () => {
      if (Date.now() - startTime > timeoutDuration) {
        clearInterval(checkInterval);
        setWaitingForResponse(false);
        toast({
          title: "Request Timeout",
          description: "Porter hasn't responded yet. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/bookings/${currentBookingId}`);
        
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        
        if (data.booking && data.booking.status === "accepted") {
          clearInterval(checkInterval);
          setWaitingForResponse(false);
          setPorterAccepted(true);
          toast({
            title: "Request Accepted! 🎉",
            description: `${selectedPorter.name} has accepted your request`,
          });
        } else if (data.booking && data.booking.status === "declined") {
          clearInterval(checkInterval);
          setWaitingForResponse(false);
          setPorterDeclined(true);
          toast({
            title: "Request Declined",
            description: `${selectedPorter.name} is unable to accept this request`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("❌ Error checking booking status:", error);
      }
    }, 2000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [requestSent, currentBookingId, selectedPorter]);

  // Countdown timer for auto-request
  useEffect(() => {
    if (autoRequestCountdown === null) return;

    if (autoRequestCountdown <= 0) {
      setAutoRequestCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setAutoRequestCountdown(autoRequestCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoRequestCountdown]);

  const handleAutoRequest = async (porter) => {
    if (!bookingData || hasAutoRequested) return;

    console.log('🤖 Auto-requesting from porter:', porter.name);
    setHasAutoRequested(true);
    setAutoRequestEnabled(false);
    
    await handleSendRequest(porter);
  };

  const handleSendRequest = async (porter) => {
    if (!bookingData) {
      toast({
        title: "Error",
        description: "Booking data is missing",
        variant: "destructive",
      });
      return;
    }

    console.log('📤 Sending request to porter:', porter);

    setSelectedPorter(porter);
    
    const bookingRequest = {
      porterId: porter.mongoId,
      porterName: porter.name,
      passengerName: bookingData.personalDetails?.fullName || "Guest",
      phone: bookingData.personalDetails?.phone || "N/A",
      pnr: bookingData.travelDetails?.pnr || "N/A",
      station: bookingData.travelDetails?.station || porter.station,
      trainNo: bookingData.travelDetails?.trainNo || "N/A",
      trainName: bookingData.travelDetails?.trainName || "N/A",
      coachNo: bookingData.travelDetails?.coachNo || "N/A",
      boardingStation: bookingData.travelDetails?.boardingStation || "N/A",
      boardingStationCode: bookingData.travelDetails?.boardingStationCode || "N/A",
      destinationStation: bookingData.travelDetails?.destinationStation || "N/A",
      destinationStationCode: bookingData.travelDetails?.destinationStationCode || "N/A",
      dateOfJourney: bookingData.travelDetails?.dateOfJourney || "N/A",
      arrivalTime: bookingData.travelDetails?.arrivalTime || "N/A",
      numberOfBags: bookingData.luggageDetails?.numberOfBags || 1,
      weight: bookingData.luggageDetails?.weight || 10,
      isLateNight: bookingData.luggageDetails?.isLateNight || false,
      isPriority: bookingData.luggageDetails?.isPriority || false,
      totalPrice: bookingData.pricing?.totalPrice || 100,
      notes: bookingData.notes || "",
    };

    console.log('📝 Booking request:', bookingRequest);

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      console.log('✅ Booking created successfully:', data);

      setCurrentBookingId(data.booking.id);
      setRequestSent(true);
      setWaitingForResponse(true);

      toast({
        title: "Request Sent ✓",
        description: `Request sent to ${porter.name}. Waiting for acceptance...`,
      });
    } catch (error) {
      console.error("❌ Error creating booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send request. Please try again.",
        variant: "destructive",
      });
      setRequestSent(false);
      setWaitingForResponse(false);
      setHasAutoRequested(false);
    }
  };

  const handleConfirmBooking = () => {
    setShowReviewPopup(true);
  };

  const handleSkipReview = () => {
    sessionStorage.removeItem('bookingData');
    window.location.href = "/";
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);

    try {
      const reviewData = {
        bookingId: currentBookingId,
        userName: bookingData.personalDetails?.fullName,
        userPhone: bookingData.personalDetails?.phone,
        rating: rating,
        comment: review || "Great service!",
        experience: rating >= 4 ? "excellent" : rating >= 3 ? "good" : rating >= 2 ? "average" : "poor",
        porterRating: rating,
        porterId: selectedPorter.id,
        porterName: selectedPorter.name
      };

      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast({
        title: "Thank You! ⭐",
        description: "Your review has been submitted successfully",
      });

      setTimeout(() => {
        handleSkipReview();
      }, 1500);
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      toast({
        title: "Review Error",
        description: "Failed to submit review, but you can continue to home",
        variant: "destructive",
      });
      handleSkipReview();
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBackToBooking = () => {
    window.history.back();
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-gray-700 font-medium">Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {showToast && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={`border rounded-xl shadow-xl p-4 max-w-md mx-auto backdrop-blur-sm ${
            toastMessage.variant === "destructive" 
              ? "bg-red-50 border-red-200" 
              : "bg-white border-blue-200"
          }`}>
            <p className="font-semibold text-sm text-gray-900">{toastMessage.title}</p>
            <p className="text-xs text-gray-600 mt-1">{toastMessage.description}</p>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-3 text-gray-700 hover:bg-gray-100" onClick={handleBackToBooking}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Porters</h1>
            <p className="text-sm text-gray-600 mt-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              {bookingData.travelDetails?.station || "your station"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20 max-w-6xl mx-auto">
        {/* Booking Summary */}
        <Card className="mb-6 shadow-md border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Your Booking Summary
              </span>
              {currentBookingId && (
                <span className="text-xs font-mono text-blue-100">#{currentBookingId.slice(0, 8)}</span>
              )}
            </CardTitle>
          </div>
          <CardContent className="p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Passenger</p>
                  <p className="font-semibold text-gray-900">{bookingData.personalDetails?.fullName}</p>
                  <p className="text-xs text-gray-600">{bookingData.personalDetails?.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Station</p>
                  <p className="font-semibold text-gray-900">{bookingData.travelDetails?.station}</p>
                  <p className="text-xs text-gray-600">Train: {bookingData.travelDetails?.trainNo}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Luggage</p>
                  <p className="font-semibold text-gray-900">{bookingData.luggageDetails?.numberOfBags} Bags</p>
                  <p className="text-xs text-gray-600">{bookingData.luggageDetails?.weight} kg</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IndianRupee className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total Price</p>
                  <p className="font-bold text-lg text-green-600">₹{bookingData.pricing?.totalPrice}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto Request Banner */}
        {autoRequestEnabled && !hasAutoRequested && porters.length === 1 && (
          <Card className="mb-6 shadow-md border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Smart Auto-Request Enabled</p>
                <p className="text-xs text-amber-700 mt-0.5">Automatically sending request to the best available porter...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Porter Cards */}
        {loadingPorters ? (
          <Card className="shadow-md border-gray-100">
            <CardContent className="py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-700 font-medium">Searching for available porters...</p>
              </div>
            </CardContent>
          </Card>
        ) : porters.length === 0 ? (
          <Card className="shadow-md border-gray-100">
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 mx-auto text-yellow-500" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">No Porters Available</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    No porters are online at {bookingData.travelDetails?.station} right now
                  </p>
                </div>
                <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {porters.map((porter) => (
              <Card key={porter._id} className="shadow-md border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {porter.badge && (
                          <Badge className="bg-amber-500 text-white text-[10px] flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {porter.badge}
                          </Badge>
                        )}
                        <Badge className="bg-green-100 text-green-700 text-[10px] font-semibold">
                          <Zap className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{porter.name}</h3>
                    </div>
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0 border-2 border-blue-200">
                      <img
                        src={porter.photo}
                        alt={porter.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect fill='%23ddd' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='%23999'%3E${porter.name.charAt(0)}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Stats */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-sm text-gray-900">{porter.rating}</span>
                      <span className="text-xs text-gray-600">rating</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-sm text-gray-900">{porter.totalTrips}</span>
                      <span className="text-xs text-gray-600">trips</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-gray-700">{porter.experience}</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Badge ID</p>
                      <p className="font-mono font-bold text-sm text-gray-900 truncate">{porter.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Station</p>
                      <p className="font-semibold text-sm text-gray-900 truncate">{porter.station}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Contact</p>
                      <p className="font-semibold text-sm text-gray-900 truncate">{porter.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Specialty</p>
                      <p className="font-semibold text-sm text-gray-900 truncate">{porter.specialization}</p>
                    </div>
                  </div>

                  {/* Languages */}
                  {porter.languages.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {porter.languages.slice(0, 3).map((lang) => (
                          <Badge key={lang} variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Section */}
                  {selectedPorter?.id === porter.id ? (
                    <>
                      {waitingForResponse && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                          <Loader2 className="w-10 h-10 mx-auto mb-2 animate-spin text-blue-600" />
                          <p className="font-bold text-sm text-blue-900">Request Sent</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Waiting for {porter.name} to respond...
                          </p>
                        </div>
                      )}

                      {porterAccepted && showApproaching && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                          <div className="text-center mb-3">
                            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-600 animate-pulse" />
                            <p className="font-bold text-base text-green-900">Booking Confirmed! 🎉</p>
                            <p className="text-sm text-green-700 mt-1">{porter.name} is on the way</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 space-y-2 text-xs mb-4 border border-green-100">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-600" />
                              <span className="font-medium truncate">{porter.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{porter.station} Station</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-green-600" />
                              <span className="font-medium">ETA: 1-2 minutes</span>
                            </div>
                          </div>
                          <Button onClick={handleConfirmBooking} className="w-full bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Complete Booking
                          </Button>
                        </div>
                      )}

                      {porterDeclined && (
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-lg p-4 text-center">
                          <XCircle className="w-10 h-10 mx-auto mb-2 text-red-600" />
                          <p className="font-semibold text-sm text-red-900">Request Declined</p>
                          <p className="text-xs text-red-700 mt-1">
                            {porter.name} cannot accept this request right now
                          </p>
                          <Button size="sm" className="mt-3 w-full bg-red-600 hover:bg-red-700" onClick={() => window.location.reload()}>
                            Try Another Porter
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => handleSendRequest(porter)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                      size="sm"
                      disabled={requestSent}
                    >
                      <Send className="w-4 h-4" />
                      Send Request
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Popup Modal */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm">
          <Card className="w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader className="relative pb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-white/20 text-white"
                onClick={handleSkipReview}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="text-2xl pr-8">
                Rate Your Experience
              </CardTitle>
              <p className="text-sm text-blue-100 mt-1">
                How was your service with {selectedPorter?.name}?
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pb-6 p-6">
              {/* Star Rating */}
              <div className="flex flex-col items-center">
                <p className="text-sm font-bold text-gray-900 mb-3">Your Rating</p>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-all active:scale-95 hover:scale-110"
                    >
                      <Star
                        className={`w-11 h-11 sm:w-12 sm:h-12 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-3 font-semibold">
                    {rating === 5 && "Excellent! ⭐⭐⭐⭐⭐"}
                    {rating === 4 && "Very Good! 😊"}
                    {rating === 3 && "Good 👍"}
                    {rating === 2 && "Could be better 🤔"}
                    {rating === 1 && "Needs improvement 😞"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Share your experience (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us what you think about the service..."
                  className="w-full min-h-[100px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {review.length}/500 characters
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-2 text-gray-700 hover:bg-gray-50"
                  onClick={handleSkipReview}
                  disabled={submittingReview}
                  size="sm"
                >
                  Skip
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || rating === 0}
                  size="sm"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 pt-2 border-t border-gray-100">
                Your feedback helps us improve our service quality
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AvailablePorters;
