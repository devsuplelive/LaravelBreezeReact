import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Request, Response } from "express";
import { authenticate, can, AuthRequest, loginSchema, generateToken, hashPassword, verifyPassword } from "./middlewares/auth";
import { 
  insertUserSchema, insertRoleSchema, insertPermissionSchema, 
  insertCustomerSchema, insertBrandSchema, insertCategorySchema, 
  insertProductSchema, insertOrderSchema, insertOrderItemSchema,
  insertPaymentSchema, insertShippingSchema
} from "@shared/schema";
import { PERMISSIONS, ROLE_PERMISSIONS, USER_ROLES } from "@shared/constants";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== AUTH ROUTES =====
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Assign default viewer role to the user
      const viewerRole = await storage.getRoleByName(USER_ROLES.VIEWER);
      if (viewerRole) {
        await storage.assignRoleToUser(user.id, viewerRole.id);
      }
      
      // Generate token
      const token = generateToken(user);
      
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email 
        }, 
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      const isMatch = await verifyPassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user);
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email 
        }, 
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error during login' });
    }
  });
  
  app.get('/api/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const permissions = await storage.getUserPermissions(user.id);
      const roles = await storage.getUserRoles(user.id);
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName 
        },
        roles: roles.map(r => ({ id: r.id, name: r.name })),
        permissions: permissions.map(p => p.name)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ===== USERS ROUTES =====
  app.get('/api/users', authenticate, can(PERMISSIONS.VIEW_USERS), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { users, total } = await storage.getUsers(page, limit, search);
      
      res.json({ users, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching users' });
    }
  });
  
  app.get('/api/users/:id', authenticate, can(PERMISSIONS.VIEW_USERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUserWithRoles(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching user' });
    }
  });
  
  app.post('/api/users', authenticate, can(PERMISSIONS.CREATE_USERS), async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Handle roles if provided
      if (req.body.roles && Array.isArray(req.body.roles)) {
        for (const roleId of req.body.roles) {
          await storage.assignRoleToUser(user.id, roleId);
        }
      }
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating user' });
    }
  });
  
  app.put('/api/users/:id', authenticate, can(PERMISSIONS.EDIT_USERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If username is being updated, check if it's already taken
      if (userData.username && userData.username !== existingUser.username) {
        const userWithUsername = await storage.getUserByUsername(userData.username);
        if (userWithUsername) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }
      
      // If email is being updated, check if it's already in use
      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await storage.getUserByEmail(userData.email);
        if (userWithEmail) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(id, userData);
      
      // Handle roles if provided
      if (req.body.roles && Array.isArray(req.body.roles)) {
        // Get current roles
        const currentRoles = await storage.getUserRoles(id);
        const currentRoleIds = currentRoles.map(r => r.id);
        const newRoleIds = req.body.roles;
        
        // Remove roles that are no longer assigned
        for (const roleId of currentRoleIds) {
          if (!newRoleIds.includes(roleId)) {
            await storage.removeRoleFromUser(id, roleId);
          }
        }
        
        // Add new roles
        for (const roleId of newRoleIds) {
          if (!currentRoleIds.includes(roleId)) {
            await storage.assignRoleToUser(id, roleId);
          }
        }
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating user' });
    }
  });
  
  app.delete('/api/users/:id', authenticate, can(PERMISSIONS.DELETE_USERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if user exists
      const existingUser = await storage.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete user
      await storage.deleteUser(id);
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting user' });
    }
  });

  // ===== ROLES ROUTES =====
  app.get('/api/roles', authenticate, can(PERMISSIONS.VIEW_ROLES), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { roles, total } = await storage.getRoles(page, limit, search);
      
      res.json({ roles, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching roles' });
    }
  });
  
  app.get('/api/roles/:id', authenticate, can(PERMISSIONS.VIEW_ROLES), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const role = await storage.getRoleWithPermissions(id);
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching role' });
    }
  });
  
  app.post('/api/roles', authenticate, can(PERMISSIONS.CREATE_ROLES), async (req: Request, res: Response) => {
    try {
      const roleData = insertRoleSchema.parse(req.body);
      
      // Check if role already exists
      const existingRole = await storage.getRoleByName(roleData.name);
      if (existingRole) {
        return res.status(400).json({ message: 'Role name already exists' });
      }
      
      // Create role
      const role = await storage.createRole(roleData);
      
      // Handle permissions if provided
      if (req.body.permissions && Array.isArray(req.body.permissions)) {
        for (const permissionId of req.body.permissions) {
          await storage.assignPermissionToRole(role.id, permissionId);
        }
      }
      
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating role' });
    }
  });
  
  app.put('/api/roles/:id', authenticate, can(PERMISSIONS.EDIT_ROLES), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const roleData = insertRoleSchema.partial().parse(req.body);
      
      // Check if role exists
      const existingRole = await storage.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // If name is being updated, check if it's already taken
      if (roleData.name && roleData.name !== existingRole.name) {
        const roleWithName = await storage.getRoleByName(roleData.name);
        if (roleWithName) {
          return res.status(400).json({ message: 'Role name already exists' });
        }
      }
      
      // Update role
      const updatedRole = await storage.updateRole(id, roleData);
      
      // Handle permissions if provided
      if (req.body.permissions && Array.isArray(req.body.permissions)) {
        // Get current permissions
        const currentPermissions = await storage.getRolePermissions(id);
        const currentPermissionIds = currentPermissions.map(p => p.id);
        const newPermissionIds = req.body.permissions;
        
        // Remove permissions that are no longer assigned
        for (const permissionId of currentPermissionIds) {
          if (!newPermissionIds.includes(permissionId)) {
            await storage.removePermissionFromRole(id, permissionId);
          }
        }
        
        // Add new permissions
        for (const permissionId of newPermissionIds) {
          if (!currentPermissionIds.includes(permissionId)) {
            await storage.assignPermissionToRole(id, permissionId);
          }
        }
      }
      
      res.json(updatedRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating role' });
    }
  });
  
  app.delete('/api/roles/:id', authenticate, can(PERMISSIONS.DELETE_ROLES), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if role exists
      const existingRole = await storage.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Delete role
      await storage.deleteRole(id);
      
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting role' });
    }
  });

  // ===== PERMISSIONS ROUTES =====
  app.get('/api/permissions', authenticate, can(PERMISSIONS.VIEW_PERMISSIONS), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { permissions, total } = await storage.getPermissions(page, limit, search);
      
      res.json({ permissions, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching permissions' });
    }
  });
  
  app.get('/api/permissions/:id', authenticate, can(PERMISSIONS.VIEW_PERMISSIONS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const permission = await storage.getPermissionById(id);
      
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }
      
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching permission' });
    }
  });

  // ===== CUSTOMERS ROUTES =====
  app.get('/api/customers', authenticate, can(PERMISSIONS.VIEW_CUSTOMERS), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { customers, total } = await storage.getCustomers(page, limit, search);
      
      res.json({ customers, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching customers' });
    }
  });
  
  app.get('/api/customers/:id', authenticate, can(PERMISSIONS.VIEW_CUSTOMERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const customer = await storage.getCustomerById(id);
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching customer' });
    }
  });
  
  app.post('/api/customers', authenticate, can(PERMISSIONS.CREATE_CUSTOMERS), async (req: Request, res: Response) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Check if customer with same email already exists
      const existingCustomer = await storage.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer with this email already exists' });
      }
      
      // Create customer
      const customer = await storage.createCustomer(customerData);
      
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating customer' });
    }
  });
  
  app.put('/api/customers/:id', authenticate, can(PERMISSIONS.EDIT_CUSTOMERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      
      // Check if customer exists
      const existingCustomer = await storage.getCustomerById(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // If email is being updated, check if it's already in use
      if (customerData.email && customerData.email !== existingCustomer.email) {
        const customerWithEmail = await storage.getCustomerByEmail(customerData.email);
        if (customerWithEmail) {
          return res.status(400).json({ message: 'Email already in use by another customer' });
        }
      }
      
      // Update customer
      const updatedCustomer = await storage.updateCustomer(id, customerData);
      
      res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating customer' });
    }
  });
  
  app.delete('/api/customers/:id', authenticate, can(PERMISSIONS.DELETE_CUSTOMERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if customer exists
      const existingCustomer = await storage.getCustomerById(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Delete customer
      await storage.deleteCustomer(id);
      
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting customer' });
    }
  });

  // ===== BRANDS ROUTES =====
  app.get('/api/brands', authenticate, can(PERMISSIONS.VIEW_BRANDS), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { brands, total } = await storage.getBrands(page, limit, search);
      
      res.json({ brands, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching brands' });
    }
  });
  
  app.get('/api/brands/:id', authenticate, can(PERMISSIONS.VIEW_BRANDS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const brand = await storage.getBrandById(id);
      
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      
      res.json(brand);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching brand' });
    }
  });
  
  app.post('/api/brands', authenticate, can(PERMISSIONS.CREATE_BRANDS), async (req: Request, res: Response) => {
    try {
      const brandData = insertBrandSchema.parse(req.body);
      
      // Check if brand with same name already exists
      const existingBrand = await storage.getBrandByName(brandData.name);
      if (existingBrand) {
        return res.status(400).json({ message: 'Brand with this name already exists' });
      }
      
      // Create brand
      const brand = await storage.createBrand(brandData);
      
      res.status(201).json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating brand' });
    }
  });
  
  app.put('/api/brands/:id', authenticate, can(PERMISSIONS.EDIT_BRANDS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const brandData = insertBrandSchema.partial().parse(req.body);
      
      // Check if brand exists
      const existingBrand = await storage.getBrandById(id);
      if (!existingBrand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      
      // If name is being updated, check if it's already in use
      if (brandData.name && brandData.name !== existingBrand.name) {
        const brandWithName = await storage.getBrandByName(brandData.name);
        if (brandWithName) {
          return res.status(400).json({ message: 'Brand name already in use' });
        }
      }
      
      // Update brand
      const updatedBrand = await storage.updateBrand(id, brandData);
      
      res.json(updatedBrand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating brand' });
    }
  });
  
  app.delete('/api/brands/:id', authenticate, can(PERMISSIONS.DELETE_BRANDS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if brand exists
      const existingBrand = await storage.getBrandById(id);
      if (!existingBrand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      
      // Delete brand
      await storage.deleteBrand(id);
      
      res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting brand' });
    }
  });

  // ===== CATEGORIES ROUTES =====
  app.get('/api/categories', authenticate, can(PERMISSIONS.VIEW_CATEGORIES), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { categories, total } = await storage.getCategories(page, limit, search);
      
      res.json({ categories, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching categories' });
    }
  });
  
  app.get('/api/categories/:id', authenticate, can(PERMISSIONS.VIEW_CATEGORIES), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching category' });
    }
  });
  
  app.post('/api/categories', authenticate, can(PERMISSIONS.CREATE_CATEGORIES), async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      
      // Check if category with same name already exists
      const existingCategory = await storage.getCategoryByName(categoryData.name);
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      
      // Create category
      const category = await storage.createCategory(categoryData);
      
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating category' });
    }
  });
  
  app.put('/api/categories/:id', authenticate, can(PERMISSIONS.EDIT_CATEGORIES), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      
      // Check if category exists
      const existingCategory = await storage.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // If name is being updated, check if it's already in use
      if (categoryData.name && categoryData.name !== existingCategory.name) {
        const categoryWithName = await storage.getCategoryByName(categoryData.name);
        if (categoryWithName) {
          return res.status(400).json({ message: 'Category name already in use' });
        }
      }
      
      // Update category
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating category' });
    }
  });
  
  app.delete('/api/categories/:id', authenticate, can(PERMISSIONS.DELETE_CATEGORIES), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if category exists
      const existingCategory = await storage.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Delete category
      await storage.deleteCategory(id);
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting category' });
    }
  });

  // ===== PRODUCTS ROUTES =====
  app.get('/api/products', authenticate, can(PERMISSIONS.VIEW_PRODUCTS), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { products, total } = await storage.getProducts(page, limit, search);
      
      res.json({ products, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching products' });
    }
  });
  
  app.get('/api/products/:id', authenticate, can(PERMISSIONS.VIEW_PRODUCTS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching product' });
    }
  });
  
  app.post('/api/products', authenticate, can(PERMISSIONS.CREATE_PRODUCTS), async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Check if product with same SKU already exists
      const existingProduct = await storage.getProductBySku(productData.sku);
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
      
      // Create product
      const product = await storage.createProduct(productData);
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating product' });
    }
  });
  
  app.put('/api/products/:id', authenticate, can(PERMISSIONS.EDIT_PRODUCTS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      
      // Check if product exists
      const existingProduct = await storage.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // If SKU is being updated, check if it's already in use
      if (productData.sku && productData.sku !== existingProduct.sku) {
        const productWithSku = await storage.getProductBySku(productData.sku);
        if (productWithSku) {
          return res.status(400).json({ message: 'SKU already in use by another product' });
        }
      }
      
      // Update product
      const updatedProduct = await storage.updateProduct(id, productData);
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating product' });
    }
  });
  
  app.delete('/api/products/:id', authenticate, can(PERMISSIONS.DELETE_PRODUCTS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if product exists
      const existingProduct = await storage.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Delete product
      await storage.deleteProduct(id);
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting product' });
    }
  });

  // ===== ORDERS ROUTES =====
  app.get('/api/orders', authenticate, can(PERMISSIONS.VIEW_ORDERS), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      
      const { orders, total } = await storage.getOrders(page, limit, search);
      
      res.json({ orders, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching orders' });
    }
  });
  
  app.get('/api/orders/:id', authenticate, can(PERMISSIONS.VIEW_ORDERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching order' });
    }
  });
  
  app.post('/api/orders', authenticate, can(PERMISSIONS.CREATE_ORDERS), async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      const orderData = insertOrderSchema.parse(order);
      
      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order must have at least one item' });
      }
      
      // Validate each item
      for (const item of items) {
        insertOrderItemSchema.omit({ orderId: true }).parse(item);
      }
      
      // Create order with items
      const newOrder = await storage.createOrder(orderData, items);
      
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating order' });
    }
  });
  
  app.put('/api/orders/:id', authenticate, can(PERMISSIONS.EDIT_ORDERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const orderData = insertOrderSchema.partial().parse(req.body);
      
      // Check if order exists
      const existingOrder = await storage.getOrderById(id);
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Update order
      const updatedOrder = await storage.updateOrder(id, orderData);
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating order' });
    }
  });
  
  app.delete('/api/orders/:id', authenticate, can(PERMISSIONS.DELETE_ORDERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if order exists
      const existingOrder = await storage.getOrderById(id);
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Delete order
      await storage.deleteOrder(id);
      
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting order' });
    }
  });

  // ===== ORDER ITEMS ROUTES =====
  app.get('/api/order-items/:orderId', authenticate, can(PERMISSIONS.VIEW_ORDERS), async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.params.orderId);
      const orderItems = await storage.getOrderItems(orderId);
      
      res.json(orderItems);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching order items' });
    }
  });
  
  app.post('/api/order-items', authenticate, can(PERMISSIONS.EDIT_ORDERS), async (req: Request, res: Response) => {
    try {
      const orderItemData = insertOrderItemSchema.parse(req.body);
      
      // Create order item
      const orderItem = await storage.createOrderItem(orderItemData);
      
      res.status(201).json(orderItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating order item' });
    }
  });
  
  app.put('/api/order-items/:id', authenticate, can(PERMISSIONS.EDIT_ORDERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const orderItemData = insertOrderItemSchema.partial().parse(req.body);
      
      // Check if order item exists
      const existingOrderItem = await storage.getOrderItemById(id);
      if (!existingOrderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }
      
      // Update order item
      const updatedOrderItem = await storage.updateOrderItem(id, orderItemData);
      
      res.json(updatedOrderItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating order item' });
    }
  });
  
  app.delete('/api/order-items/:id', authenticate, can(PERMISSIONS.EDIT_ORDERS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if order item exists
      const existingOrderItem = await storage.getOrderItemById(id);
      if (!existingOrderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }
      
      // Delete order item
      await storage.deleteOrderItem(id);
      
      res.json({ message: 'Order item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting order item' });
    }
  });

  // ===== PAYMENTS ROUTES =====
  app.get('/api/payments', authenticate, can(PERMISSIONS.VIEW_PAYMENTS), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const orderId = req.query.orderId ? Number(req.query.orderId) : undefined;
      
      const { payments, total } = await storage.getPayments(page, limit, orderId);
      
      res.json({ payments, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching payments' });
    }
  });
  
  app.get('/api/payments/:id', authenticate, can(PERMISSIONS.VIEW_PAYMENTS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const payment = await storage.getPaymentById(id);
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching payment' });
    }
  });
  
  app.post('/api/payments', authenticate, can(PERMISSIONS.CREATE_PAYMENTS), async (req: Request, res: Response) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      
      // Create payment
      const payment = await storage.createPayment(paymentData);
      
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating payment' });
    }
  });
  
  app.put('/api/payments/:id', authenticate, can(PERMISSIONS.EDIT_PAYMENTS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      
      // Check if payment exists
      const existingPayment = await storage.getPaymentById(id);
      if (!existingPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      // Update payment
      const updatedPayment = await storage.updatePayment(id, paymentData);
      
      res.json(updatedPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating payment' });
    }
  });
  
  app.delete('/api/payments/:id', authenticate, can(PERMISSIONS.DELETE_PAYMENTS), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if payment exists
      const existingPayment = await storage.getPaymentById(id);
      if (!existingPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      // Delete payment
      await storage.deletePayment(id);
      
      res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting payment' });
    }
  });

  // ===== SHIPPING ROUTES =====
  app.get('/api/shipping', authenticate, can(PERMISSIONS.VIEW_SHIPPING), async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const orderId = req.query.orderId ? Number(req.query.orderId) : undefined;
      
      const { shippings, total } = await storage.getShippings(page, limit, orderId);
      
      res.json({ shippings, total, page, limit });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching shipping records' });
    }
  });
  
  app.get('/api/shipping/:id', authenticate, can(PERMISSIONS.VIEW_SHIPPING), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const shipping = await storage.getShippingById(id);
      
      if (!shipping) {
        return res.status(404).json({ message: 'Shipping record not found' });
      }
      
      res.json(shipping);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching shipping record' });
    }
  });
  
  app.post('/api/shipping', authenticate, can(PERMISSIONS.CREATE_SHIPPING), async (req: Request, res: Response) => {
    try {
      const shippingData = insertShippingSchema.parse(req.body);
      
      // Create shipping record
      const shipping = await storage.createShipping(shippingData);
      
      res.status(201).json(shipping);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error creating shipping record' });
    }
  });
  
  app.put('/api/shipping/:id', authenticate, can(PERMISSIONS.EDIT_SHIPPING), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const shippingData = insertShippingSchema.partial().parse(req.body);
      
      // Check if shipping record exists
      const existingShipping = await storage.getShippingById(id);
      if (!existingShipping) {
        return res.status(404).json({ message: 'Shipping record not found' });
      }
      
      // Update shipping record
      const updatedShipping = await storage.updateShipping(id, shippingData);
      
      res.json(updatedShipping);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Server error updating shipping record' });
    }
  });
  
  app.delete('/api/shipping/:id', authenticate, can(PERMISSIONS.DELETE_SHIPPING), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if shipping record exists
      const existingShipping = await storage.getShippingById(id);
      if (!existingShipping) {
        return res.status(404).json({ message: 'Shipping record not found' });
      }
      
      // Delete shipping record
      await storage.deleteShipping(id);
      
      res.json({ message: 'Shipping record deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting shipping record' });
    }
  });

  // ===== DASHBOARD ROUTES =====
  app.get('/api/dashboard/stats', authenticate, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
  });
  
  app.get('/api/dashboard/recent-orders', authenticate, async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 5;
      const recentOrders = await storage.getRecentOrders(limit);
      res.json(recentOrders);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching recent orders' });
    }
  });
  
  app.get('/api/dashboard/top-products', authenticate, async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 5;
      const topProducts = await storage.getTopProducts(limit);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching top products' });
    }
  });
  
  app.get('/api/dashboard/sales-by-category', authenticate, async (req: Request, res: Response) => {
    try {
      const salesByCategory = await storage.getSalesByCategory();
      res.json(salesByCategory);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching sales by category' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
