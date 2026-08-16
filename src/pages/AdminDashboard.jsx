import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  Monitor,
  Smartphone,
  Tablet,
  Star,
  Eye,
  RefreshCw,
  Download,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Hash,
  MapPin,
  AlertCircle,
  Plus,
  Upload,
  Loader2,
  Bell,
  CheckCheck,
  Send
} from "lucide-react";

const API_BASE = 'https://cooliemate-v2.onrender.com';

const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleUnauthorized = (response) => {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminPhone');
    alert('Admin session expired. Please log in again.');
    window.location.href = '/porter-login';
    return true;
  }
  return false;
};

// Analytics tracking utility
const trackAnalytics = async (action = 'visit', page = window.location.pathname) => {
  try {
    const sessionId = sessionStorage.getItem('sessionId') || 
                      Math.random().toString(36).substring(7);
    sessionStorage.setItem('sessionId', sessionId);

    await fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        page,
        referrer: document.referrer,
        sessionId,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [porters, setPorters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portersLoading, setPortersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [newPorter, setNewPorter] = useState({
    name: "",
    phone: "",
    badgeNumber: "",
    station: "Kurnool Station",
    password: "",
  });
  const [newPorterImage, setNewPorterImage] = useState(null);
  const [addingPorter, setAddingPorter] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    // Track page visit on mount
    trackAnalytics('visit', '/admin/dashboard');
    
    fetchAnalytics();
    fetchPorters();
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/analytics/dashboard`, {
        headers: getAdminHeaders()
      });
      const data = await response.json();
      
      if (handleUnauthorized(response)) return;
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.message || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchPorters = async () => {
    try {
      setPortersLoading(true);
      const response = await fetch(`${API_BASE}/api/porters/debug`, {
        headers: getAdminHeaders()
      });
      const data = await response.json();
      
      if (handleUnauthorized(response)) return;
      
      if (data.success) {
        setPorters(data.porters);
      }
    } catch (error) {
      console.error('Error fetching porters:', error);
    } finally {
      setPortersLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/notifications`, {
        headers: getAdminHeaders()
      });
      const data = await response.json();

      if (handleUnauthorized(response)) return;

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/notifications/read-all`, {
        method: 'POST',
        headers: getAdminHeaders()
      });
      const data = await response.json();

      if (handleUnauthorized(response)) return;

      if (data.success) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  const testTelegram = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/telegram/test`, {
        method: 'POST',
        headers: getAdminHeaders()
      });
      const data = await response.json();

      if (handleUnauthorized(response)) return;

      if (data.success) {
        alert(data.message);
      } else {
        alert(`Telegram test failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error testing telegram:', error);
      alert(`Telegram test failed: ${error.message}`);
    }
  };

  const deletePorter = async (porter) => {
    if (!porter || !porter._id) {
      alert('Error: Porter ID not found');
      return;
    }

    const porterId = porter._id;
    const porterName = porter.name;

    if (!window.confirm(`Are you sure you want to delete ${porterName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(porterId);

      const response = await fetch(`${API_BASE}/api/admin/porter/${porterId}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      
      const data = await response.json();
      
      if (handleUnauthorized(response)) return;
      
      if (data.success) {
        setPorters(porters.filter(p => p._id !== porterId));
        alert(`Porter ${porterName} deleted successfully!`);
      } else {
        alert(`Failed to delete porter: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting porter:', error);
      alert(`Error deleting porter: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddPorter = async (e) => {
    e.preventDefault();

    if (!newPorter.name || !newPorter.phone || !newPorter.badgeNumber || !newPorter.station || !newPorter.password) {
      alert('All fields are required');
      return;
    }
    if (!/^[0-9]{10}$/.test(newPorter.phone)) {
      alert('Phone number must be a valid 10-digit number');
      return;
    }
    if (newPorter.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setAddingPorter(true);

    try {
      const formData = new FormData();
      formData.append('name', newPorter.name);
      formData.append('phone', newPorter.phone);
      formData.append('badgeNumber', newPorter.badgeNumber);
      formData.append('station', newPorter.station);
      formData.append('password', newPorter.password);
      formData.append('image', newPorterImage);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/porter/register`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add porter');
      }

      alert(`Porter ${data.data.name} added successfully! They can log in with this mobile number and password.`);

      setNewPorter({
        name: "",
        phone: "",
        badgeNumber: "",
        station: "Kurnool Station",
        password: "",
      });
      setNewPorterImage(null);
      e.target.reset();
      fetchPorters();
    } catch (error) {
      console.error('Error adding porter:', error);
      alert(`Failed to add porter: ${error.message}`);
    } finally {
      setAddingPorter(false);
    }
  };

  const getDeviceIcon = (device) => {
    switch(device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'declined': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-lg font-semibold mb-2">Failed to load analytics</p>
          <p className="text-muted-foreground mb-4">{error || 'Please check your connection'}</p>
          <Button onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">CooliMate Analytics & Insights</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { fetchAnalytics(); fetchNotifications(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('analytics')}
            className="px-6"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={activeTab === 'porters' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('porters')}
            className="px-6"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Porters
          </Button>
        </div>

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <>
            {/* Booking Notifications */}
            <Card className="shadow-lg mb-8 border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  New Booking Alerts
                  {unreadCount > 0 && (
                    <Badge className="bg-red-100 text-red-700">{unreadCount} new</Badge>
                  )}
                </CardTitle>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllRead}>
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={testTelegram}>
                  <Send className="w-4 h-4 mr-2" />
                  Test Telegram
                </Button>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No booking notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-lg border ${
                          n.read ? 'bg-muted/30 border-border' : 'bg-primary/5 border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold">
                              {n.passengerName}{' '}
                              <span className="text-muted-foreground font-normal">({n.phone})</span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Train {n.trainNo} · {n.trainName} · Coach {n.coachNo} · Journey{' '}
                              {n.dateOfJourney}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {n.station} · {n.numberOfBags} bags ({n.weight} kg)
                              {n.isLateNight && (
                                <Badge className="ml-1.5 bg-indigo-100 text-indigo-700">
                                  Late night
                                </Badge>
                              )}
                              {n.isPriority && (
                                <Badge className="ml-1.5 bg-amber-100 text-amber-700">Priority</Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Porter: {n.porterName} ({n.porterBadgeNumber}) · {n.porterPhone}
                            </p>
                            {n.notes && (
                              <p className="text-sm mt-1 italic text-muted-foreground">"{n.notes}"</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-primary">₹{n.totalPrice}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                            {!n.read && (
                              <Badge className="mt-1 bg-red-100 text-red-700">New</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-8 h-8 text-blue-600" />
                    <Badge variant="secondary">Total</Badge>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.overview.totalVisits.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total Visits</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-purple-600" />
                    <Badge variant="secondary">Unique</Badge>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics.overview.uniqueVisitors.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Unique Visitors</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <Badge variant="secondary">Bookings</Badge>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics.overview.totalBookings.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total Bookings</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                    <Badge variant="secondary">Rate</Badge>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">
                    {analytics.overview.conversionRate}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Conversion Rate</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <Badge>Revenue</Badge>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ₹{analytics.overview.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bookings by Status */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Bookings by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.bookingsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'completed' ? 'bg-green-500' :
                            status === 'accepted' ? 'bg-blue-500' :
                            status === 'pending' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium capitalize">{status}</span>
                        </div>
                        <Badge className={getStatusColor(status)}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Statistics */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.deviceStats).map(([device, count]) => {
                      const total = Object.values(analytics.deviceStats).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={device} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(device)}
                            <span className="font-medium capitalize">{device}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Rated Porters */}
            {analytics.topPorters && analytics.topPorters.length > 0 && (
              <Card className="shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Top Rated Porters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {analytics.topPorters.map((porter, index) => (
                      <Card key={porter._id} className="border-2 hover:shadow-md transition-shadow">
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl font-bold text-primary">#{index + 1}</span>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{porter.porterName}</h3>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-bold">{porter.avgRating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {porter.totalReviews} reviews
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Bookings */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Booking ID</th>
                        <th className="text-left py-3 px-4">Passenger</th>
                        <th className="text-left py-3 px-4">Phone</th>
                        <th className="text-left py-3 px-4">Station</th>
                        <th className="text-left py-3 px-4">Train</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentBookings.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                          <td className="py-3 px-4 font-medium">{booking.passengerName}</td>
                          <td className="py-3 px-4">{booking.phone}</td>
                          <td className="py-3 px-4">{booking.station}</td>
                          <td className="py-3 px-4">{booking.trainNo}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-bold text-primary">₹{booking.totalPrice}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(booking.requestedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Porters Management Tab Content */}
        {activeTab === 'porters' && (
          <div className="space-y-6">
            {/* Porters Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Manage Porters</h2>
                <p className="text-muted-foreground">View and manage registered porters</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={fetchPorters} disabled={portersLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${portersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Add New Porter */}
            <Card className="shadow-lg border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Porter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPorter} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="porterName" className="text-sm font-semibold">Name *</Label>
                      <Input
                        id="porterName"
                        value={newPorter.name}
                        onChange={(e) => setNewPorter({ ...newPorter, name: e.target.value })}
                        placeholder="Porter's full name"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="porterPhone" className="text-sm font-semibold">Mobile Number *</Label>
                      <Input
                        id="porterPhone"
                        type="tel"
                        value={newPorter.phone}
                        onChange={(e) => setNewPorter({ ...newPorter, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="porterBadge" className="text-sm font-semibold">Badge Number *</Label>
                      <Input
                        id="porterBadge"
                        value={newPorter.badgeNumber}
                        onChange={(e) => setNewPorter({ ...newPorter, badgeNumber: e.target.value })}
                        placeholder="e.g. KB-001"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="porterStation" className="text-sm font-semibold">Station *</Label>
                      <Input
                        id="porterStation"
                        value={newPorter.station}
                        onChange={(e) => setNewPorter({ ...newPorter, station: e.target.value })}
                        placeholder="e.g. Kurnool Station"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="porterPassword" className="text-sm font-semibold">Password *</Label>
                      <Input
                        id="porterPassword"
                        type="text"
                        value={newPorter.password}
                        onChange={(e) => setNewPorter({ ...newPorter, password: e.target.value })}
                        placeholder="Minimum 6 characters"
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="porterImage" className="text-sm font-semibold">Profile Image (Optional)</Label>
                      <Input
                        id="porterImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewPorterImage(e.target.files?.[0] || null)}
                        className="h-11 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">No image? A placeholder avatar will be shown.</p>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={addingPorter}
                    className="flex items-center gap-2"
                  >
                    {addingPorter ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Add Porter
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Porters Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Porters</p>
                      <p className="text-2xl font-bold">{porters.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Online</p>
                      <p className="text-2xl font-bold text-green-600">
                        {porters.filter(p => p.isOnline).length}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Offline</p>
                      <p className="text-2xl font-bold text-red-600">
                        {porters.filter(p => !p.isOnline).length}
                      </p>
                    </div>
                    <UserX className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Verified</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {porters.filter(p => p.isVerified).length}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Porters List */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>All Porters</CardTitle>
              </CardHeader>
              <CardContent>
                {portersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading porters...</span>
                  </div>
                ) : porters.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No porters found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Phone</th>
                          <th className="text-left py-3 px-4">Badge</th>
                          <th className="text-left py-3 px-4">Station</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Last Seen</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {porters.map((porter) => (
                          <tr key={porter._id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{porter.name}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {porter.phone || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                {porter.badgeNumber}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                {porter.station}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Badge 
                                  className={porter.isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                >
                                  {porter.isOnline ? 'Online' : 'Offline'}
                                </Badge>
                                {porter.isVerified && (
                                  <Badge className="bg-blue-100 text-blue-700">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(porter.lastSeen).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deletePorter(porter)}
                                disabled={deletingId === porter._id}
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                {deletingId === porter._id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
