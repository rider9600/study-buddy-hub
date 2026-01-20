import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
interface AuthContextType 
{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) 
{
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem('studyflow_user');
    if(storedUser) 
    {
    try 
    {
    setUser(JSON.parse(storedUser));
    }
    catch
    {
    localStorage.removeItem('studyflow_user');
    }
    }
    setIsLoading(false);
  },[]);
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const storedUsers = localStorage.getItem('studyflow_users');
    const users: Record<string, { password: string; user: User }> = storedUsers?JSON.parse(storedUsers): {};
    if (users[email] && users[email].password === password) {
      setUser(users[email].user);
      localStorage.setItem('studyflow_user', JSON.stringify(users[email].user));
      return true;
    }
    return false;
  }, []);
  const signup=useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    const storedUsers = localStorage.getItem('studyflow_users');
    const users: Record<string, { password: string; user: User }> = storedUsers? JSON.parse(storedUsers): {};
    if (users[email]) 
    {
      return false;
    }
    const newUser:User= 
    {
      id: crypto.randomUUID(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };
    users[email] = { password, user: newUser };
    localStorage.setItem('studyflow_users', JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem('studyflow_user', JSON.stringify(newUser));
    return true;
  },[]);
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('studyflow_user');
  }, []);
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }}>
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
