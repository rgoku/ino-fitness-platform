/**
 * Auth service — talks directly to the FastAPI backend (/api/v1/auth/*).
 * Stores the access token in AsyncStorage; apiService reads it on every request.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { apiService } from './apiService';

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  created_at?: string;
  access_token?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<User> {
    const resp = await apiService.post<LoginResponse>('/auth/login', { email, password });
    await AsyncStorage.setItem('auth_token', resp.access_token);
    if (resp.refresh_token) await AsyncStorage.setItem('refresh_token', resp.refresh_token);
    return await apiService.get<User>('/auth/me');
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    // Register returns user data (some backend versions also return tokens)
    const reg = await apiService.post<RegisterResponse>('/auth/register', { email, password, name });

    // If register returned a token, store it; otherwise call login
    let token = reg.access_token;
    if (!token) {
      const login = await apiService.post<LoginResponse>('/auth/login', { email, password });
      token = login.access_token;
      if (login.refresh_token) await AsyncStorage.setItem('refresh_token', login.refresh_token);
    }
    await AsyncStorage.setItem('auth_token', token);
    return await apiService.get<User>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout', {}).catch(() => undefined);
    } finally {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
    }
  }

  async appleSignIn(): Promise<User> {
    throw new Error('Apple Sign-In not configured. Use email login.');
  }

  async biometricLogin(): Promise<User> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) throw new Error('Biometric authentication is not available');

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) throw new Error('No biometrics enrolled');

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to sign in',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    if (!result.success) throw new Error('Biometric authentication failed');

    // Token already exists in storage — just return user
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No saved session. Please login first.');
    return await apiService.get<User>('/auth/me');
  }

  async enableBiometric(_userId: string): Promise<void> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) throw new Error('Biometric authentication is not available');
    await AsyncStorage.setItem('biometric_enabled', '1');
  }

  async getCurrentUser(): Promise<User> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token found');
    return await apiService.get<User>('/auth/me');
  }

  async completeOnboarding(_userId: string, biometrics: any): Promise<void> {
    await apiService.post('/users/onboarding', biometrics);
  }
}

export const authService = new AuthService();
