import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  hint,
  icon: Icon,
  required = false,
  maxLength,
  disabled = false,
  className = '',
  dir,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const effectiveType = isPasswordType ? (showPassword ? 'text' : 'password') : type;
  const hasError = Boolean(touched && error);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id || name} className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-pink-400">*</span>}
          </label>
          {maxLength && (
            <span className="text-[11px] text-slate-400">
              {(value || '').length}/{maxLength}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 rtl:left-auto rtl:right-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id || name}
          name={name}
          type={effectiveType}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          disabled={disabled}
          dir={dir}
          className={`w-full px-4 py-3 rounded-2xl glass-input text-sm text-white placeholder-slate-400/60 transition-all ${
            Icon ? 'pl-10 rtl:pl-4 rtl:pr-10' : ''
          } ${isPasswordType ? 'pr-11 rtl:pr-4 rtl:pl-11' : ''} ${
            hasError ? 'glass-input-error' : ''
          }`}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 rtl:right-auto rtl:left-3.5 p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {hint && !hasError && (
        <p className="text-[11px] text-slate-400 leading-normal">{hint}</p>
      )}

      {hasError && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1 animate-fade-in">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
