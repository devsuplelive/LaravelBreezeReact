import { apiRequest } from './queryClient';

// Types
interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
  };
  token: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface UserData {
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  roles: { id: number; name: string }[];
  permissions: string[];
}

// Login function
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const res = await apiRequest('POST', '/api/auth/login', { username, password });
    const data = await res.json();
    
    // Store token in localStorage
    localStorage.setItem('auth_token', data.token);
    
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Register function
export const register = async (userData: RegisterData): Promise<LoginResponse> => {
  try {
    const res = await apiRequest('POST', '/api/auth/register', userData);
    const data = await res.json();
    
    // Store token in localStorage
    localStorage.setItem('auth_token', data.token);
    
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('auth_token');
};

// Get current user
export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    // If no token, user is not logged in
    if (!token) {
      return null;
    }
    
    const res = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    // If response is not ok (e.g., 401), user is not authenticated
    if (!res.ok) {
      // If token is invalid, remove it
      if (res.status === 401) {
        localStorage.removeItem('auth_token');
      }
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
