import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Api from '../api/api';
import { ACCESS_TOKEN, REFRESH_TOKEN, ENDPOINTS } from '../constants';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if token is valid
  const isTokenValid = useCallback(token => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshToken || !isTokenValid(refreshToken)) {
      return false;
    }

    try {
      const response = await Api.post(ENDPOINTS.REFRESH_TOKEN, {
        refresh: refreshToken,
      });
      localStorage.setItem(ACCESS_TOKEN, response.data.access);
      return true;
    } catch {
      return false;
    }
  }, [isTokenValid]);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await Api.get(ENDPOINTS.PROFILE);
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const accessToken = localStorage.getItem(ACCESS_TOKEN);

      if (accessToken && isTokenValid(accessToken)) {
        await loadUserProfile();
      } else {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          await loadUserProfile();
        } else {
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [isTokenValid, refreshAccessToken, loadUserProfile]);

  // Auto refresh token before expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);
      if (accessToken) {
        const decoded = jwtDecode(accessToken);
        const timeUntilExpiry = decoded.exp * 1000 - Date.now();

        // Refresh 5 minutes before expiration
        if (timeUntilExpiry < 5 * 60 * 1000) {
          await refreshAccessToken();
        }
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAccessToken]);

  // Login function
  const login = useCallback(
    async (username, password) => {
      try {
        const response = await Api.post(ENDPOINTS.LOGIN, { username, password });
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        await loadUserProfile();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.detail || 'Login failed. Please check your credentials.',
        };
      }
    },
    [loadUserProfile]
  );

  // Register function
  const register = useCallback(
    async formData => {
      try {
        const response = await Api.post(ENDPOINTS.REGISTER, formData);
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        await loadUserProfile();
        return { success: true };
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Registration failed. Please try again.';
        return { success: false, error: errorMessage };
      }
    },
    [loadUserProfile]
  );

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
    loadUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
