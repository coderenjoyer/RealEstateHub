import React from "react";
import LoginModal from "./login_modal";

const LoginModalContainer: React.FC = () => {
  return (
    <div
      className="rounded-3xl shadow-2xl overflow-hidden relative"
      style={{
        background:
          "linear-gradient(to bottom, #7BBDE8 0%, #4A8FB8 40%, #0A4174 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute w-96 h-96 rounded-full border-4 border-white/30"
          style={{
            top: "-10%",
            right: "-5%",
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full bg-white/10"
          style={{
            bottom: "-8%",
            left: "-8%",
          }}
        />
        <div
          className="absolute w-32 h-32 rounded-full border-2 border-white/20"
          style={{
            top: "30%",
            left: "15%",
          }}
        />
        <div
          className="absolute w-20 h-20 rounded-full bg-white/15"
          style={{
            top: "60%",
            right: "20%",
          }}
        />

        <div
          className="absolute w-1 bg-white/20"
          style={{
            height: "150%",
            top: "-25%",
            left: "25%",
            transform: "rotate(25deg)",
          }}
        />
        <div
          className="absolute w-1 bg-white/15"
          style={{
            height: "150%",
            top: "-25%",
            right: "35%",
            transform: "rotate(-20deg)",
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[700px] relative z-10">
        <div className="p-10 sm:p-14 lg:p-24 flex flex-col justify-center relative">
          <div
            className="absolute w-24 h-24 rounded-lg bg-white/10 backdrop-blur-sm"
            style={{
              top: "15%",
              left: "10%",
              transform: "rotate(15deg)",
            }}
          />

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-wide mb-20 text-white relative"
            style={{
              fontFamily: "Montserrat, sans-serif",
              textShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            Your sanctuary in the city
          </h1>

          <p
            className="text-lg sm:text-xl lg:text-2xl text-white leading-relaxed font-light relative"
            style={{
              fontFamily: "Ubuntu, sans-serif",
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            We have{" "}
            <span
              className="font-bold italic"
              style={{
                fontFamily: "Montserrat, sans-serif",
                textShadow: "0 3px 10px rgba(0,0,0,0.4)",
              }}
            >
              plenty of places
            </span>{" "}
            to choose,
            <br />
            but only one will feel like{" "}
            <span
              className="font-bold text-white"
              style={{
                fontFamily: "Montserrat, sans-serif",
                textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                letterSpacing: "0.02em",
              }}
            >
              home
            </span>
            .
          </p>
        </div>

        <div className="p-8 sm:p-10 lg:p-12 flex items-center justify-center relative">
          <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-white/30 rounded-tr-xl" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/30 rounded-bl-xl" />

          <div className="w-full max-w-md flex items-center justify-center">
            <LoginModal />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModalContainer;
