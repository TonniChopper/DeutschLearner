// javascript
import axios from 'axios';

const Api = axios.create({
  baseURL: 'https://your-backend-api-url.com/api',
  // Optionally add headers, timeouts, etc.
});

// Example Api service for registration
export const registerUser = async (userData) => {
    const response = await Api.post('/register', userData);
    return response.data;
};

// Similarly, the login function without a try/catch
export const loginUser = async (credentials) => {
    const response = await Api.post('/login', credentials);
    return response.data;
};