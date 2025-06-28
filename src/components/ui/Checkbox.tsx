import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, disabled, ...props }) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    className={`
      h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500
      dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400
      transition
    `}
    {...props}
  />
);

export default Checkbox;