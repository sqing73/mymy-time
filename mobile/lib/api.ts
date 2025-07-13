import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 200000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here
    // const token = await getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized access");
    } else if (error.response?.status === 500) {
      console.log("Server error");
    }
    return Promise.reject(error);
  }
);

export const apiEndpoints = {
  aiActivityExtraction: "/ai/activity-extraction",
  aiImageGeneration: "/ai/activity-image-generation",
} as const;
