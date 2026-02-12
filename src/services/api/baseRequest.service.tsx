import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type Flags = {
  fullResponse?: boolean;
  errorsRedirect?: boolean;
};

type RequestFunction = Promise<AxiosResponse<any>>;

type ErrorType = {
  response?: {
    status: number;
  };
};

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

const errorsRedirectHandler = (error: any): void => {
  if (!error.response) {
    console.error("Unknown error", error);
    throw error; // Rethrow unknown errors
  }

  const { status } = error.response;

  if ([401, 400, 404, 409, 500].includes(status)) {
    throw error; // Rethrow specific status codes
  } else if (status === 403) {
    document.location.href = "/";
  } else {
    console.log(error);
    throw error; // Rethrow other errors
  }
};

export default class BaseRequestService {
  async request(fn: RequestFunction, flags: Flags = {}): Promise<any> {
    try {
      const result = await fn;

      // Only log errors, not successful requests

      if (!result.status && flags.errorsRedirect) {
        return errorsRedirectHandler(result);
      }

      return flags.fullResponse ? result : result.data;
    } catch (error: any) {
      // Log only failed API calls (errors)
      const statusCode = error.response?.status || 500;
      const errorJson = {
        message: error.response?.data?.message || error.message || 'An error occurred',
        statusCode: statusCode,
        ...(error.response?.data || {}),
      };

      if (error.config?.url) {
        logAuditCall(error.config.url, error.config.method || 'GET', statusCode, errorJson);
      }

      if (flags.errorsRedirect) {
        errorsRedirectHandler(error as ErrorType);
      }
      throw error; // Always rethrow the error to propagate it to the caller
    }
  }

  async get(url: string, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.get(url, config);
    return this.request(promise, flags);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.post(url, data, config);
    return this.request(promise, flags);
  }

  async delete(url: string, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.delete(url, config);
    return this.request(promise, flags);
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.patch(url, data, config);
    return this.request(promise, flags);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.put(url, data, config);
    return this.request(promise, flags);
  }
}