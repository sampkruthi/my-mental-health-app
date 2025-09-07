// axios.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export const createClient = (token?: string): AxiosInstance => {
  // Create a typed headers object
  const headers: AxiosRequestConfig['headers'] = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  // Create axios instance
  const instance = axios.create({
    baseURL: 'https://api.example.com', // replace with your API
    headers,
    timeout: 10000, // optional: 10s timeout
  });

  // Optional: Add interceptors
  instance.interceptors.request.use((config) => {
    // you can log or modify config before sending request
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Optional: centralized error handling
      console.error('Axios error:', error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};
