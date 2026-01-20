import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Upload, Loader2, User, Phone, Hash, MapPin, Lock, Sparkles, CheckCircle2, Camera } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Footer";

const API_BASE = 'https://cooliemate.onrender.com';

const PorterRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    badgeNumber: "",
    station: "Kurnool Station",
    password: "",
    image: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("⚠️ Please upload an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("⚠️ Image size must be less than 5MB");
        return;
      }
      
      // Clean up old preview URL
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(imageUrl);
      toast.success("✅ Image uploaded successfully");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.badgeNumber ||
      !formData.password ||
      !formData.image
    ) {
      toast.error("⚠️ Please fill in all required fields!");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("⚠️ Please enter a valid 10-digit phone number");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("⚠️ Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('badgeNumber', formData.badgeNumber);
      submitData.append('station', formData.station);
      submitData.append('password', formData.password);
      submitData.append('image', formData.image);

      console.log('📤 Submitting porter registration...');

      const response = await fetch(`${API_BASE}/api/porter/register`, {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('✅ Porter registered successfully:', data);
      
      if (data.data.token) {
        localStorage.setItem('porterToken', data.data.token);
        localStorage.setItem('porterId', data.data.id);
        localStorage.setItem('porterBadgeNumber', data.data.badgeNumber);
      }

      toast.success("✅ Porter registered successfully! Redirecting to dashboard...");

      setFormData({
        name: "",
        phone: "",
        badgeNumber: "",
        station: "Kurnool Station",
        password: "",
        image: null,
      });
      setPreviewImage(null);

      setTimeout(() => {
        navigate("/porter-dashboard");
      }, 1500);

    } catch (error) {
      console.error('❌ Registration Error:', error);
      toast.error(`❌ ${error.message || 'Registration failed. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Join Our Network
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Porter Registration
            </h1>
            <p className="text-slate-600 text-lg">
              Register yourself as a certified porter at your station
            </p>
          </div>

          {/* Registration Card */}
          <Card className="shadow-2xl border-0 bg-white overflow-hidden">
            <CardContent className="p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center">
                  <div className="relative group mb-4">
                    {previewImage ? (
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Porter Preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            toast.error("Failed to load image preview");
                          }}
                        />
                        <label
                          htmlFor="image-upload"
                          className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          <Camera className="w-8 h-8 text-white" />
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="image-upload"
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-dashed border-blue-300 hover:border-blue-500 transition-colors shadow-lg cursor-pointer"
                      >
                        <Upload className="w-10 h-10 text-blue-500" />
                      </label>
                    )}
                  </div>
                  
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-block"
                  >
                    {previewImage ? 'Change Photo' : 'Upload Photo *'}
                  </label>
                  
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">Max size: 5MB (JPG, PNG)</p>
                </div>

                {/* Personal Details Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Personal Details
                    </h2>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                      required
                      className="h-12 text-base border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      Mobile Number * (Login ID)
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10 digit mobile number (used for login)"
                      disabled={isSubmitting}
                      required
                      className="h-12 text-base border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    />
                    <p className="text-xs text-blue-600 font-medium">
                      This mobile number will be used for login
                    </p>
                  </div>
                </div>

                {/* Work Details Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Work Details
                    </h2>
                  </div>

                  {/* Badge Number */}
                  <div className="space-y-2">
                    <Label htmlFor="badgeNumber" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-slate-500" />
                      Coolie Badge Number * (Reference Only)
                    </Label>
                    <Input
                      id="badgeNumber"
                      name="badgeNumber"
                      value={formData.badgeNumber}
                      onChange={handleChange}
                      placeholder="Enter your badge number"
                      disabled={isSubmitting}
                      required
                      className="h-12 text-base border-slate-300 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl"
                    />
                    <p className="text-xs text-green-600 font-medium">
                      For identification purposes only
                    </p>
                  </div>

                  {/* Station */}
                  <div className="space-y-2">
                    <Label htmlFor="station" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      Station Location *
                    </Label>
                    <Input
                      id="station"
                      name="station"
                      value={formData.station}
                      onChange={handleChange}
                      placeholder="Enter station name"
                      disabled={isSubmitting}
                      required
                      className="h-12 text-base border-slate-300 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Security
                    </h2>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-500" />
                      Password * (min 6 characters)
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="h-12 text-base pr-12 border-slate-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl"
                        disabled={isSubmitting}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none disabled:opacity-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registering Your Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-medium">
                      Already have an account?
                    </span>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/porter-login")}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-base transition-colors hover:underline"
                    disabled={isSubmitting}
                  >
                    Sign in to your account
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <p className="text-center text-sm text-slate-500 mt-6">
            By registering, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
       <div>

       </div>
      {/* <Footer /> */}
       <div className="h-12 md:h-20"></div>
    </div>
  );
};

export default PorterRegistration;