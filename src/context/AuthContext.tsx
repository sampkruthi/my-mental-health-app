// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "jwt";

type AuthContextType = {
  token: string | null;
  loading: boolean;          // loading while restoring or signing in/out
  error: string | null;
  setToken: (t: string | null) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreComplete: boolean;  // true after initial restore attempt
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [restoreComplete, setRestoreComplete] = useState(false);

  // On mount: restore token from AsyncStorage
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
      } catch (e: any) {
        console.error("AuthProvider: failed to restore token", e);
        setError(String(e));
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
    } catch (e: any) {
      console.error("AuthProvider: setToken failed", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Example signIn — replace fetch with your API
  const signIn = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // EXAMPLE: simulate network call or call your API
      // const resp = await fetch('https://api.example.com/auth/login', { method: 'POST', body: JSON.stringify({ username, password })});
      // const json = await resp.json();
      // const tokenFromServer = json.token;

      // For now, simulate a small delay and return fake token:
      await new Promise((r) => setTimeout(r, 600)); // simulate latency
      const tokenFromServer = `fake-token-${Date.now()}`;

      await AsyncStorage.setItem(TOKEN_KEY, tokenFromServer);
      setTokenState(tokenFromServer);
      console.log("AuthProvider: signIn success");
    } catch (e: any) {
      console.error("AuthProvider: signIn failed", e);
      setError(String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem(TOKEN_KEY);
      setTokenState(null);
      setError(null);
      console.log("AuthProvider: signed out");
    } catch (e: any) {
      console.error("AuthProvider: signOut failed", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

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

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
