// javascript
import axios from 'axios';
import {ACCESS_TOKEN, REFRESH_TOKEN} from "../constants.js";

const Api = axios.create({
  baseURL: 'https://serene-woodland-45485-b6d1865e6702.herokuapp.com',
  // Optionally add headers, timeouts, etc.
});
Api.interceptors.request.use(config => {
    const token = localStorage.getItem(ACCESS_TOKEN); // Adjust token retrieval as necessary
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));


// // Example Api service for registration
// export const registerUser = async (userData) => {
//     const response = await Api.post('/learning/auth/register/', userData);
//     localStorage.setItem(ACCESS_TOKEN, response.data.access);
//     localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
//     return response.data;
// };
//
// // Similarly, the login function without a try/catch
// export const loginUser = async (credentials) => {
//     const response = await Api.post('/learning/auth/login/', credentials);
//     localStorage.setItem(ACCESS_TOKEN, response.data.access);
//     localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
//     return response.data;
// };
//
// // Api service for assignment (corrected endpoint)
// export const getLessons = async () => {
//     const response = await Api.get('/learning/assignment/');
//     return response.data;
// };
//
// // Api service for profile
// export const getProfile = async () => {
//     const response = await Api.get('/learning/profile/');
//     return response.data;
// };

export default Api;