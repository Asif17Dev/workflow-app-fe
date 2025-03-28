import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <input
        {...props}
        className={`mt-2 bg-white rounded-lg border border-slate-200 w-full h-10 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    </div>
  );
};
