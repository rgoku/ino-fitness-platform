// Type declarations for modules that may not be installed yet

declare module '@react-native-firebase/auth' {
  interface FirebaseAuthTypes {
    signInWithEmailAndPassword(email: string, password: string): Promise<any>;
    createUserWithEmailAndPassword(email: string, password: string): Promise<any>;
    signOut(): Promise<void>;
    currentUser: any;
  }

  interface User {
    getIdToken(): Promise<string>;
    uid: string;
    updateProfile(profile: { displayName?: string }): Promise<void>;
  }

  interface Auth {
    (): FirebaseAuthTypes;
    AppleAuthProvider: {
      credential(identityToken: string, authorizationCode?: string): any;
    };
  }

  const auth: Auth;
  export default auth;
}

declare module 'expo-local-authentication' {
  export function hasHardwareAsync(): Promise<boolean>;
  export function isEnrolledAsync(): Promise<boolean>;
  export function authenticateAsync(options: {
    promptMessage?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
  }): Promise<{ success: boolean }>;
}

declare module '@react-native-async-storage/async-storage' {
  export default {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
  };
}

declare module '@react-native-firebase/app' {
  export default {};
}

declare module 'expo-apple-authentication' {
  export enum AppleAuthenticationScope {
    FULL_NAME = 'FULL_NAME',
    EMAIL = 'EMAIL',
  }

  export function signInAsync(options: {
    requestedScopes: AppleAuthenticationScope[];
  }): Promise<{
    identityToken: string | null;
    authorizationCode: string | null;
  }>;
}

declare module '@react-native-google-signin/google-signin' {
  export class GoogleSignin {
    static configure(options: any): void;
    static signIn(): Promise<any>;
  }
}


