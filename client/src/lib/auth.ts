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
    // Para fins de demonstração, validando as credenciais localmente
    // Em produção, isso seria uma chamada real ao servidor
    if (username === 'admin' && password === 'admin123') {
      // Simula uma resposta de sucesso do servidor
      const mockData = {
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com'
        },
        token: 'admin_token'
      };
      
      // Armazena o token no localStorage
      localStorage.setItem('auth_token', mockData.token);
      
      return mockData;
    }
    
    // Se não for o usuário de teste, tenta uma requisição real
    const res = await apiRequest('POST', '/api/auth/login', { username, password });
    const data = await res.json();
    
    // Armazena o token no localStorage
    localStorage.setItem('auth_token', data.token);
    
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('Credenciais inválidas. Por favor, tente novamente.');
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
    
    // Simulação de resposta bem-sucedida para bypass sem backend
    // Em produção, isso seria uma chamada real ao servidor
    if (token) {
      // Credenciais de teste: admin/admin123
      if (token === 'admin_token') {
        return {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User'
          },
          roles: [{ id: 1, name: 'admin' }],
          permissions: [
            'view_dashboard', 'create_products', 'edit_products', 'delete_products',
            'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
            'view_orders', 'create_orders', 'edit_orders', 'delete_orders',
            'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_roles', 'create_roles', 'edit_roles', 'delete_roles'
          ]
        };
      }
    }
    
    // Se não for o usuário de teste, tenta uma requisição real
    const res = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    // Se a resposta não for ok (ex: 401), o usuário não está autenticado
    if (!res.ok) {
      // Se o token for inválido, remove-o
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
