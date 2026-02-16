import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
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
  };

  const login = async (email: string, password: string) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    setHasOnboarded(userData.hasOnboarded);
  };

  const signup = async (email: string, password: string, name: string) => {
    const userData = await authService.signup(email, password, name);
    setUser(userData);
    setHasOnboarded(userData.hasOnboarded);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setHasOnboarded(false);
  };

  const appleSignIn = async () => {
    const userData = await authService.appleSignIn();
    setUser(userData);
    setHasOnboarded(userData.hasOnboarded);
  };

  const biometricLogin = async () => {
    const userData = await authService.biometricLogin();
    setUser(userData);
    setHasOnboarded(userData.hasOnboarded);
  };

  const completeOnboarding = async (biometrics: any) => {
    if (user) {
      await authService.completeOnboarding(user.id, biometrics);
      setHasOnboarded(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasOnboarded,
        login,
        signup,
        logout,
        appleSignIn,
        biometricLogin,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

