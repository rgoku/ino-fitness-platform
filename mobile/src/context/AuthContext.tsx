import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasOnboarded: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  appleSignIn: () => Promise<void>;
  biometricLogin: () => Promise<void>;
  completeOnboarding: (biometrics: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const checkAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setHasOnboarded(userData.hasOnboarded);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const login = useCallback(async (email: string, password: string) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    setHasOnboarded(userData.hasOnboarded);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const userData = await authService.signup(email, password, name);
    setUser(userData);
    setHasOnboarded(userData.hasOnboarded);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setHasOnboarded(false);
  }, []);

  const appleSignIn = useCallback(async () => {
    const userData = await authService.appleSignIn();
    setUser(userData);
    setHasOnboarded(userData.hasOnboarded);
  }, []);

  const biometricLogin = useCallback(async () => {
    const userData = await authService.biometricLogin();
    setUser(userData);
    setHasOnboarded(userData.hasOnboarded);
  }, []);

  const completeOnboarding = useCallback(async (biometrics: any) => {
    if (user) {
      await authService.completeOnboarding(user.id, biometrics);
      setHasOnboarded(true);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      hasOnboarded,
      login,
      signup,
      logout,
      appleSignIn,
      biometricLogin,
      completeOnboarding,
    }),
    [user, loading, hasOnboarded, login, signup, logout, appleSignIn, biometricLogin, completeOnboarding]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

