/**
 * Beautiful animated button with loading state and shimmer effect
 */
const AnimatedButton = ({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary: 'gradient-primary text-white shadow-lg hover:shadow-xl',
    secondary: 'gradient-secondary text-white shadow-lg hover:shadow-xl',
    accent: 'gradient-accent text-white shadow-lg hover:shadow-xl',
    outline:
      'bg-transparent border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
    ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden
        px-6 py-3 rounded-xl
        font-semibold text-base
        transition-all duration-300 ease-out
        transform hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant]}
        ${disabled || loading ? 'pointer-events-none' : ''}
      `}
      {...props}
    >
      {/* Shimmer effect during loading */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      )}

      {/* Button content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            {/* Loading spinner */}
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {Icon && <Icon size={20} />}
            {children}
          </>
        )}
      </span>

      {/* Ripple effect on click */}
      <span className="absolute inset-0 block">
        <span className="absolute inset-0 rounded-xl bg-white opacity-0 transition-opacity hover:opacity-10" />
      </span>
    </button>
  );
};

export default AnimatedButton;
