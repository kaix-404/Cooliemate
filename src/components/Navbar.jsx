import { Button } from "@/components/ui/button";
import { Home, Package, LogIn, Info, ShoppingBag, Mail, Linkedin, Phone, MapPin, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Modern Navbar Component
const Navbar = () => {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("/porter")) {
      setUserType("porter");
      setUserId("1234");
    } else if (location.pathname.includes("/admin")) {
      setUserType("admin");
      setUserId("admin");
    } else if (
      location.pathname.includes("/book") ||
      location.pathname.includes("/available")
    ) {
      setUserType("passenger");
      setUserId("guest-" + Date.now());
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Book Porter", path: "/book", icon: Package },
    { name: "Porter Login", path: "/porter-login", icon: LogIn },
    { name: "Services", path: "/myorders", icon: ShoppingBag },
    { name: "About Us", path: "/about", icon: Info },
    
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className={`hidden md:block sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200' 
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="container mx-auto px-2 lg:px-6">
          <div className="flex items-center justify-between h-20 gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 lg:space-x-3 group flex-shrink-0">
              <motion.img 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                src="/logo.png" 
                alt="CoolieMate Logo" 
                className="h-10 w-10 lg:h-14 lg:w-14 object-contain drop-shadow-lg" 
              />
              <div className="flex flex-col">
                <span className="text-xl lg:text-3xl font-black bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                  CoolieMate
                </span>
                <span className="text-[10px] lg:text-xs text-gray-500 font-medium -mt-1">Premium Porter Service</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1 lg:space-x-2 flex-wrap justify-end flex-1">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={link.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`font-semibold transition-all duration-300 text-xs lg:text-sm px-2 lg:px-4 whitespace-nowrap ${
                          isActive 
                            ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg hover:shadow-red-500/50 hover:scale-105' 
                            : 'hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        {link.name}
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}

              {/* CTA Button */}
              {/* <Link to="/book">
                <Button
                  size="lg"
                  className="ml-4 font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
                >
                  Book Now
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navbar */}
      <div className="md:hidden">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-lg shadow-xl'
              : 'bg-white shadow-md'
          }`}
        >
          <div className="flex items-center justify-center px-4 h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="CoolieMate Logo" className="h-10 w-10" />
              <div className="flex flex-col">
                <span className="text-xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  CoolieMate
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">Premium Porter Service</span>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Mobile Menu Overlay */}
        {/* <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-x-0 top-16 z-40 bg-white shadow-2xl border-b border-gray-200"
            >
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg' 
                          : 'hover:bg-red-50 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl z-50">
          <div className="flex items-center justify-around px-2 py-3">
            {navLinks.slice(0, 5).map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex flex-col items-center justify-center flex-1 min-w-0"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-red-50' : ''
                    }`}
                  >
                    <Icon 
                      size={22}
                      className={`transition-colors ${
                        isActive ? 'text-red-600' : 'text-gray-600'
                      }`}
                    />
                    <span 
                      className={`text-xs mt-1 font-medium truncate max-w-full ${
                        isActive ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      {link.name.split(' ')[0]}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="h-20" />
      </div>
    </>
  );
};

export default Navbar;