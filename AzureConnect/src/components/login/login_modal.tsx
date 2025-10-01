import { useState } from "react"

type TabKey = "signup" | "signin"

export default function LoginModal() {
  const [activeTab, setActiveTab] = useState<TabKey>("signup")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const inputBase =
    "w-full rounded-[10px] border border-[#a8c1d3] bg-[#b8cfdd]/60 placeholder:text-white/80 text-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5d8ab0] focus:border-transparent"

  const inputFont = {
    fontFamily: "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
    fontSize: "16px",
  } as const

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative w-full max-w-md rounded-2xl bg-[#cfe3ee] p-6 shadow-2xl">
        {/* Tabs and Close aligned horizontally */}
        <div className="mb-8 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full bg-[#3f6f97] p-1 shadow">
            <button
              onClick={() => setActiveTab("signup")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === "signup" ? "bg-white/40 text-white shadow-sm" : "text-white/90"
              }`}
              style={{ fontFamily: "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter", fontSize: 16 }}
            >
              Sign up
            </button>
            <button
              onClick={() => setActiveTab("signin")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === "signin" ? "bg-white/40 text-white shadow-sm" : "text-white/90"
              }`}
              style={{ fontFamily: "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter", fontSize: 16 }}
            >
              Sign in
            </button>
          </div>
          <button
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-white/40 text-[#436a86] transition hover:bg-white/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {activeTab === "signup" ? (
          <div className="space-y-4">
            <h2 className="text-[#17364b] text-base font-semibold">Create an account</h2>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
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

            {/* Email */}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="size-5">
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

            {/* Mobile */}
            <input style={inputFont} className={inputBase} placeholder="Mobile Number" />

            {/* Password */}
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.2 2.2C2.49 7.05 1.14 8.8.5 10.05a2.25 2.25 0 0 0 0 1.9C2.52 16.35 6.61 19.5 12 19.5c2.1 0 3.99-.44 5.63-1.22l2.84 2.84a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.999c-4.56 0-8.13-2.77-9.9-6.047a.75.75 0 0 1 0-.704c.876-1.63 2.244-3.142 3.999-4.262l2.163 2.163A5.25 5.25 0 0 0 12 16.5c.92 0 1.787-.234 2.54-.646l1.122 1.122A10.2 10.2 0 0 1 12 18Z"/>
                    <path d="M14.551 15.257 8.744 9.45A3.75 3.75 0 0 0 12 15.75c.93 0 1.788-.333 2.551-.893Z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Confirm Password */}
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
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.2 2.2C2.49 7.05 1.14 8.8.5 10.05a2.25 2.25 0 0 0 0 1.9C2.52 16.35 6.61 19.5 12 19.5c2.1 0 3.99-.44 5.63-1.22l2.84 2.84a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.999c-4.56 0-8.13-2.77-9.9-6.047a.75.75 0 0 1 0-.704c.876-1.63 2.244-3.142 3.999-4.262l2.163 2.163A5.25 5.25 0 0 0 12 16.5c.92 0 1.787-.234 2.54-.646l1.122 1.122A10.2 10.2 0 0 1 12 18Z"/>
                    <path d="M14.551 15.257 8.744 9.45A3.75 3.75 0 0 0 12 15.75c.93 0 1.788-.333 2.551-.893Z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Submit */}
            <button className="mt-6 w-full rounded-xl bg-[#5d86aa] px-6 py-3 text-white shadow transition hover:bg-[#52799a]">
              Create an account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-[#17364b] text-base font-semibold">Welcome back</h2>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/90">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="size-5">
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
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M12 5.25C6.61 5.25 2.52 8.4.5 12.05a2.25 2.25 0 0 0 0 1.9C2.52 17.85 6.61 21 12 21s9.48-3.15 11.5-7.05a2.25 2.25 0 0 0 0-1.9C21.48 8.4 17.39 5.25 12 5.25Zm0 12.75a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5Z"/>
                </svg>
              </button>
            </div>
            <button className="mt-2 w-full rounded-xl bg-[#5d86aa] px-6 py-3 text-white shadow transition hover:bg-[#52799a]">
              Log in account
            </button>
            <button
              type="button"
              className="mx-auto block text-sm font-medium text-[#ffffff] underline-offset-4 hover:underline"
              style={{ fontFamily: "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter", fontSize: 14 }}
            >
              Forgot password
            </button>
          </div>
        )}

        {/* Helper text */}
        <div className="mt-6 text-center text-xs text-[#23455b]/80">
        </div>
      </div>
    </div>
  )
}


