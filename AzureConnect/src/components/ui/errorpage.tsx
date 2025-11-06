import React from 'react';
import { Home, AlertCircle, RefreshCw } from 'lucide-react';

const ErrorPage: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
          {/* Header with Azure gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <AlertCircle className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-center mb-2">Oops!</h1>
            <p className="text-blue-100 text-center text-lg">Something went wrong</p>
          </div>

          {/* Error Content */}
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-red-800 font-semibold text-lg mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Error Details
              </h2>
              <p className="text-red-700 font-mono text-sm bg-red-100 p-4 rounded mt-3">
                {/* Add your specific error message here */}
                Error: Something went wrong. Please try again later.
              </p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                There seems to be an issue with the server. Please try again later.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </button>
                
                <button
                  onClick={handleRefresh}
                  className="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh Page
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-4 border-t border-blue-100">
            <p className="text-center text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@realestate.com" className="text-blue-600 hover:text-blue-700 font-medium">
                support@realestate.com
              </a>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <Home className="w-4 h-4" />
            <span>Azure Real Estate Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;