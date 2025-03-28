import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <select
        {...props}
        className={`mt-2 bg-white rounded-lg border border-slate-200 w-full h-10 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
