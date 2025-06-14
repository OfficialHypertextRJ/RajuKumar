'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  connectAuthEmulator,
  getIdToken
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

// Debug flag - set to true to enable detailed logging
const DEBUG = true;

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Enable Firebase Auth Emulator in development if needed
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('Using Firebase Auth Emulator');
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  // }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (DEBUG) console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      if (user) {
        // Force token refresh to ensure we have the latest custom claims
        try {
          await user.getIdToken(true);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    if (DEBUG) console.log('Attempting email login:', email);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (DEBUG) console.log('Email login successful');
      // Force token refresh after login
      await result.user.getIdToken(true);
      return result;
    } catch (error) {
      if (DEBUG) console.error('Email login error:', error);
      throw error;
    }
  }

  async function loginWithGoogle() {
    if (DEBUG) console.log('Attempting Google login');
    try {
      // Force the selection of an account every time
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      if (DEBUG) console.log('Google login successful:', result.user.email);
      // Force token refresh after login
      await result.user.getIdToken(true);
      return result;
    } catch (error) {
      if (DEBUG) console.error('Google login error:', error);
      throw error;
    }
  }

  async function logout() {
    if (DEBUG) console.log('Logging out');
    return signOut(auth);
  }

  async function refreshToken() {
    if (!currentUser) {
      throw new Error('No user is logged in');
    }
    try {
      // Force a token refresh
      const token = await currentUser.getIdToken(true);
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    logout,
    loading,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 