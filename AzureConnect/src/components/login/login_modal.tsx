import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import supabase from "../../supabaseClient";

type TabKey = "signup" | "signin" | "reset";

const LoginModal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signupNewUser, signInWithGoogle, resetPasswordForEmail, updateUserPassword, session } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // signin form state
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  // signup form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // reset password form state
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "password">("email");
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Check if we're on the reset route or have a password recovery session
  useEffect(() => {
    if (location.pathname === "/login/reset") {
      setActiveTab("reset");
      // Check URL hash for password recovery tokens (from email link)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");
      // If user has a session or recovery token in URL, show password update step
      if (session || type === "recovery") {
        setResetStep("password");
      }
    } else if (location.pathname === "/login") {
      // Check URL hash for password recovery tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");
      if (type === "recovery") {
        // Redirect to reset route if recovery token is on /login
        navigate("/login/reset", { replace: true });
        setActiveTab("reset");
        setResetStep("password");
      }
    }
  }, [location.pathname, session, navigate]);

  // Auto-route based on user role when session is available
  useEffect(() => {
    if (session?.user && location.pathname === "/login") {
      const userRole = session.user.user_metadata?.role;
      
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "agent") {
        navigate("/agent/profile");
      } else if (userRole === "user" || !userRole) {
        navigate("/user");
      }
    }
  }, [session, location.pathname, navigate]);

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
    "w-full rounded-[10px] border-2 border-[#8eb5cc] bg-white/90 placeholder:text-gray-500 text-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5d8ab0] focus:border-[#5d8ab0] transition-all duration-300 hover:bg-white hover:border-[#5d8ab0]";

  const inputFont = {
    fontFamily:
      "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
    fontSize: "16px",
  } as const;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Google sign in failed");
    }
    // OAuth flow will redirect automatically
  };

  const handleSignup = async () => {
    setErrorMessage(null);
    if (!firstName || !lastName || !mobileNumber || !signupEmail || !signupPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    // Users signing up are automatically labeled with role: "user" in AuthContext
    const res = await signupNewUser({
      firstName,
      lastName,
      mobileNumber,
      email: signupEmail,
      password: signupPassword,
    });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Signup failed");
      return;
    }
    // Optionally navigate or switch to signin
    setActiveTab("signin");
  };

  const handleSignin = async () => {
    setErrorMessage(null);
    if (!signinEmail || !signinPassword) {
      setErrorMessage("Email and password are required.");
      return;
    }
    setIsSubmitting(true);
    const res = await signIn({ email: signinEmail, password: signinPassword });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Sign in failed");
      return;
    }
    
    // Get user role from response data or session
    const signInData = res.data as any;
    const userRole = signInData?.user?.user_metadata?.role || 
                     signInData?.session?.user?.user_metadata?.role ||
                     session?.user?.user_metadata?.role;
    
    // Route based on role from database
    if (userRole === "admin") {
      navigate("/admin");
    } else if (userRole === "agent") {
      navigate("/agent/profile");
    } else {
      navigate("/user");
    }
  };

  const handleRequestReset = async () => {
    setErrorMessage(null);
    setResetSuccessMessage(null);
    if (!resetEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    setIsSubmitting(true);
    const res = await resetPasswordForEmail({ email: resetEmail });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to send reset email");
      return;
    }
    setResetSuccessMessage("Password reset email sent! Please check your inbox.");
    // Optionally switch to password update step or stay on email step
    setTimeout(() => {
      setResetStep("password");
      setResetSuccessMessage(null);
    }, 2000);
  };

  const handleUpdatePassword = async () => {
    setErrorMessage(null);
    setResetSuccessMessage(null);
    if (!newPassword || !confirmNewPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    setIsSubmitting(true);
    const res = await updateUserPassword({ password: newPassword });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to update password");
      return;
    }
    setResetSuccessMessage("Password updated successfully! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
      setActiveTab("signin");
      setResetStep("email");
      setResetEmail("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResetSuccessMessage(null);
    }, 2000);
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl bg-[#cfe3ee] p-6 shadow-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="inline-flex items-center rounded-full bg-[#3f6f97] p-1.5 shadow gap-2">
          <button
            onClick={() => handleTabChange("signup")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] flex-shrink-0 ${
              activeTab === "signup"
                ? "bg-white/40 text-white shadow-sm scale-105"
                : "text-white/90 hover:text-white hover:bg-white/20"
            }`}
            style={{
              fontFamily:
                "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
              fontSize: 16,
            }}
          >
            Sign up
          </button>
          <button
            onClick={() => handleTabChange("signin")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] flex-shrink-0 ${
              activeTab === "signin"
                ? "bg-white/40 text-white shadow-sm scale-105"
                : "text-white/90 hover:text-white hover:bg-white/20"
            }`}
            style={{
              fontFamily:
                "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
              fontSize: 16,
            }}
          >
            Sign in
          </button>
        </div>
        {activeTab === "reset" && (
          <button
            onClick={() => {
              navigate("/login");
              setActiveTab("signin");
              setResetStep("email");
              setResetEmail("");
              setNewPassword("");
              setConfirmNewPassword("");
              setErrorMessage(null);
              setResetSuccessMessage(null);
            }}
            className="text-sm text-white/90 hover:text-white transition-colors"
            style={{
              fontFamily:
                "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
            }}
          >
            Back to Sign in
          </button>
        )}
        <button
          aria-label="Back to Home"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/30 text-[#436a86] transition-all duration-300 hover:bg-white/50 hover:scale-[1.02] hover:shadow-md backdrop-blur-sm"
          onClick={() => navigate('/')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span 
            className="text-sm font-medium"
            style={{
              fontFamily: "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
            }}
          >
            Back to Home
          </span>
        </button>
        {/* Sign out control removed from login per requirements */}
      </div>

      <div className="relative overflow-hidden">
        <div className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 transform translate-y-2 scale-95' : 'opacity-100 transform translate-y-0 scale-100'}`}>
          {activeTab === "signup" ? (
            <div className="space-y-4">
              <h2 className="text-[#17364b] text-base font-semibold animate-fadeInUp">
                Create an account
              </h2>

          <div className="grid grid-cols-2 gap-3">
            <input
              style={inputFont}
              className={inputBase}
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              style={inputFont}
              className={inputBase}
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
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
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
          </div>

          <input
            style={inputFont}
            className={inputBase}
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />

          <div className="relative">
            <input
              style={inputFont}
              className={`${inputBase} pr-12`}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.2 2.2C2.49 7.05 1.14 8.8.5 10.05a2.25 2.25 0 0 0 0 1.9C2.52 16.35 6.61 19.5 12 19.5c2.1 0 3.99-.44 5.63-1.22l2.84 2.84a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.999c-4.56 0-8.13-2.77-9.9-6.047a.75.75 0 0 1 0-.704c.876-1.63 2.244-3.142 3.999-4.262l2.163 2.163A5.25 5.25 0 0 0 12 16.5c.92 0 1.787-.234 2.54-.646l1.122 1.122A10.2 10.2 0 0 1 12 18Z" />
                  <path d="M14.551 15.257 8.744 9.45A3.75 3.75 0 0 0 12 15.75c.93 0 1.788-.333 2.551-.893Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.2 2.2C2.49 7.05 1.14 8.8.5 10.05a2.25 2.25 0 0 0 0 1.9C2.52 16.35 6.61 19.5 12 19.5c2.1 0 3.99-.44 5.63-1.22l2.84 2.84a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.999c-4.56 0-8.13-2.77-9.9-6.047a.75.75 0 0 1 0-.704c.876-1.63 2.244-3.142 3.999-4.262l2.163 2.163A5.25 5.25 0 0 0 12 16.5c.92 0 1.787-.234 2.54-.646l1.122 1.122A10.2 10.2 0 0 1 12 18Z" />
                  <path d="M14.551 15.257 8.744 9.45A3.75 3.75 0 0 0 12 15.75c.93 0 1.788-.333 2.551-.893Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z" />
                </svg>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="text-red-700 text-sm">{errorMessage}</div>
          )}
          <button
            disabled={isSubmitting}
            onClick={handleSignup}
            className={`mt-6 w-full rounded-xl px-6 py-3 text-white shadow transition-all duration-300 transform active:scale-95 ${
              isSubmitting ? 'bg-[#7aa1bd] cursor-not-allowed' : 'bg-[#5d86aa] hover:bg-[#52799a] hover:scale-[1.02] hover:shadow-lg'
            }`}
          >
            {isSubmitting ? 'Creating account...' : 'Create an account'}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#8eb5cc]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#cfe3ee] px-4 text-[#17364b]/70">Or continue with</span>
            </div>
          </div>
          
          <button
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className={`w-full flex items-center justify-center gap-3 rounded-xl px-6 py-3 bg-white border-2 border-[#8eb5cc] text-gray-700 shadow transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg active:scale-95 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isSubmitting ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      ) : activeTab === "signin" ? (
        <div className="space-y-4">
          <h2 className="text-[#17364b] text-base font-semibold animate-fadeInUp">
            Welcome back
          </h2>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
              >
                <path d="M1.5 6.75A2.25 2.25 0 0 1 3.75 4.5h16.5A2.25 2.25 0 0 1 22.5 6.75v10.5A2.25 2.25 0 0 1 20.25 19.5H3.75A2.25 2.25 0 0 1 1.5 17.25V6.75Zm18.75 0-7.883 5.26a2.25 2.25 0 0 1-2.734 0L1.75 6.75m0 10.5 6.935-4.63m12.565 4.63-6.935-4.63" />
              </svg>
            </span>
            <input
              style={inputFont}
              className={`${inputBase} pl-10`}
              placeholder="Enter your email"
              type="email"
              value={signinEmail}
              onChange={(e) => setSigninEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              style={inputFont}
              className={`${inputBase} pr-12`}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={signinPassword}
              onChange={(e) => setSigninPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5"
              >
                <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z" />
              </svg>
            </button>
          </div>
          {errorMessage && (
            <div className="text-red-700 text-sm">{errorMessage}</div>
          )}
          <button
            disabled={isSubmitting}
            onClick={handleSignin}
            className={`mt-2 w-full rounded-xl px-6 py-3 text-white shadow transition-all duration-300 transform active:scale-95 ${
              isSubmitting ? 'bg-[#7aa1bd] cursor-not-allowed' : 'bg-[#5d86aa] hover:bg-[#52799a] hover:scale-[1.02] hover:shadow-lg'
            }`}
          >
            {isSubmitting ? 'Signing in...' : 'Log in account'}
          </button>
          <button
            type="button"
            onClick={() => {
              navigate("/login/reset");
              setResetStep("email");
              setErrorMessage(null);
              setResetSuccessMessage(null);
            }}
            className="mx-auto block text-sm font-medium text-[#17364b] underline-offset-4 hover:underline transition-all duration-300 hover:text-[#23455b]"
            style={{
              fontFamily:
                "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
              fontSize: 14,
            }}
          >
            Forgot password
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#8eb5cc]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#cfe3ee] px-4 text-[#17364b]/70">Or continue with</span>
            </div>
          </div>
          
          <button
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className={`w-full flex items-center justify-center gap-3 rounded-xl px-6 py-3 bg-white border-2 border-[#8eb5cc] text-gray-700 shadow transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg active:scale-95 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isSubmitting ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      ) : activeTab === "reset" ? (
        <div className="space-y-4">
          <h2 className="text-[#17364b] text-base font-semibold animate-fadeInUp">
            {resetStep === "email" ? "Reset your password" : "Set new password"}
          </h2>

          {resetStep === "email" ? (
            <>
              <p className="text-sm text-[#23455b]/80">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5"
                  >
                    <path d="M1.5 6.75A2.25 2.25 0 0 1 3.75 4.5h16.5A2.25 2.25 0 0 1 22.5 6.75v10.5A2.25 2.25 0 0 1 20.25 19.5H3.75A2.25 2.25 0 0 1 1.5 17.25V6.75Zm18.75 0-7.883 5.26a2.25 2.25 0 0 1-2.734 0L1.75 6.75m0 10.5 6.935-4.63m12.565 4.63-6.935-4.63" />
                  </svg>
                </span>
                <input
                  style={inputFont}
                  className={`${inputBase} pl-10`}
                  placeholder="Enter your email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRequestReset();
                    }
                  }}
                />
              </div>
              {errorMessage && (
                <div className="text-red-700 text-sm">{errorMessage}</div>
              )}
              {resetSuccessMessage && (
                <div className="text-green-700 text-sm">{resetSuccessMessage}</div>
              )}
              <button
                disabled={isSubmitting}
                onClick={handleRequestReset}
                className={`mt-2 w-full rounded-xl px-6 py-3 text-white shadow transition-all duration-300 transform active:scale-95 ${
                  isSubmitting
                    ? "bg-[#7aa1bd] cursor-not-allowed"
                    : "bg-[#5d86aa] hover:bg-[#52799a] hover:scale-[1.02] hover:shadow-lg"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
              <button
                type="button"
                onClick={() => setResetStep("password")}
                className="mx-auto block text-sm font-medium text-[#ffffff] underline-offset-4 hover:underline transition-all duration-300 hover:text-white/80"
                style={{
                  fontFamily:
                    "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
                  fontSize: 14,
                }}
              >
                Already have a reset token? Update password
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#23455b]/80">
                Enter your new password below.
              </p>
              <div className="relative">
                <input
                  style={inputFont}
                  className={`${inputBase} pr-12`}
                  placeholder="New Password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.2 2.2C2.49 7.05 1.14 8.8.5 10.05a2.25 2.25 0 0 0 0 1.9C2.52 16.35 6.61 19.5 12 19.5c2.1 0 3.99-.44 5.63-1.22l2.84 2.84a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.999c-4.56 0-8.13-2.77-9.9-6.047a.75.75 0 0 1 0-.704c.876-1.63 2.244-3.142 3.999-4.262l2.163 2.163A5.25 5.25 0 0 0 12 16.5c.92 0 1.787-.234 2.54-.646l1.122 1.122A10.2 10.2 0 0 1 12 18Z" />
                      <path d="M14.551 15.257 8.744 9.45A3.75 3.75 0 0 0 12 15.75c.93 0 1.788-.333 2.551-.893Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
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
                  placeholder="Confirm New Password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdatePassword();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                  aria-label={
                    showConfirmNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmNewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.2 2.2C2.49 7.05 1.14 8.8.5 10.05a2.25 2.25 0 0 0 0 1.9C2.52 16.35 6.61 19.5 12 19.5c2.1 0 3.99-.44 5.63-1.22l2.84 2.84a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.999c-4.56 0-8.13-2.77-9.9-6.047a.75.75 0 0 1 0-.704c.876-1.63 2.244-3.142 3.999-4.262l2.163 2.163A5.25 5.25 0 0 0 12 16.5c.92 0 1.787-.234 2.54-.646l1.122 1.122A10.2 10.2 0 0 1 12 18Z" />
                      <path d="M14.551 15.257 8.744 9.45A3.75 3.75 0 0 0 12 15.75c.93 0 1.788-.333 2.551-.893Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z" />
                    </svg>
                  )}
                </button>
              </div>
              {errorMessage && (
                <div className="text-red-700 text-sm">{errorMessage}</div>
              )}
              {resetSuccessMessage && (
                <div className="text-green-700 text-sm">{resetSuccessMessage}</div>
              )}
              <button
                disabled={isSubmitting}
                onClick={handleUpdatePassword}
                className={`mt-2 w-full rounded-xl px-6 py-3 text-white shadow transition-all duration-300 transform active:scale-95 ${
                  isSubmitting
                    ? "bg-[#7aa1bd] cursor-not-allowed"
                    : "bg-[#5d86aa] hover:bg-[#52799a] hover:scale-[1.02] hover:shadow-lg"
                }`}
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetStep("email");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setErrorMessage(null);
                  setResetSuccessMessage(null);
                }}
                className="mx-auto block text-sm font-medium text-[#ffffff] underline-offset-4 hover:underline transition-all duration-300 hover:text-white/80"
                style={{
                  fontFamily:
                    "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
                  fontSize: 14,
                }}
              >
                Back to email request
              </button>
            </>
          )}
        </div>
      ) : null}
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-[#23455b]/80"></div>
    </div>
  );
};

export default LoginModal;
