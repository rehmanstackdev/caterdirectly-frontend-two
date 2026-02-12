import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to properly join URLs without double slashes
const joinUrl = (base: string, path: string): string => {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}/${cleanPath}`;
};

// Function to log API calls to audit_logs
const logAuditCall = async (url: string, method: string, statusCode: number, errorJson: any = null) => {
  // Skip logging if it's the audit-logs endpoint itself to avoid infinite loops
  if (url.includes('audit-logs') || url.includes('swagger')) {
    return;
  }

  try {
    await axios.post(joinUrl(API_BASE_URL, 'audit-logs'), {
      api_name: url,
      method: method.toUpperCase(),
      status_code: statusCode,
      error_json: errorJson,
    });
  } catch (error) {
    // Silent fail - don't break the app if audit logging fails
    console.warn('Failed to log audit:', error);
  }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Only log errors, not successful requests
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const statusCode = error.response?.status || 500;

    // Log only failed API calls (errors)
    const errorJson = {
      message: errorMessage,
      statusCode: statusCode,
      ...(error.response?.data || {}),
    };

    if (error.config?.url) {
      logAuditCall(error.config.url, error.config.method || 'GET', statusCode, errorJson);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_role');
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(url: string, config?: any) => apiClient.get<T>(url, config).then(res => res.data),
  post: <T>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config).then(res => res.data),
  put: <T>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config).then(res => res.data),
  patch: <T>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config).then(res => res.data),
  delete: <T>(url: string, config?: any) => apiClient.delete<T>(url, config).then(res => res.data),
};

export default api;
