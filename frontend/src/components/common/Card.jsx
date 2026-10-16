import React from 'react';

export default function Card({
  children,
  className = '',
  hover = true,
  onClick = null,
  as: Component = 'div',
  ...props
}) {
  const hoverClass = hover
    ? 'hover:border-stone-300 hover:shadow-sm transition-all duration-150'
    : '';
  const interactiveClass = onClick
    ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 active:scale-[0.99]'
    : '';

  return (
    <Component
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={`bg-white rounded-xl border border-stone-200/90 shadow-xs p-5 ${hoverClass} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
