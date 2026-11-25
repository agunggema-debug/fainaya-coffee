'use client';

import React from 'react';

interface NeumorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'pressed' | 'danger' | 'success';
  className?: string;
  children?: React.ReactNode;
}

export function NeumorphicButton({
  variant = 'default',
  className = '',
  children,
  ...props
}: NeumorphicButtonProps) {
  const baseStyles = 'neumorphic-btn px-6 py-3 text-coffee-700 font-semibold';
  const variantStyles = {
    default: '',
    pressed: 'neumorphic-pressed',
    danger: 'text-red-600',
    success: 'text-green-600',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}