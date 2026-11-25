'use client';

import React from 'react';

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  padding?: boolean;
}

export function NeumorphicCard({
  className = '',
  children,
  padding = true,
  ...props
}: NeumorphicCardProps) {
  return (
    <div
      className={`neumorphic-card p-6 ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}