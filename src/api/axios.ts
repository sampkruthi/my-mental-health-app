// src/api/axios.ts
import axios from "axios";

const BASE_URL = process.env.API_URL || "http://localhost:4000";

export function createClient(token?: string | null) {
  const client = axios.create({
    baseURL: BASE_URL, // ✅ always uses /api
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // --- Debug interceptors ---
  client.interceptors.request.use((config) => {
    console.log(
      "Axios Request:",
      config.method?.toUpperCase(),
      (config.baseURL ?? "") + (config.url ?? ""),
      config.data
    );
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      console.log("Axios Response:", response.status, response.data);
      return response;
    },
    (error) => {
      console.error(
        "Axios Error:",
        error.message,
        error.response?.data
      );
      return Promise.reject(error);
    }
  );

  return client;
}
