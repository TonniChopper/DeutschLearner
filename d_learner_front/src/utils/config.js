/**
 * Environment configuration utilities
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  apiPrefix: import.meta.env.VITE_API_PREFIX || '/learning',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  appName: import.meta.env.VITE_APP_NAME || 'DeutschLearner',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enableWebSockets: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
};

export const getApiUrl = () => `${config.apiUrl}${config.apiPrefix}`;
export const getWsUrl = () => config.wsUrl;

export default config;
