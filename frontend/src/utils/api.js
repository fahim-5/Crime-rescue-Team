import axios from "axios";

// Base API URL for all requests
const BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear localStorage and potentially redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// API endpoint definitions
export const endpoints = {
  // Auth endpoints
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    adminSignup: "/auth/admin/signup",
    policeSignup: "/auth/police/signup",
    profile: "/auth/profile",
    forgotPassword: "/auth/forgot-password",
    verifyResetCode: "/auth/verify-reset-code",
    resetPasswordWithCode: "/auth/reset-password-with-code",
  },

  // Report endpoints
  reports: {
    list: "/reports",
    detail: (id) => `/reports/${id}`,
    create: "/reports",
    update: (id) => `/reports/${id}`,
    delete: (id) => `/reports/${id}`,
  },

  // Police-specific endpoints
  police: {
    dashboard: "/police/dashboard",
    reports: "/police/reports",
    requests: "/police/requests",
  },

  // Police station endpoints
  policeStations: {
    list: "/police-stations",
    detail: (id) => `/police-stations/${id}`,
  },

  // Admin-specific endpoints
  admin: {
    dashboard: "/analytics/dashboard",
    validations: "/verification",
    users: "/admin/users",
    userDetail: (id) => `/admin/users/${id}`,
    deleteUser: (id) => `/admin/users/${id}`,
    database: {
      getTables: "/admin/database/tables",
      getTableStats: "/admin/database/stats",
      purgeData: "/admin/database/purge",
    },
  },

  // Notification endpoints
  notifications: {
    list: "/notifications",
    read: (id) => `/notifications/${id}/read`,
  },

  // Crime alerts endpoints
  crimeAlerts: {
    list: "/crime-alerts",
    create: "/crime-alerts",
    update: (id) => `/crime-alerts/${id}`,
    delete: (id) => `/crime-alerts/${id}`,
  },
};

export default api;
