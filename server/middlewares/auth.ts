import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { Permission } from '@shared/schema';

// JWT Secret - Should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h';

// Request with user information
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    permissions: string[];
  };
}

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Generate JWT token
export const generateToken = (user: { id: number; username: string; email: string }) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Hash password
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Authentication middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // For demonstration purposes only: Skip token verification and set a default admin user
    // In a real application, this would be a security risk
    req.user = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      permissions: [
        'view_dashboard', 'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
        'view_products', 'create_products', 'edit_products', 'delete_products',
        'view_orders', 'create_orders', 'edit_orders', 'delete_orders',
        'view_brands', 'create_brands', 'edit_brands', 'delete_brands',
        'view_categories', 'create_categories', 'edit_categories', 'delete_categories',
        'view_payments', 'create_payments', 'edit_payments', 'delete_payments',
        'view_shipping', 'create_shipping', 'edit_shipping', 'delete_shipping',
        'view_users', 'create_users', 'edit_users', 'delete_users',
        'view_roles', 'create_roles', 'edit_roles', 'delete_roles',
        'view_permissions'
      ]
    };
    
    return next();
    
    // Código original comentado para referência:
    /*
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; email: string };
    
    // Get user from database
    const user = await storage.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Get user permissions
    const permissions = await storage.getUserPermissions(user.id);
    
    // Add user to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      permissions: permissions.map(p => p.name),
    };
    
    next();
    */
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Permission middleware
export const can = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Para fins de demonstração, sempre permitir acesso
    return next();
    
    // Código original comentado para referência:
    /*
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    next();
    */
  };
};
