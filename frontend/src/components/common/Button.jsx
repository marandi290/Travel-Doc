import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon = null,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

  const variants = {
    primary:
      'bg-forest-800 hover:bg-forest-900 text-white focus-visible:ring-forest-700 shadow-xs hover:shadow-sm active:bg-forest-950',
    secondary:
      'bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 focus-visible:ring-stone-500 shadow-xs',
    outline:
      'bg-transparent border border-forest-800 text-forest-800 hover:bg-forest-50 focus-visible:ring-forest-700',
    accent:
      'bg-terracotta-700 hover:bg-terracotta-800 text-white focus-visible:ring-terracotta-600 shadow-xs hover:shadow-sm',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500 shadow-xs',
    ghost:
      'text-stone-700 hover:text-stone-900 hover:bg-stone-100 focus-visible:ring-stone-400',
  };

  const sizes = {
    sm: 'text-xs min-h-[34px] px-3 py-1.5 gap-1.5',
    md: 'text-sm min-h-[40px] px-4 py-2 gap-2',
    lg: 'text-base min-h-[44px] px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          aria-hidden="true"
        />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </button>
  );
}
