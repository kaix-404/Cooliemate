import { Mail, Linkedin, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "/logo.png";

const Footer = () => {
  const footerLinks = {
    explore: [
      { name: "About Us", path: "/about" },
      { name: "Book a Porter", path: "/book" },
      { name: "Coolie Login", path: "/porter-login" },
      // { name: "Admin Login", path: "/admin-login" },
    ],
    // services: [
    //   { name: "Pricing", path: "/pricing" },
    //   { name: "FAQ", path: "/faq" },
    //   { name: "Support", path: "/support" },
    // ],
    legal: [
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Terms of Service", path: "/terms" },
    ],
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <motion.img 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                src={logo}
                alt="CooliMate Logo" 
                className="w-16 h-16 object-contain drop-shadow-2xl" 
              />
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  CoolieMate
                </h2>
                <p className="text-xs text-gray-400">Premium Porter Service</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              Empowering porters, helping passengers — simplifying travel one bag at a time.
            </p>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="mailto:orugantinavadeep@gmail.com"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center hover:shadow-lg hover:shadow-red-500/50 transition-all"
              >
                <Mail size={18} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="tel:+919494704280"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center hover:shadow-lg hover:shadow-red-500/50 transition-all"
              >
                <Phone size={18} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center hover:shadow-lg hover:shadow-red-500/50 transition-all"
              >
                <Linkedin size={18} />
              </motion.a>
            </div>
          </motion.div>

          {/* Explore Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></span>
              Explore
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-yellow-400 group-hover:w-4 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services Links
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></span>
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-yellow-400 group-hover:w-4 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div> */}

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></span>
              Get in Touch
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-300 hover:text-yellow-400 transition-colors group">
                <Mail size={18} className="mt-1 flex-shrink-0" />
                <a href="mailto:orugantinavadeep.com" className="text-sm">orugantinavadeep@gmail.com</a>
              </div>
              <div className="flex items-start gap-3 text-gray-300 hover:text-yellow-400 transition-colors group">
                <Phone size={18} className="mt-1 flex-shrink-0" />
                <span className="text-sm">+91 9494704280</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 hover:text-yellow-400 transition-colors group">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span className="text-sm">Andhra Pradesh, India</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-8"></div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2025 <span className="text-yellow-400 font-bold">CoolieMate</span>. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Part of the <span className="text-yellow-400">Digital India Initiative</span>
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            {footerLinks.legal.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </footer>
  );
};

export default Footer;