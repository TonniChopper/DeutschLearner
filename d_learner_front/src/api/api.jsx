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

export default Api;