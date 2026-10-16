import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  helperText = '',
  required = false,
  className = '',
  icon: Icon = null,
  ...props
}) {
  const generatedId = React.useId();
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : generatedId);
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-600 font-bold" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`block w-full rounded-lg border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:border-forest-700 ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } py-2 min-h-[40px] ${
            error
              ? 'border-rose-400 text-rose-900 placeholder-rose-400 bg-rose-50/20 focus-visible:ring-rose-600 focus-visible:border-rose-600'
              : 'border-stone-300 text-stone-900 placeholder-stone-400 bg-white hover:border-stone-400'
          }`}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1 text-xs text-stone-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
