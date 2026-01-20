import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
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