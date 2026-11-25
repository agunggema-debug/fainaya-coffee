'use client';

import React from 'react';

interface NeumorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string | boolean;
}

export function NeumorphicInput({
  className = '',
  label,
  ...props
}: NeumorphicInputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm text-coffee-700 font-medium mb-1">
          {label}
        </label>
      )}
      <input
        className={`neumorphic-input w-full px-4 py-2 text-coffee-700 ${className}`}
        {...props}
      />
    </div>
  );
}