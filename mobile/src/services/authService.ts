import auth from '@react-native-firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { apiService } from './apiService';

class AuthService {
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('auth_token', token);
      
      const userData = await apiService.get<User>('/users/me');
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: name });
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('auth_token', token);
      
      // Create user in backend
      const userData = await apiService.post<User>('/users', {
        firebaseUid: userCredential.user.uid,
        email,
        name,
      });
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('auth_token');
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  async appleSignIn(): Promise<User> {
    try {
      // Apple Sign-In implementation
      // Note: This requires expo-apple-authentication package
      // For now, we'll return an error if not implemented
      throw new Error('Apple Sign-In requires expo-apple-authentication package. Please install it and configure Apple Sign-In.');
      
      // Uncomment when expo-apple-authentication is installed:
      // const credential = await AppleAuthentication.signInAsync({
      //   requestedScopes: [
      //     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      //     AppleAuthentication.AppleAuthenticationScope.EMAIL,
      //   ],
      // });
      // 
      // if (credential.identityToken) {
      //   const appleCredential = auth.AppleAuthProvider.credential(
      //     credential.identityToken,
      //     credential.authorizationCode || undefined
      //   );
      //   
      //   const userCredential = await auth().signInWithCredential(appleCredential);
      //   const token = await userCredential.user.getIdToken();
      //   await AsyncStorage.setItem('auth_token', token);
      //   
      //   const userData = await apiService.get<User>('/users/me');
      //   return userData;
      // }
    } catch (error: any) {
      throw new Error(error.message || 'Apple sign in failed');
    }
  }

  async biometricLogin(): Promise<User> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        throw new Error('Biometric authentication is not available');
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        throw new Error('No biometrics enrolled');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to sign in',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        throw new Error('Biometric authentication failed');
      }

      // Get stored biometric token or user ID
      const biometricUserId = await AsyncStorage.getItem('biometric_user_id');
      if (!biometricUserId) {
        throw new Error('No biometric account found. Please login first.');
      }

      // Retrieve user from backend
      const userData = await apiService.get<User>(`/users/${biometricUserId}`);
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Biometric login failed');
    }
  }

  async enableBiometric(userId: string): Promise<void> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        throw new Error('Biometric authentication is not available');
      }

      await AsyncStorage.setItem('biometric_user_id', userId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to enable biometric');
    }
  }

  async getCurrentUser(): Promise<User> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No auth token found');
    }
    
    return await apiService.get<User>('/users/me');
  }

  async completeOnboarding(userId: string, biometrics: any): Promise<void> {
    await apiService.post(`/users/${userId}/onboarding`, biometrics);
  }
}

export const authService = new AuthService();

