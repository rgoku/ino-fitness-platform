import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueue } from './offlineQueue';
import * as Sentry from '@sentry/react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || 'v1';
const BASE_URL = `${API_URL}/api/${API_VERSION}`;

function isNetworkError(error: any): boolean {
  return (
    !error.response &&
    (error.code === 'NETWORK_ERROR' ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error')
  );
}

class ApiService {
  private client: AxiosInstance;
  private _isOnline: boolean = true;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    NetInfo.addEventListener((state) => {
      this._isOnline = state.isConnected ?? false;
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status && error.response.status >= 500) {
          Sentry.captureException(error, {
            tags: {
              endpoint: error.config?.url,
              method: error.config?.method,
            },
          });
        }
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  get isOnline(): boolean {
    return this._isOnline;
  }

  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      // GETs are not queued; callers use cache when offline
      if (!this.isOnline || isNetworkError(error)) {
        throw new Error('Offline');
      }
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      if (!this.isOnline || isNetworkError(error)) {
        await offlineQueue.queueRequest('POST', url, data);
        throw new Error('Offline');
      }
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      if (!this.isOnline || isNetworkError(error)) {
        await offlineQueue.queueRequest('PUT', url, data);
        throw new Error('Offline');
      }
      throw error;
    }
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      if (!this.isOnline || isNetworkError(error)) {
        await offlineQueue.queueRequest('PATCH', url, data);
        throw new Error('Offline');
      }
      throw error;
    }
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error: any) {
      if (!this.isOnline || isNetworkError(error)) {
        await offlineQueue.queueRequest('DELETE', url);
        throw new Error('Offline');
      }
      throw error;
    }
  }

  // File upload
  async uploadFile<T>(url: string, file: any, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });

    return response.data;
  }
}

export const apiService = new ApiService();

