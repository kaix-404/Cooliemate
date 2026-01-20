import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import { 
  Users, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Heart, 
  Shield,
  Zap,
  Globe,
  Award,
  Briefcase,
  Star,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const AboutUs = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Three.js Background Animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    const geometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.6,
      wireframe: false 
    });
    
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(pointLight, ambientLight);

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      torus.rotation.x += 0.005;
      torus.rotation.y += 0.005;
      torus.rotation.z += 0.002;
      
      particlesMesh.rotation.y += 0.001;
      
      camera.position.x = mousePosition.x * 0.5;
      camera.position.y = -mousePosition.y * 0.5;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [mousePosition]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const team = [
    {
      name: "Md Dilnawaz Ahmad",
      role: "Founder & CEO",
      img: "/founder.jpg",
      description:
        "Visionary leader who identified the gap in railway luggage assistance and conceptualized CoolieMate as a solution to a nationwide problem.",
    },
    {
      name: "Navdeep",
      role: "Co-Founder & CTO",
      img: "/CTO.jpg",
      description:
        "Head of Technology, architecting the robust platform that powers real-time tracking, secure payments, and smooth booking experiences.",
    },
    {
      name: "Sahithya",
      role: "Co-Founder & COO",
      img: "/cofounder1.jpg",
      description:
        "Strategic operations lead ensuring seamless coordination between passengers and porters, focused on user experience and service excellence.",
    },
    
    {
      name: "Pankaj",
      role: "Co-Founder & Growth Lead",
      img: "/pank.jpg",
      description:
        "Growth and partnerships expert, building bridges with railway authorities, porter unions, and stakeholders to scale CoolieMate across India.",
    },
  ];

  const problems = [
    {
      title: "Struggling Passengers",
      description:
        "Millions of passengers—elderly citizens, pregnant women, and families—struggle daily with heavy luggage at crowded stations.",
      icon: Users,
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Stressful Coolie Search",
      description:
        "Finding a porter involves uncertainty and haggling, often leading to unfair pricing and unreliability.",
      icon: Target,
      color: "from-orange-500 to-yellow-500",
    },
    {
      title: "No Organized System",
      description:
        "Despite massive demand, there exists no structured or digital way to book luggage assistance in advance.",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Unfair Pricing",
      description:
        "Without standardized rates, passengers are often overcharged, while porters lack fair income and recognition.",
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-500",
    },
  ];

  const solutions = [
    {
      title: "Advance Booking",
      description:
        "Book a certified porter by simply entering your PNR number — plan your journey with confidence.",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Standardized Rates",
      description:
        "No bargaining — just clear, fixed pricing. Fair for passengers, fair for porters.",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Real-time Tracking",
      description:
        "Track your porter's location in real-time, just like ride-hailing apps.",
      icon: Globe,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Digital Payments",
      description:
        "Pay conveniently via UPI, card, or cash — secure, transparent, and easy.",
      icon: Award,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const impacts = [
    {
      title: "Stress-Free Travel",
      description:
        "Helping elderly, families, and travelers journey with ease and dignity.",
      icon: Heart,
      color: "text-red-600",
      bg: "from-red-50 to-pink-50",
    },
    {
      title: "Job Creation",
      description:
        "Creating employment opportunities for thousands of porters, giving them financial stability and respect.",
      icon: Briefcase,
      color: "text-blue-600",
      bg: "from-blue-50 to-cyan-50",
    },
    {
      title: "Digital India Support",
      description:
        "Bringing traditional porter services into the digital ecosystem to support India's transformation.",
      icon: Globe,
      color: "text-green-600",
      bg: "from-green-50 to-emerald-50",
    },
    {
      title: "Market Opportunity",
      description:
        "Expanding across major Indian railway stations with potential for nationwide adoption.",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "from-purple-50 to-indigo-50",
    },
  ];

  const fadeUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } };
  const scaleIn = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
      />
      
      <Navbar />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>
          </div>

          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              className="max-w-5xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={scaleIn}
                transition={{ duration: 0.8, type: "spring" }}
              >
                <Badge className="mb-6 text-sm px-6 py-2 bg-white/20 backdrop-blur-lg border-white/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Passionate Innovators
                </Badge>
              </motion.div>

              <motion.h1 
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-white drop-shadow-2xl"
              >
                About CoolieMate
              </motion.h1>
              
              <motion.p 
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl mb-4 text-white/95 font-semibold"
              >
                Luggage Help at Your Fingertips
              </motion.p>
              
              <motion.p 
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-base md:text-lg mb-10 text-white/80 max-w-3xl mx-auto leading-relaxed"
              >
                We are a team of passionate innovators driven by the mission to make railway travel more comfortable and accessible for everyone through smart, digital porter booking.
              </motion.p>
              
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link to="/">
                  <Button
                    size="lg"
                    className="font-bold text-lg px-10 py-7 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 rounded-2xl group"
                  >
                    Back to Home
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="rgba(248, 250, 252, 1)"/>
            </svg>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-5xl mx-auto"
            >
              <motion.div variants={fadeUp} className="text-center mb-12">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                  OUR JOURNEY
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Our Story
                </h2>
              </motion.div>

              <motion.div variants={scaleIn}>
                <Card className="shadow-2xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 rounded-3xl overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <div className="flex items-start space-x-6 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-700 text-lg leading-relaxed mb-4">
                          What started as an observation of daily struggles at railway stations has grown into a mission to revolutionize luggage assistance across India.
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed">
                          We envisioned <span className="text-blue-600 font-bold">CoolieMate</span> as a way to connect passengers and porters seamlessly — empowering both with technology, transparency, and trust.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <span className="inline-block px-4 py-2 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-bold mb-4 border border-yellow-400/30">
                  OUR TEAM
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
                  Meet Our Team
                </h2>
                <p className="text-xl text-blue-100">
                  The innovators behind CoolieMate
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {team.map((member, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    <Card className="shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl overflow-hidden h-full">
                      <CardContent className="pt-8 pb-8 px-6 text-center">
                        <img
                          src={member.img}
                          alt={member.name}
                          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-xl border-4 border-white/20"
                        />
                        <h3 className="font-bold text-xl mb-2 text-white">{member.name}</h3>
                        <Badge className="mb-4 bg-white/20 text-white border-white/30">
                          {member.role}
                        </Badge>
                        <p className="text-sm text-blue-100 leading-relaxed">
                          {member.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-4">
                  THE CHALLENGE
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 via-red-900 to-orange-900 bg-clip-text text-transparent">
                  The Problem We're Solving
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {problems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      whileHover={{ y: -10, scale: 1.02 }}
                    >
                      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-red-200 rounded-3xl overflow-hidden h-full">
                        <CardContent className="p-8">
                          <div className="flex items-start space-x-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-xl mb-2 text-gray-900">{item.title}</h3>
                              <p className="text-gray-600 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Solutions */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                  OUR SOLUTION
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
                  How We Solve It
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {solutions.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      whileHover={{ y: -10, scale: 1.02 }}
                    >
                      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-green-500 rounded-3xl overflow-hidden h-full bg-white">
                        <CardContent className="pt-8 pb-8 px-6 text-center">
                          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="font-bold text-xl mb-3 text-gray-900">{item.title}</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="text-center mb-16">
                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-4">
                  OUR IMPACT
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                  Our Impact & Vision
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {impacts.map((impact, i) => {
                  const Icon = impact.icon;
                  return (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      whileHover={{ y: -10, scale: 1.02 }}
                    >
                      <Card className={`shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-gradient-to-br ${impact.bg} border-2 border-white h-full`}>
                        <CardContent className="p-8">
                          <div className="flex items-start space-x-6">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl flex-shrink-0">
                              <Icon className={`w-8 h-8 ${impact.color}`} />
                            </div>
                            <div>
                              <h3 className="font-bold text-xl mb-3 text-gray-900">{impact.title}</h3>
                              <p className="text-gray-700 leading-relaxed">{impact.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 1, 0.2],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <Card className="text-center shadow-2xl bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-3xl overflow-hidden">
                <CardContent className="py-16 px-8">
                  <motion.div variants={scaleIn}>
                    <Star className="w-20 h-20 mx-auto mb-6 text-yellow-300" />
                  </motion.div>
                  <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-6 text-white">
                    Our Vision
                  </motion.h2>
                  <motion.p variants={fadeUp} className="text-xl text-blue-100 leading-relaxed">
                    To become the <span className="font-bold text-yellow-300">Best Supporter for luggage help</span> — making every journey comfortable and dignified while empowering porters across India through technology.
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <Footer />
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
    </div>
  );
};

export default AboutUs;