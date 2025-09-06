import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);

  // On mount, read token from AsyncStorage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwt');
        if (storedToken) setTokenState(storedToken);
      } catch (err) {
        console.error('Failed to load token from AsyncStorage', err);
      }
    };
    loadToken();
  }, []);

  // Wrapper to persist/delete token whenever it changes
  const setToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem('jwt', newToken);
      } else {
        await AsyncStorage.removeItem('jwt');
      }
      setTokenState(newToken);
    } catch (err) {
      console.error('Failed to update token in AsyncStorage', err);
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easier usage
export const useAuth = () => useContext(AuthContext);
