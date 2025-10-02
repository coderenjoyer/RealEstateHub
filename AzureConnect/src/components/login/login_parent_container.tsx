import React from "react";
import LoginModalContainer from "./login_modal_container";

const LoginParentContainer: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8"
      style={{
        background:
          "linear-gradient(to bottom, #7BBDE8 0%, #0A4174 50%, #001D39 100%)",
        fontFamily: "Ubuntu, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Ubuntu:wght@400;500;700&display=swap');
      `}</style>
      <div className="w-full max-w-[90rem]">
        <LoginModalContainer />
      </div>
    </div>
  );
};

export default LoginParentContainer;
