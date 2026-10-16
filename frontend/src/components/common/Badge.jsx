import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const variants = {
    default: 'bg-stone-100 text-stone-800 border border-stone-300/80',
    high: 'bg-rose-50 text-rose-800 border border-rose-300 font-semibold',
    medium: 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold',
    low: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold',
    visited: 'bg-teal-50 text-teal-800 border border-teal-300 font-semibold',
    farthest: 'bg-orange-50 text-orange-950 border border-orange-300 font-bold tracking-tight',
    category: 'bg-stone-100 text-stone-700 border border-stone-200 font-medium',
    gps: 'bg-sky-50 text-sky-800 border border-sky-300 font-semibold',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-normal',
    lg: 'text-sm px-3 py-1.5 leading-normal',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
}
