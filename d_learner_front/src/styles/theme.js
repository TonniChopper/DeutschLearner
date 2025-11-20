/**
 * Theme Configuration
 * Centralized theme values matching index.css
 */

export const colors = {
  primary: {
    DEFAULT: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
  },
  secondary: {
    DEFAULT: '#ec4899',
    light: '#f472b6',
  },
  accent: {
    DEFAULT: '#14b8a6',
    light: '#2dd4bf',
  },
  neutral: {
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
};

export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ocean: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  forest: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
};

export default {
  colors,
  gradients,
  shadows,
  transitions,
  breakpoints,
  spacing,
};
