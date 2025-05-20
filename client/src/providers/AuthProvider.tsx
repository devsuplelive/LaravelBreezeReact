import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { login, logout, register, getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  roles: { id: number; name: string }[];
  permissions: string[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  roles: [],
  permissions: [],
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      
      if (data) {
        setUser(data.user);
        setRoles(data.roles || []);
        setPermissions(data.permissions || []);
      } else {
        setUser(null);
        setRoles([]);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setUser(null);
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      const data = await login(username, password);
      
      setUser(data.user);
      await checkAuthStatus(); // Fetch roles and permissions
      
      toast({
        title: 'Login Successful',
        description: `Welcome, ${data.user.username}!`,
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setRoles([]);
    setPermissions([]);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const handleRegister = async (userData: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => {
    try {
      setLoading(true);
      const data = await register(userData);
      
      setUser(data.user);
      await checkAuthStatus(); // Fetch roles and permissions
      
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${data.user.username}!`,
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Could not register. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    // Temporariamente retornar true para todas as permissões
    return true;
  };

  const hasRole = (roleName: string) => {
    // Temporariamente retornar true para todos os roles
    return true;
  };

  const value = {
    user,
    roles,
    permissions,
    isAuthenticated: !!user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
