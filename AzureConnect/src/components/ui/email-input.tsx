import React from "react";
import Input from "./text_input";

interface EmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({ className = "", ...props }) => {
  const EmailIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      className="size-5"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );

  return (
    <Input
      type="email"
      leftIcon={<EmailIcon />}
      className={className}
      {...props}
    />
  );
};

export default EmailInput;
