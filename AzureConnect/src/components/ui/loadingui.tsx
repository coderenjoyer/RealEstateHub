import React from 'react';
import { Building2, Key } from 'lucide-react';

export default function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        {/* Animated building icon */}
        <div className="relative">
          <Building2 className="w-12 h-12 text-[#49769F] animate-pulse" />
          
          {/* Floating key animation */}
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Key className="w-6 h-6 text-[#49769F]" />
          </div>
        </div>
        
        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <div className="w-2 h-2 bg-[#49769F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#49769F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#49769F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Loading text */}
        <p className="text-gray-600 mt-3 text-sm font-medium text-center">
          Loading accounts...
        </p>
      </div>
    </div>
  );
}