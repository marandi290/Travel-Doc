import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`text-center py-12 px-6 rounded-2xl border-2 border-dashed border-stone-300 bg-white shadow-xs ${className}`}
    >
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-bold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-sm text-stone-600 max-w-md mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
