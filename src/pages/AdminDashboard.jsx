import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AlertCircle
} from "lucide-react";

const API_BASE = 'https://cooliemate.onrender.com';

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

  useEffect(() => {
    // Track page visit on mount
    trackAnalytics('visit', '/admin/dashboard');
    
    fetchAnalytics();
    fetchPorters();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/analytics/dashboard`);
      const data = await response.json();
      
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
      const response = await fetch(`${API_BASE}/api/porters/debug`);
      const data = await response.json();
      
      if (data.success) {
        setPorters(data.porters);
      }
    } catch (error) {
      console.error('Error fetching porters:', error);
    } finally {
      setPortersLoading(false);
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
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
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
            <Button variant="outline" onClick={fetchAnalytics}>
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
