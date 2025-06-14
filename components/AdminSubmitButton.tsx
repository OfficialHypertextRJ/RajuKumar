import React from 'react';

interface AdminSubmitButtonProps {
  label: string;
  isLoading: boolean;
  loadingLabel?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function AdminSubmitButton({
  label,
  isLoading,
  loadingLabel = 'Saving...',
  onClick,
  type = 'submit',
  variant = 'primary'
}: AdminSubmitButtonProps) {
  const baseClasses = "px-6 py-3 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-[#3bcf9a] text-black hover:bg-[#2eaf82] focus:ring-[#3bcf9a]",
    secondary: "bg-[#333] text-white hover:bg-[#444] focus:ring-[#333]",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
} 