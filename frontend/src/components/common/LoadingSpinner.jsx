import React from 'react';

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  className = '',
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-10 gap-3 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-stone-200 border-t-forest-700 animate-spin`}
        role="status"
        aria-label="loading"
      />
      {message && <p className="text-xs font-medium text-stone-500 tracking-wide">{message}</p>}
    </div>
  );
}
