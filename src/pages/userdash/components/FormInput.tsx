import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormInputProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  type,
  label,
  value,
  onChange,
  icon: Icon,
  required = false,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          type={type}
          required={required}
          className="bg-gray-700 text-white pl-10 py-2 block w-full rounded-md border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
