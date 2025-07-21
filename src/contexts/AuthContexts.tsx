import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
