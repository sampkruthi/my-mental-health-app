// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

const TOKEN_KEY = "jwt";

type AuthContextType = {
  token: string | null;
  loading: boolean;
  error: string | null;
  setToken: (t: string | null) => Promise<void>;
  signIn: (email: string, password: string, tokenFromServer?: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreComplete: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [restoreComplete, setRestoreComplete] = useState(false);

  // Restore token on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const saved = await AsyncStorage.getItem(TOKEN_KEY);
        if (mounted && saved) {
          setTokenState(saved);
          console.log("AuthProvider: restored token");
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error("AuthProvider: failed to restore token", e.message);
          setError(e.message);
        } else {
          console.error("AuthProvider: unknown error", e);
          setError("Unknown error occurred");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setRestoreComplete(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist or remove token
  const setToken = useCallback(async (newToken: string | null) => {
    try {
      setLoading(true);
      if (newToken) {
        await AsyncStorage.setItem(TOKEN_KEY, newToken);
        setTokenState(newToken);
        console.log("AuthProvider: token saved");
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setTokenState(null);
        console.log("AuthProvider: token removed");
      }
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("AuthProvider: setToken failed", e.message);
        setError(e.message);
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in
  const signIn = useCallback(
    async (email: string, password: string, tokenFromServer?: string) => {
      try {
        setLoading(true);
        const finalToken = tokenFromServer ?? `fake-token-${Date.now()}`;
        await AsyncStorage.setItem(TOKEN_KEY, finalToken);
        setTokenState(finalToken);
        setError(null);
        queryClient.invalidateQueries();
        console.log("AuthProvider: signed in");
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error("AuthProvider: signIn failed", e.message);
          setError(e.message);
          throw e;
        } else {
          setError("Unknown error occurred");
          throw new Error("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await setToken(null);
      queryClient.invalidateQueries();
      console.log("AuthProvider: signed out");
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("AuthProvider: signOut failed", e.message);
        setError(e.message);
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [queryClient, setToken]);

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        error,
        setToken,
        signIn,
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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
