import { useState } from 'react';

/**
 * Beautiful animated input component with floating labels
 */
const FloatingInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  icon: Icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;
  const shouldFloat = isFocused || hasValue;

  return (
    <div className="relative w-full mb-6">
      {/* Input container with glass effect */}
      <div
        className={`
        relative glass rounded-xl overflow-hidden
        transition-all duration-300 ease-out
        ${isFocused ? 'shadow-glow ring-2 ring-indigo-400/50' : 'shadow-md'}
        ${error && touched ? 'ring-2 ring-red-400/50' : ''}
      `}
      >
        {/* Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300">
            <Icon size={20} className={isFocused ? 'text-indigo-500' : ''} />
          </div>
        )}

        {/* Input field */}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={e => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          className={`
            w-full px-4 py-4 bg-transparent
            ${Icon ? 'pl-12' : ''}
            text-gray-800 placeholder-transparent
            outline-none transition-all duration-300
            peer
          `}
          placeholder={label}
          {...props}
        />

        {/* Floating label */}
        <label
          htmlFor={name}
          className={`
            absolute left-4 ${Icon ? 'left-12' : ''} pointer-events-none
            transition-all duration-300 ease-out
            ${
              shouldFloat
                ? 'top-2 text-xs text-indigo-600 font-medium'
                : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
            }
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Bottom border animation */}
        <div
          className={`
          absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500
          transition-all duration-300 ease-out
          ${isFocused ? 'w-full' : 'w-0'}
        `}
        />
      </div>

      {/* Error message with animation */}
      <div
        className={`
        overflow-hidden transition-all duration-300 ease-out
        ${error && touched ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}
      `}
      >
        <p className="text-red-500 text-sm flex items-center animate-slide-in-left">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      </div>
    </div>
  );
};

export default FloatingInput;
