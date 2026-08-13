import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
// import NotificationCenter from "./components/NotificationCenter"
import BookPorter from "./pages/BookPorter";
import PorterLogin from "./pages/PorterLogin";
import PorterRegistration from "./pages/porterregi";
import PorterDashboard from "./pages/PorterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/Myservices";
import AvailablePorters from "./pages/Available";
import AboutUs from "./pages/aboutus";
import ProfessionalLoadingScreen from "@/components/ProfessionalLoadingScreen";

const queryClient = new QueryClient();

const API_BASE = 'https://cooliemate.onrender.com';

const ServerWakeBanner = () => {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!cancelled) setWaking(false);
      } catch {
        if (!cancelled) {
          setWaking(true);
          setTimeout(check, 20000);
        }
      }
    };

    const timer = setTimeout(check, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!waking) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md">
      <div className="bg-amber-50 border border-amber-300 text-amber-900 text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin flex-shrink-0" />
        Server is waking up — the first request after idle can take up to a minute. Please wait...
      </div>
    </div>
  );
};

const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    let sessionId = sessionStorage.getItem('cmSessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('cmSessionId', sessionId);
    }

    fetch(`${API_BASE}/api/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: location.pathname, sessionId })
    }).catch(() => {});
  }, [location.pathname]);

  return null;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Show loading screen only on initial app load
  useEffect(() => {
    // Check if this is the first visit in this session
    const hasLoadedBefore = sessionStorage.getItem('hasLoadedBefore');
    
    if (hasLoadedBefore) {
      // Skip loading screen if already loaded in this session
      setIsLoading(false);
    } else {
      // Show loading screen for first load
      sessionStorage.setItem('hasLoadedBefore', 'true');
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <ProfessionalLoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ServerWakeBanner />
        <BrowserRouter>
          <PageViewTracker />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/notify" element={<NotificationCenter/>} /> */}
            <Route path="/book" element={<BookPorter />} />
            <Route path="/porter-login" element={<PorterLogin />} />
            <Route path="/porter-dashboard" element={<PorterDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/available" element={<AvailablePorters />} />
            <Route path="/porter-registration" element={<PorterRegistration />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/myorders" element={<MyBookings/>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;