// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { storage, STORAGE_KEYS } from "../utils/storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AppState, AppStateStatus } from "react-native";        
import * as AppleAuthentication from "expo-apple-authentication";
import * as Sentry from "@sentry/react-native";


import { jwtDecode } from 'jwt-decode';

const APPLE_USER_ID_KEY = 'bodhira_apple_user_id';
const AUTH_PROVIDER_KEY  = 'bodhira_auth_provider';


type AuthContextType = {
  token: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  setToken: (token: string | null, userId?: string | null) => Promise<void>;
  signIn: (email: string, password: string, token: string, userId?: string) => Promise<void>;
  signInWithToken: (token: string, userId: string, appleUserId?: string) => Promise<void>;
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


  // ─── Apple Credential State ──────────────────────────────────────────────
const appState = useRef(AppState.currentState);
const recentlySignedIn = useRef(false);
const recentlySignedInTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

const checkAppleCredentialState = useCallback(async (): Promise<boolean> => {
  try {
    const provider = await storage.getItem(AUTH_PROVIDER_KEY);
    if (provider !== 'apple') return true; // Not an Apple user, skip

    const appleUserId = await storage.getItem(APPLE_USER_ID_KEY);
    if (!appleUserId) return true; // No stored Apple ID, skip

    /*
    // Grace period: don't check credentials within 30 seconds of sign-in.
    // iOS 18+ has a credential propagation delay after fresh Apple Sign-In.
    // The in-memory recentlySignedIn flag handles foreground checks, but
    // this persisted timestamp handles the case where the user kills and
    // reopens the app immediately after signing in.
    const appleSignInTime = await storage.getItem('bodhira_apple_signin_time');
    if (appleSignInTime) {
      const elapsed = Date.now() - parseInt(appleSignInTime, 10);
      if (elapsed < 30000) {
        console.log('[AuthContext] Within Apple sign-in grace period, skipping credential check');
        return true;
      }
    }

    */
    const state = await AppleAuthentication.getCredentialStateAsync(appleUserId);

    if (
      state === AppleAuthentication.AppleAuthenticationCredentialState.REVOKED ||
      state === AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND
    ) {
      console.log('[AuthContext] Apple credential invalid, signing out. State:', state);
      // We call the raw cleanup here, not signOut(), to avoid circular dependency
      await Promise.all([
        storage.removeItem(STORAGE_KEYS.TOKEN),
        storage.removeItem(STORAGE_KEYS.USER_ID),
        storage.removeItem(APPLE_USER_ID_KEY),
        storage.removeItem(AUTH_PROVIDER_KEY),
      ]);
      setTokenState(null);
      setUserIdState(null);
      queryClient.clear();
      return false;
    }

    // AUTHORIZED — all good
    return true;
  } catch (error) {
    // If check fails (e.g. device offline), be conservative — don't sign out
    console.warn('[AuthContext] Apple credential check failed, allowing session:', error);
    return true;
  }
}, [queryClient]);

// Re-check Apple credential whenever app comes back to foreground
useEffect(() => {
  const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
    const wasBackground = appState.current.match(/inactive|background/);
    const isNowActive   = nextState === 'active';

    if (wasBackground && isNowActive && token) {
      //Adding for newer IOS where credential propagation takes a bit longer, 
      // Skip check if we just signed in — iOS 18 credential propagation delay
      if (recentlySignedIn.current) {
        console.log('[AuthContext] Skipping credential check — just signed in');
        appState.current = nextState;
        return;
      }
      console.log('[AuthContext] App foregrounded, checking Apple credential state');
      await checkAppleCredentialState();
    }
    appState.current = nextState;
  });

  return () => subscription.remove();
}, [checkAppleCredentialState, token]);

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
              // Check Apple credential state before restoring session
          const provider = await storage.getItem(AUTH_PROVIDER_KEY);
          if (provider === 'apple') {
            const appleStillValid = await checkAppleCredentialState();
            if (!appleStillValid) {
              console.log('[AuthContext] Apple session revoked, not restoring');
              return; // checkAppleCredentialState already cleared storage
            }
          }
            setTokenState(savedToken);
            setUserIdState(savedUserId);
            console.log('Auth restored:', { hasToken: !!savedToken, userId: savedUserId });
            }
            else {
                console.log('Token expired, clearing...');
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
    async (tokenFromServer: string, userIdFromServer: string, appleUserId?: string) => {
      try {
        setLoading(true);

        if (!tokenFromServer) {
          throw new Error('No token provided from server');
        }

      //Suppress AppState credential check for 5 seconds after sign-in
      recentlySignedIn.current = true;
      if (recentlySignedInTimer.current) clearTimeout(recentlySignedInTimer.current);
      recentlySignedInTimer.current = setTimeout(() => {
        recentlySignedIn.current = false;
      }, 5000);  

        console.log(' Signing in with token (OAuth):', { userId: userIdFromServer });

        await Promise.all([
          storage.setItem(STORAGE_KEYS.TOKEN, tokenFromServer),
          storage.setItem(STORAGE_KEYS.USER_ID, userIdFromServer),
        ]);

        if (appleUserId) {
          await Promise.all([
            storage.setItem(APPLE_USER_ID_KEY, appleUserId),
            storage.setItem(AUTH_PROVIDER_KEY, 'apple'),
          ]);
          console.log(' Apple user ID saved for credential state checks');
        } else {
          // Clear any previous Apple data if signing in via different method
          await Promise.all([
            storage.removeItem(APPLE_USER_ID_KEY).catch(() => {}),
            storage.removeItem(AUTH_PROVIDER_KEY).catch(() => {}),
          ]);
        }

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
      
      // Sign out from Google Sign-In - use both revokeAccess and signOut
      try {
        // Revoke access (more aggressive - revokes the access token)
        try {
          await GoogleSignin.revokeAccess();
          console.log(' Revoked Google access');
        } catch (revokeError) {
          console.log(' Revoke access skipped:', revokeError);
        }
        
        // Sign out (clears the session)
        try {
          await GoogleSignin.signOut();
          console.log(' Signed out from Google');
        } catch (signOutError) {
          console.log(' Sign out skipped:', signOutError);
        }
      } catch (googleError) {
        // Ignore Google sign-out errors (user might not have signed in with Google)
        console.log(' Google cleanup completed with errors:', googleError);
      }
      
      await Promise.all([
        storage.removeItem(APPLE_USER_ID_KEY).catch(() => {}),
        storage.removeItem(AUTH_PROVIDER_KEY).catch(() => {}),
      ]);
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
      Sentry.setUser(null);
      
      console.log(' Signed out successfully');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error(' signOut failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    return () => {
      if (recentlySignedInTimer.current) {
        clearTimeout(recentlySignedInTimer.current);
      }
    };
  }, []);


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
