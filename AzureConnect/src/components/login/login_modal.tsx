import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type TabKey = "signup" | "signin";

const LoginModal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabChange = (tab: TabKey) => {
    if (tab !== activeTab) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveTab(tab);
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 200);
    }
  };

  const inputBase =
    "w-full rounded-[10px] border border-[#a8c1d3] bg-[#b8cfdd]/60 placeholder:text-white/80 text-white/90 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5d8ab0] focus:border-transparent transition-all duration-300 hover:bg-[#b8cfdd]/80 hover:border-[#5d8ab0]";

  const inputFont = {
    fontFamily:
      "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
    fontSize: "16px",
  } as const;

  return (
    <div className="relative w-full max-w-md rounded-xl sm:rounded-2xl bg-[#cfe3ee] p-5 sm:p-6 md:p-8 shadow-2xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-full bg-[#3f6f97] p-1.5 shadow gap-2">
          <button
            onClick={() => handleTabChange("signup")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex-shrink-0 ${
              activeTab === "signup"
                ? "bg-white/40 text-white shadow-sm scale-105"
                : "text-white/90 hover:text-white hover:bg-white/20"
            }`}
            style={{
              fontFamily:
                "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
            }}
          >
            Sign up
          </button>
          <button
            onClick={() => handleTabChange("signin")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex-shrink-0 ${
              activeTab === "signin"
                ? "bg-white/40 text-white shadow-sm scale-105"
                : "text-white/90 hover:text-white hover:bg-white/20"
            }`}
            style={{
              fontFamily:
                "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
            }}
          >
            Sign in
          </button>
        </div>
        <button
          aria-label="Back to Home"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/30 text-[#436a86] transition-all duration-300 hover:bg-white/50 hover:scale-105 hover:shadow-md backdrop-blur-sm flex-shrink-0"
          onClick={() => navigate("/")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 sm:w-4 sm:h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          <span
            className="text-sm font-medium hidden sm:inline"
            style={{
              fontFamily:
                "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
            }}
          >
            Back to Home
          </span>
        </button>
      </div>

      <div className="relative overflow-hidden">
        <div
          className={`transition-all duration-500 ease-in-out ${
            isAnimating
              ? "opacity-0 transform translate-y-2 scale-95"
              : "opacity-100 transform translate-y-0 scale-100"
          }`}
        >
          {activeTab === "signup" ? (
            <div className="space-y-4">
              <h2 className="text-[#17364b] text-base sm:text-lg font-semibold animate-fadeInUp">
                Create an account
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  style={inputFont}
                  className={inputBase}
                  placeholder="First name"
                />
                <input
                  style={inputFont}
                  className={inputBase}
                  placeholder="Last name"
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    className="w-5 h-5"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <input
                  style={inputFont}
                  className={`${inputBase} pl-10`}
                  placeholder="Enter your email"
                  type="email"
                />
              </div>

              <input
                style={inputFont}
                className={inputBase}
                placeholder="Mobile Number"
              />

              <div className="relative">
                <input
                  style={inputFont}
                  className={`${inputBase} pr-12`}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.2 2.2C2.49 7.05 1.14 8.8.5 10.05a2.25 2.25 0 0 0 0 1.9C2.52 16.35 6.61 19.5 12 19.5c2.1 0 3.99-.44 5.63-1.22l2.84 2.84a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.999c-4.56 0-8.13-2.77-9.9-6.047a.75.75 0 0 1 0-.704c.876-1.63 2.244-3.142 3.999-4.262l2.163 2.163A5.25 5.25 0 0 0 12 16.5c.92 0 1.787-.234 2.54-.646l1.122 1.122A10.2 10.2 0 0 1 12 18Z" />
                      <path d="M14.551 15.257 8.744 9.45A3.75 3.75 0 0 0 12 15.75c.93 0 1.788-.333 2.551-.893Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  style={inputFont}
                  className={`${inputBase} pr-12`}
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.2 2.2C2.49 7.05 1.14 8.8.5 10.05a2.25 2.25 0 0 0 0 1.9C2.52 16.35 6.61 19.5 12 19.5c2.1 0 3.99-.44 5.63-1.22l2.84 2.84a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.999c-4.56 0-8.13-2.77-9.9-6.047a.75.75 0 0 1 0-.704c.876-1.63 2.244-3.142 3.999-4.262l2.163 2.163A5.25 5.25 0 0 0 12 16.5c.92 0 1.787-.234 2.54-.646l1.122 1.122A10.2 10.2 0 0 1 12 18Z" />
                      <path d="M14.551 15.257 8.744 9.45A3.75 3.75 0 0 0 12 15.75c.93 0 1.788-.333 2.551-.893Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z" />
                    </svg>
                  )}
                </button>
              </div>

              <button className="mt-6 w-full rounded-xl bg-[#5d86aa] px-6 py-3 text-base text-white shadow transition-all duration-300 hover:bg-[#52799a] hover:scale-105 hover:shadow-lg transform active:scale-95 font-semibold">
                Create an account
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/40"></div>
                </div>
                <div className="relative bg-[#cfe3ee] px-4">
                  <span
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    or
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-700 shadow-md border border-gray-200 transition-all duration-300 hover:bg-gray-50 hover:shadow-lg hover:scale-[1.02] transform active:scale-95 font-medium"
                onClick={() => {
                  // Placeholder for Google login - no backend integration
                  console.log("Google login clicked");
                }}
                style={{
                  fontFamily:
                    "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-[#17364b] text-base sm:text-lg font-semibold animate-fadeInUp">
                Welcome back
              </h2>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/90">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    className="w-5 h-5"
                  >
                    <path d="M1.5 6.75A2.25 2.25 0 0 1 3.75 4.5h16.5A2.25 2.25 0 0 1 22.5 6.75v10.5A2.25 2.25 0 0 1 20.25 19.5H3.75A2.25 2.25 0 0 1 1.5 17.25V6.75Zm18.75 0-7.883 5.26a2.25 2.25 0 0 1-2.734 0L1.75 6.75m0 10.5 6.935-4.63m12.565 4.63-6.935-4.63" />
                  </svg>
                </span>
                <input
                  style={inputFont}
                  className={`${inputBase} pl-10`}
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
              <div className="relative">
                <input
                  style={inputFont}
                  className={`${inputBase} pr-12`}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z" />
                  </svg>
                </button>
              </div>
              <button className="mt-2 w-full rounded-xl bg-[#5d86aa] px-6 py-3 text-base text-white shadow transition-all duration-300 hover:bg-[#52799a] hover:scale-105 hover:shadow-lg transform active:scale-95 font-semibold">
                Log in account
              </button>
              <button
                type="button"
                className="mx-auto block text-sm font-medium text-[#ffffff] underline-offset-4 hover:underline transition-all duration-300 hover:text-white/80 transform hover:scale-105"
                style={{
                  fontFamily:
                    "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
                }}
              >
                Forgot password
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/40"></div>
                </div>
                <div className="relative bg-[#cfe3ee] px-4">
                  <span
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    or
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-700 shadow-md border border-gray-200 transition-all duration-300 hover:bg-gray-50 hover:shadow-lg hover:scale-[1.02] transform active:scale-95 font-medium"
                onClick={() => {
                  // Placeholder for Google login - no backend integration
                  console.log("Google login clicked");
                }}
                style={{
                  fontFamily:
                    "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-[#23455b]/80"></div>
    </div>
  );
};

export default LoginModal;
