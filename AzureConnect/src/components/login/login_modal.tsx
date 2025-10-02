import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../ui/text_input";
import EmailInput from "../ui/email-input";

type TabKey = "signup" | "signin";

const LoginModal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("signup");

  const tabs = [
    { key: "signup", label: "Sign up" },
    { key: "signin", label: "Sign in" },
  ];

  const tabFont = {
    fontFamily:
      "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
    fontSize: 16,
  } as const;

  return (
    <div className="relative w-full max-w-md rounded-2xl bg-[#cfe3ee] p-6 shadow-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="inline-flex items-center rounded-full bg-[#3f6f97] p-1 shadow">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-white/40 text-white shadow-sm"
                  : "text-white/90"
              }`}
              style={tabFont}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          aria-label="Close"
          className="grid size-9 place-items-center rounded-full bg-white/40 text-[#436a86] transition hover:bg-white/60"
          onClick={() => navigate('/')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-5"
          >
            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {activeTab === "signup" ? (
        <div className="space-y-4">
          <h2 className="text-[#17364b] text-base font-semibold">
            Create an account
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="First name" />
            <Input placeholder="Last name" />
          </div>

          <EmailInput placeholder="Enter your email" />

          <Input placeholder="Mobile Number" />

          <Input
            type="password"
            showPasswordToggle={true}
            placeholder="Password"
          />

          <Input
            type="password"
            showPasswordToggle={true}
            placeholder="Confirm Password"
          />

          <button className="mt-6 w-full rounded-xl bg-[#5d86aa] px-6 py-3 text-white shadow transition hover:bg-[#52799a]">
            Create an account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-[#17364b] text-base font-semibold">
            Welcome back
          </h2>
          <EmailInput placeholder="Enter your email" />
          <Input
            type="password"
            showPasswordToggle={true}
            placeholder="Password"
          />
          <button className="mt-2 w-full rounded-xl bg-[#5d86aa] px-6 py-3 text-white shadow transition hover:bg-[#52799a]">
            Log in account
          </button>
          <button
            type="button"
            className="mx-auto block text-sm font-medium text-[#ffffff] underline-offset-4 hover:underline"
            style={{
              fontFamily:
                "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter",
              fontSize: 14,
            }}
          >
            Forgot password
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-[#23455b]/80"></div>
    </div>
  );
};

export default LoginModal;
