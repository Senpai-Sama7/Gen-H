import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  apiKey: string | null;
  login: (apiKey: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for existing API key on mount
  useEffect(() => {
    const storedKey = api.getApiKey();
    if (storedKey) {
      validateAndSetKey(storedKey);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateAndSetKey = async (key: string) => {
    try {
      setIsLoading(true);
      api.setApiKey(key);
      
      // Test the key with a health check
      await api.health();
      
      setApiKey(key);
      setIsAuthenticated(true);
      setError(null);
      return true;
    } catch (err) {
      api.clearApiKey();
      setError('Invalid API key');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (key: string): Promise<boolean> => {
    setError(null);
    const success = await validateAndSetKey(key);
    return success;
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setApiKey(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        apiKey,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
