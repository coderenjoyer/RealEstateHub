import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@gmail.com",
    birthdate: "1990-05-15"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to a backend
    console.log("Saving profile data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values if needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-blue-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-300/95 via-blue-200/95 to-blue-300/95 backdrop-blur-md border-b border-white/20 px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/user")}
            className="text-white hover:bg-white/20 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
          <div className="p-6 lg:p-8">
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 mb-8">
              <div className="relative">
                <Avatar className="h-24 w-24 lg:h-32 lg:w-32">
                  <AvatarFallback className="bg-gradient-to-br from-sky-400 to-sky-600 text-white text-2xl lg:text-3xl font-bold shadow-lg">
                    {formData.firstName[0]}{formData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full p-2 shadow-lg"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-sky-600 text-lg">{formData.email}</p>
                <div className="mt-4">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2 justify-center lg:justify-start">
                      <Button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  className={`transition-all ${
                    isEditing 
                      ? "bg-white border-sky-300 focus:border-sky-500 focus:ring-sky-500/20" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  className={`transition-all ${
                    isEditing 
                      ? "bg-white border-sky-300 focus:border-sky-500 focus:ring-sky-500/20" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className={`transition-all ${
                    isEditing 
                      ? "bg-white border-sky-300 focus:border-sky-500 focus:ring-sky-500/20" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              {/* Birthdate */}
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="birthdate" className="text-sm font-semibold text-gray-700">
                  Birth Date
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => handleInputChange("birthdate", e.target.value)}
                  disabled={!isEditing}
                  className={`transition-all ${
                    isEditing 
                      ? "bg-white border-sky-300 focus:border-sky-500 focus:ring-sky-500/20" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-800">January 2024</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Account Status</p>
                  <p className="font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
