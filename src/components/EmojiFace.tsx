import React from 'react';
import { cn } from '@/lib/utils';

interface EmojiFaceProps {
  rating: number;
  className?: string;
}

export const EmojiFace: React.FC<EmojiFaceProps> = ({ rating, className }) => {
  const getStyles = () => {
    switch (rating) {
      case 1:
        return { color: '#EF4444', path: <path d="M8 15s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> };
      case 2:
        return { color: '#F97316', path: <path d="M8 14s1.5-1 4-1 4 1 4 1M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> };
      case 3:
        return { color: '#FACC15', path: <path d="M8 14h8M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> };
      case 4:
        return { color: '#4ADE80', path: <path d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> };
      case 5:
        return { color: '#17CFCF', path: <path d="M8 13s1.5 3 4 3 4-3 4-3M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> };
      default:
        return { color: '#94A3B8', path: null };
    }
  };

  const { color, path } = getStyles();

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full transition-transform active:scale-90", className)}
      style={{ color }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      {path}
    </svg>
  );
};