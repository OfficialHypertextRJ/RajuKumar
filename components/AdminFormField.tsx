import React from 'react';

interface AdminFormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'url' | 'file';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  accept?: string;
  helperText?: string;
  multiline?: boolean;
  fullWidth?: boolean;
  InputProps?: {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
  };
}

export default function AdminFormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  rows = 4,
  accept,
  helperText,
  multiline = false,
  fullWidth = true,
  InputProps
}: AdminFormFieldProps) {
  const useTextarea = type === 'textarea' || multiline;
  
  return (
    <div className={`mb-6 ${fullWidth ? 'w-full' : ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {useTextarea ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3bcf9a] focus:border-transparent text-white resize-none"
        />
      ) : type === 'file' ? (
        <input
          id={id}
          type="file"
          onChange={onChange}
          required={required}
          accept={accept}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#3bcf9a] file:text-black hover:file:bg-[#2eaf82] file:cursor-pointer cursor-pointer"
        />
      ) : (
        <div className="relative">
          {InputProps?.startAdornment && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {InputProps.startAdornment}
            </div>
          )}
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3bcf9a] focus:border-transparent text-white ${InputProps?.startAdornment ? 'pl-10' : ''} ${InputProps?.endAdornment ? 'pr-10' : ''}`}
          />
          {InputProps?.endAdornment && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {InputProps.endAdornment}
            </div>
          )}
        </div>
      )}
      
      {helperText && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
} 