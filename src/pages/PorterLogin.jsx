import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "../pages/Footer";
import { Eye, EyeOff, Loader2, User, Lock, Sparkles, Phone, CheckCircle, XCircle } from "lucide-react";

const API_BASE = 'https://cooliemate.onrender.com';

// Audio notification system using Web Audio API
const useAudioNotification = () => {
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSuccessSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Success sound: cheerful ascending tones
    const now = ctx.currentTime;
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    // Play ascending notes: C, E, G (major chord)
    oscillator1.frequency.setValueAtTime(523.25, now); // C5
    oscillator1.frequency.setValueAtTime(659.25, now + 0.1); // E5
    oscillator1.frequency.setValueAtTime(783.99, now + 0.2); // G5

    oscillator2.frequency.setValueAtTime(523.25 * 2, now); // C6
    oscillator2.frequency.setValueAtTime(659.25 * 2, now + 0.1); // E6
    oscillator2.frequency.setValueAtTime(783.99 * 2, now + 0.2); // G6

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 0.5);
    oscillator2.stop(now + 0.5);
  };

  const playErrorSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Error sound: descending tones with slight dissonance
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    
    // Play descending notes with dissonance
    oscillator.frequency.setValueAtTime(440, now); // A4
    oscillator.frequency.setValueAtTime(370, now + 0.1); // F#4
    oscillator.frequency.setValueAtTime(293.66, now + 0.2); // D4

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
  };

  const playWarningSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Warning sound: repeating beep
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, now);

    // Create beep pattern
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.setValueAtTime(0.2, now + 0.05);
    gainNode.gain.setValueAtTime(0, now + 0.15);
    gainNode.gain.setValueAtTime(0.2, now + 0.25);
    gainNode.gain.setValueAtTime(0, now + 0.35);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
  };

  return { playSuccessSound, playErrorSound, playWarningSound };
};

const PorterLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playSuccessSound, playErrorSound, playWarningSound } = useAudioNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState({
    phone: "",
    password: "",
  });

  const showToastWithSound = (options) => {
    const { variant, ...toastOptions } = options;
    
    // Play appropriate sound
    if (variant === 'success') {
      playSuccessSound();
    } else if (variant === 'destructive') {
      playErrorSound();
    } else {
      playWarningSound();
    }

    // Show toast
    toast({
      ...toastOptions,
      variant,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { phone, password } = credentials;

    // Check for admin login
    if (phone === "9494704280" && password === "CooliemateDN") {
      showToastWithSound({
        title: "Admin Login Successful",
        description: "Welcome to Admin Dashboard!",
        variant: "success",
      });
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1000);
      return;
    }

    // Validation
    if (!phone || !password) {
      showToastWithSound({
        title: "Missing Fields",
        description: "Please enter both mobile number and password",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      showToastWithSound({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Attempting login with mobile number:', phone);

      const response = await fetch(`${API_BASE}/api/porter/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Backend Error:', data);
        
        if (data.message === 'Invalid credentials') {
          throw new Error('Invalid mobile number or password. Please check your credentials or register first.');
        }
        
        throw new Error(data.message || 'Login failed');
      }

      console.log('✅ Login successful:', data);

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

      showToastWithSound({
        title: "Login Successful",
        description: `Welcome back, ${data.data.name}! You are now online.`,
        variant: "success",
      });

      setTimeout(() => {
        navigate("/porter-dashboard");
      }, 1000);

    } catch (error) {
      console.error('❌ Login Error:', error);
      showToastWithSound({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Quick & Easy Login
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Porter Login
            </h1>
            <p className="text-slate-600 text-lg">
              Sign in to access your dashboard and manage bookings
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-white overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Details Section */}
                <div className="bg-blue-50 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Account Details
                    </h2>
                  </div>

                  {/* Mobile Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      Mobile Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={credentials.phone}
                      onChange={(e) =>
                        setCredentials({ ...credentials, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                      }
                      placeholder="Enter your 10-digit mobile number"
                      maxLength={10}
                      disabled={isSubmitting}
                      required
                      className="h-14 text-base border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Use the mobile number you registered with
                    </p>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-500" />
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials({ ...credentials, password: e.target.value })
                        }
                        placeholder="Enter your password"
                        disabled={isSubmitting}
                        required
                        className="h-14 text-base pr-14 border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-slate-700 transition-colors"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing you in...
                    </>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-medium">
                      New to our platform?
                    </span>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/porter-registration")}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-base transition-colors hover:underline"
                    disabled={isSubmitting}
                  >
                    Create Porter Account
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center text-sm text-slate-500 mt-6 space-y-2">
            <p>Having trouble logging in? Contact support for assistance</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-blue-800 font-medium">📱 Login with Mobile Number</p>
              <p className="text-blue-700 text-xs mt-1">
                Use your registered 10-digit mobile number and password to sign in. 
                New porter? Register first to create your account.
              </p>
            </div>
          </div>
        </div>
      </div>
       <div className="h-12 md:h-20"></div>
      <div>

      </div>
    </div>
  );
};

export default PorterLogin;