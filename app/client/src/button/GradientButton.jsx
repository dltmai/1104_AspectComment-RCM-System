import React from "react";

const GradientButton = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center px-8 py-4 border-0 relative overflow-hidden rounded-full transition-all duration-50 font-thin cursor-pointer text-gray-900 z-0 shadow-sm hover:bg-blue-100 hover:text-indigo-900 active:scale-97"
    >
      {children}
      <div className="absolute inset-0 flex items-center justify-center z-1">
        <div className="bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-400 rounded-full w-40 h-40 transition-all duration-400 blur-xl animate-spin opacity-50 hover:w-32 hover:h-32"></div>
      </div>
    </button>
  );
};

export default GradientButton;
