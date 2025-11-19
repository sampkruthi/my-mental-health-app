// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
//Nk 11/14 commenting for logout issue import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store'; 
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


  //making some changes for logout refresh issue 11/14 and changing to SecureStore yet
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const saved = await SecureStore.getItemAsync(TOKEN_KEY); // Changed
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

  // Restore token on mount
/* making some changes for logout refresh issue 11/14 but not changing to SecureStore yet
  useEffect(() => {
    let mounted = true;
  
    const restoreToken = async () => {
      try {
        console.log('🔄 Restoring token...');
        //const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        const saved = await AsyncStorage.getItem(TOKEN_KEY);
        
        if (mounted) {
          if (saved) {
            setTokenState(saved);
            console.log('Token restored');
          } else {
            console.log('No token found');
            setTokenState(null);
          }
          setRestoreComplete(true);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error(' Failed to restore token:', e.message);
          setError(e.message);
        } else {
          console.error(' Unknown error restoring token:', e);
          setError("Unknown error occurred");
        }
        
        if (mounted) {
          setTokenState(null); // Ensure null on error
          setRestoreComplete(true);
        }
      }
    };

    restoreToken();
    
    return () => {
      mounted = false;
    };
  }, []);
 */

    /* Commenting this to test out Login refresh issues 11/14
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
 Commenting this to test out Login refresh issues 11/14 */
  // Persist or remove token
  const setToken = useCallback(async (newToken: string | null) => {
    try {
      setLoading(true);
      if (newToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken); 
        // 11/14 logout issue 
        // await AsyncStorage.setItem(TOKEN_KEY, newToken);
        setTokenState(newToken);
        console.log("AuthProvider: token saved");
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY); 
        //11/14 logout issue  
        // await AsyncStorage.removeItem(TOKEN_KEY);
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
        if (!tokenFromServer) {
          throw new Error('No token provided');
        }
        //const finalToken = tokenFromServer ?? `fake-token-${Date.now()}`;
        await SecureStore.setItemAsync(TOKEN_KEY, tokenFromServer); 
        //11/14 logout issue
        //await AsyncStorage.setItem(TOKEN_KEY, finalToken);
        setTokenState(tokenFromServer);
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

  /* 11/14 commenting for logout issues to try SecureStorage

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      await AsyncStorage.removeItem(TOKEN_KEY);
      
      // Also clear user_id if stored
      try {
        await AsyncStorage.removeItem('user_id');
      } catch (e) {
        if (e instanceof Error) {
          console.error(" No userid to clear", e.message);
          setError(e.message);
        } else {
          setError("Unknown error occurred");
        }
        
      }
      
      setTokenState(null);
      queryClient.clear(); // Clear all cached queries
      console.log(" AuthProvider: signed out");
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(" AuthProvider: signOut failed", e.message);
        setError(e.message);
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [queryClient]);


  11/14 commenting for logout issues to try SecureStorage */

  /* commenting to test out logout issues 11/14 but not using SecureStorage yet
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
  commenting to test out logout issues 11/14 */ 


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
