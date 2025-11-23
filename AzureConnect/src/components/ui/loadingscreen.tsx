import React, { useState, useEffect } from 'react';
import { Home, Building2, Key } from 'lucide-react';

const AzureRealEstateLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);

  const icons = [Home, Building2, Key];
  const loadingTexts = [
    'Finding your dream property...',
    'Analyzing market data...',
    'Preparing your dashboard...'
  ];

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    let iconInterval: ReturnType<typeof setInterval>;

    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    iconInterval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % icons.length);
    }, 1000);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (iconInterval) clearInterval(iconInterval);
    };
  }, [icons.length]);

  const Icon = icons[currentIcon];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#49769F]/10 via-[#49769F]/20 to-[#49769F]/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#49769F] rounded-2xl shadow-lg mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AzureConnect</h1>
          <p className="text-gray-600">Real Estate Solutions</p>
        </div>

        {/* Loading Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#49769F] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-[#49769F] rounded-full flex items-center justify-center shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <p className="text-center text-gray-700 font-medium mb-6 h-6 transition-opacity duration-300">
            {loadingTexts[currentIcon]}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#49769F] rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Progress Percentage */}
          <div className="text-center">
            <span className="text-2xl font-bold text-[#49769F]">
              {progress}%
            </span>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIcon 
                    ? 'bg-[#49769F] scale-125' 
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Powered by AzureTech Solutions
        </p>
      </div>
    </div>
  );
};

export default AzureRealEstateLoader;