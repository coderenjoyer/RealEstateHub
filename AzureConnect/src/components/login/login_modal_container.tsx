import React, { useEffect, useState } from "react";
import LoginModal from "./login_modal";

const LoginModalContainer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        background:
          "linear-gradient(to bottom, #7BBDE8 0%, #4A8FB8 40%, #0A4174 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="hidden md:block absolute w-64 h-64 lg:w-96 lg:h-96 rounded-full border-4 border-white/30 animate-pulse"
          style={{
            top: "-10%",
            right: "-5%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="hidden sm:block absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/10"
          style={{
            bottom: "-8%",
            left: "-8%",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <div
          className="hidden sm:block absolute w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/20"
          style={{
            top: "30%",
            left: "15%",
            animation: "float 7s ease-in-out infinite",
          }}
        />
        <div
          className="hidden md:block absolute w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/15"
          style={{
            top: "60%",
            right: "20%",
            animation: "float 5s ease-in-out infinite reverse",
          }}
        />

        <div
          className="absolute w-1 bg-white/20"
          style={{
            height: "150%",
            top: "-25%",
            left: "25%",
            transform: "rotate(25deg)",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-1 bg-white/15"
          style={{
            height: "150%",
            top: "-25%",
            right: "35%",
            transform: "rotate(-20deg)",
            animation: "shimmer 3s ease-in-out infinite reverse",
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.3 }}
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div
          className="absolute w-full h-full"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute w-full h-full"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{
            width: "60%",
            top: "25%",
            left: "-10%",
            transform: "rotate(-3deg)",
          }}
        />
        <div
          className="absolute h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            width: "50%",
            bottom: "35%",
            right: "-5%",
            transform: "rotate(5deg)",
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[500px] sm:min-h-[600px] md:min-h-[700px] relative z-10">
        <div className="p-6 sm:p-8 md:p-10 lg:p-14 xl:p-24 flex flex-col justify-center relative">
          <div
            className={`hidden sm:block absolute w-16 h-16 md:w-24 md:h-24 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 scale-100 rotate-15"
                : "opacity-0 scale-75 rotate-0"
            }`}
            style={{
              top: "15%",
              left: "10%",
            }}
          />

          <h1
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-wide mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20 text-white relative transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              fontFamily: "Montserrat, sans-serif",
              textShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            Your sanctuary in the city
          </h1>

          <p
            className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white leading-relaxed font-light relative transition-all duration-1000 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              fontFamily: "Ubuntu, sans-serif",
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            We have{" "}
            <span
              className="font-bold italic animate-pulse"
              style={{
                fontFamily: "Montserrat, sans-serif",
                textShadow: "0 3px 10px rgba(0,0,0,0.4)",
                animationDelay: "1s",
              }}
            >
              plenty of places
            </span>{" "}
            to choose,
            <br className="hidden sm:block" />
            but only one will feel like{" "}
            <span
              className="font-bold text-white animate-bounce"
              style={{
                fontFamily: "Montserrat, sans-serif",
                textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                letterSpacing: "0.02em",
                animationDuration: "2s",
                animationDelay: "1.5s",
              }}
            >
              home
            </span>
            .
          </p>
        </div>

        <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 flex items-center justify-center relative">
          <div
            className={`hidden sm:block absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-t-2 border-r-2 border-white/30 rounded-tr-xl transition-all duration-1000 delay-900 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          />
          <div
            className={`hidden sm:block absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-b-2 border-l-2 border-white/30 rounded-bl-xl transition-all duration-1000 delay-1100 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          />

          <div
            className={`w-full max-w-md flex items-center justify-center transition-all duration-1000 delay-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <LoginModal />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModalContainer;