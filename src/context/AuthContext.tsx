// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { storage, STORAGE_KEYS } from "../utils/storage";

import jwtDecode from 'jwt-decode';



type AuthContextType = {
  token: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  setToken: (token: string | null, userId?: string | null) => Promise<void>;
  signIn: (email: string, password: string, token: string, userId?: string) => Promise<void>;
  signInWithToken: (token: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreComplete: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [restoreComplete, setRestoreComplete] = useState(false);

  // Add helper function
const isTokenValid = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      // Check if token is expired (exp is in seconds, Date.now() is in ms)
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  // Restore token and userId on mount
  useEffect(() => {
    let mounted = true;

    const restoreAuth = async () => {
      try {
        console.log('Restoring authentication...');
        setLoading(true);
        
        const [savedToken, savedUserId] = await Promise.all([
          storage.getItem(STORAGE_KEYS.TOKEN),
          storage.getItem(STORAGE_KEYS.USER_ID),
        ]);

        if (mounted) {
          if (savedToken) {
            if (isTokenValid(savedToken)) {
            setTokenState(savedToken);
            setUserIdState(savedUserId);
            console.log('Auth restored:', { hasToken: !!savedToken, userId: savedUserId });
            }
            else {
                console.log('⚠️ Token expired, clearing...');
            await storage.removeItem(STORAGE_KEYS.TOKEN);
            await storage.removeItem(STORAGE_KEYS.USER_ID);
            }
          } else {
            console.log('No saved auth found');
          }
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        console.error('Failed to restore auth:', errorMessage);
        if (mounted) {
          setError(errorMessage);
          // Clear potentially corrupted data
          await storage.removeItem(STORAGE_KEYS.TOKEN);
          await storage.removeItem(STORAGE_KEYS.USER_ID);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setRestoreComplete(true);
        }
      }
    };

    restoreAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Set or clear token (and optionally userId)
  const setToken = useCallback(async (newToken: string | null, newUserId: string | null = null) => {
    try {
      setLoading(true);
      
      if (newToken) {
        console.log(' Saving auth token');
        await storage.setItem(STORAGE_KEYS.TOKEN, newToken);
        setTokenState(newToken);
        
        if (newUserId) {
          await storage.setItem(STORAGE_KEYS.USER_ID, newUserId);
          setUserIdState(newUserId);
        }
      } else {
        console.log(' Clearing auth token');
        await Promise.all([
          storage.removeItem(STORAGE_KEYS.TOKEN),
          storage.removeItem(STORAGE_KEYS.USER_ID),
        ]);
        setTokenState(null);
        setUserIdState(null);
      }
      
      setError(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error(' setToken failed:', errorMessage);
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in - stores token and userId
  const signIn = useCallback(
    async (email: string, password: string, tokenFromServer: string, userIdFromServer?: string) => {
      try {
        setLoading(true);
        
        if (!tokenFromServer) {
          throw new Error('No token provided from server');
        }

        const userIdToStore = userIdFromServer || email; // Default to email if no userId provided
        
        console.log(' Signing in:', { email, userId: userIdToStore });
        
        await Promise.all([
          storage.setItem(STORAGE_KEYS.TOKEN, tokenFromServer),
          storage.setItem(STORAGE_KEYS.USER_ID, userIdToStore),
        ]);
        
        setTokenState(tokenFromServer);
        setUserIdState(userIdToStore);
        setError(null);
        
        // Invalidate all queries to force refetch with new token
        queryClient.invalidateQueries();
        
        console.log(' Sign in successful');
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        console.error(' signIn failed:', errorMessage);
        setError(errorMessage);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  // Sign in with token only (for OAuth flows like Google Sign-In)
  const signInWithToken = useCallback(
    async (tokenFromServer: string, userIdFromServer: string) => {
      try {
        setLoading(true);

        if (!tokenFromServer) {
          throw new Error('No token provided from server');
        }

        console.log(' Signing in with token (OAuth):', { userId: userIdFromServer });

        await Promise.all([
          storage.setItem(STORAGE_KEYS.TOKEN, tokenFromServer),
          storage.setItem(STORAGE_KEYS.USER_ID, userIdFromServer),
        ]);

        setTokenState(tokenFromServer);
        setUserIdState(userIdFromServer);
        setError(null);

        queryClient.invalidateQueries();

        console.log(' OAuth sign in successful');
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        console.error(' signInWithToken failed:', errorMessage);
        setError(errorMessage);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  // Sign out - clears everything
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      console.log(' Signing out...');
      
      // Clear stored credentials
      await Promise.all([
        storage.removeItem(STORAGE_KEYS.TOKEN),
        storage.removeItem(STORAGE_KEYS.USER_ID),
      ]);
      
      // Clear state
      setTokenState(null);
      setUserIdState(null);
      setError(null);
      
      // Clear all cached queries
      queryClient.clear();
      
      console.log(' Signed out successfully');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error(' signOut failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        loading,
        error,
        setToken,
        signIn,
        signInWithToken,
        signOut,
        restoreComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to consume AuthContext
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
