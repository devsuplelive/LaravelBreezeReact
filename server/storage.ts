import { 
  users, type User, type InsertUser,
  roles, type Role, type InsertRole,
  permissions, type Permission, type InsertPermission,
  userRoles, type InsertUserRole,
  rolePermissions, type InsertRolePermission,
  customers, type Customer, type InsertCustomer,
  brands, type Brand, type InsertBrand,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  payments, type Payment, type InsertPayment,
  shipping, type Shipping, type InsertShipping,
  OrderWithRelations, ProductWithRelations, UserWithRoles, RoleWithPermissions
} from "@shared/schema";
import { db } from "./db/sqlite";
import { eq, and, like, ilike, or, desc, asc, sql, isNull, not } from "drizzle-orm";
import { hashPassword } from "./middlewares/auth";

export interface IStorage {
  // Users
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsers(page?: number, limit?: number, search?: string): Promise<{ users: User[], total: number }>;
  
  // Roles
  getRoleById(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  getRoles(page?: number, limit?: number, search?: string): Promise<{ roles: Role[], total: number }>;
  
  // Permissions
  getPermissionById(id: number): Promise<Permission | undefined>;
  getPermissionByName(name: string): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission | undefined>;
  deletePermission(id: number): Promise<boolean>;
  getPermissions(page?: number, limit?: number, search?: string): Promise<{ permissions: Permission[], total: number }>;
  
  // User-Role relations
  assignRoleToUser(userId: number, roleId: number): Promise<void>;
  removeRoleFromUser(userId: number, roleId: number): Promise<void>;
  getUserRoles(userId: number): Promise<Role[]>;
  getUserWithRoles(userId: number): Promise<UserWithRoles | undefined>;
  
  // Role-Permission relations
  assignPermissionToRole(roleId: number, permissionId: number): Promise<void>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<void>;
  getRolePermissions(roleId: number): Promise<Permission[]>;
  getUserPermissions(userId: number): Promise<Permission[]>;
  getRoleWithPermissions(roleId: number): Promise<RoleWithPermissions | undefined>;
  
  // Customers
  getCustomerById(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  getCustomers(page?: number, limit?: number, search?: string): Promise<{ customers: Customer[], total: number }>;
  
  // Brands
  getBrandById(id: number): Promise<Brand | undefined>;
  getBrandByName(name: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: number): Promise<boolean>;
  getBrands(page?: number, limit?: number, search?: string): Promise<{ brands: Brand[], total: number }>;
  
  // Categories
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getCategories(page?: number, limit?: number, search?: string): Promise<{ categories: Category[], total: number }>;
  
  // Products
  getProductById(id: number): Promise<ProductWithRelations | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getProducts(page?: number, limit?: number, search?: string): Promise<{ products: ProductWithRelations[], total: number }>;
  
  // Orders
  getOrderById(id: number): Promise<OrderWithRelations | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getOrders(page?: number, limit?: number, search?: string): Promise<{ orders: OrderWithRelations[], total: number }>;
  
  // Order Items
  getOrderItemById(id: number): Promise<OrderItem | undefined>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: number, orderItem: Partial<InsertOrderItem>): Promise<OrderItem | undefined>;
  deleteOrderItem(id: number): Promise<boolean>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Payments
  getPaymentById(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
  getPayments(page?: number, limit?: number, orderId?: number): Promise<{ payments: Payment[], total: number }>;
  
  // Shipping
  getShippingById(id: number): Promise<Shipping | undefined>;
  createShipping(shipping: InsertShipping): Promise<Shipping>;
  updateShipping(id: number, shipping: Partial<InsertShipping>): Promise<Shipping | undefined>;
  deleteShipping(id: number): Promise<boolean>;
  getShippings(page?: number, limit?: number, orderId?: number): Promise<{ shippings: Shipping[], total: number }>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    customers: number;
    products: number;
    orders: number;
    revenue: number;
  }>;
  getRecentOrders(limit?: number): Promise<OrderWithRelations[]>;
  getTopProducts(limit?: number): Promise<(ProductWithRelations & { totalSold: number, revenue: number })[]>;
  getSalesByCategory(): Promise<{ categoryName: string, amount: number, percentage: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(user.password);
    const [newUser] = await db
      .insert(users)
      .values({ ...user, password: hashedPassword })
      .returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    
    return !!deletedUser;
  }

  async getUsers(page = 1, limit = 10, search?: string): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct search condition if search term is provided
    let searchCondition = undefined;
    if (search) {
      searchCondition = or(
        ilike(users.username, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.firstName || '', `%${search}%`),
        ilike(users.lastName || '', `%${search}%`)
      );
    }
    
    // Get users with pagination
    const usersList = await db
      .select()
      .from(users)
      .where(searchCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(users.username));
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(users)
      .where(searchCondition);
    
    return { users: usersList, total: count };
  }
  
  // Roles
  async getRoleById(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db
      .insert(roles)
      .values(role)
      .returning();
    return newRole;
  }

  async updateRole(id: number, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const [updatedRole] = await db
      .update(roles)
      .set({ ...roleData, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    
    return updatedRole;
  }

  async deleteRole(id: number): Promise<boolean> {
    const [deletedRole] = await db
      .delete(roles)
      .where(eq(roles.id, id))
      .returning();
    
    return !!deletedRole;
  }

  async getRoles(page = 1, limit = 10, search?: string): Promise<{ roles: Role[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct search condition if search term is provided
    let searchCondition = undefined;
    if (search) {
      searchCondition = or(
        ilike(roles.name, `%${search}%`),
        ilike(roles.description || '', `%${search}%`)
      );
    }
    
    // Get roles with pagination
    const rolesList = await db
      .select()
      .from(roles)
      .where(searchCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(roles.name));
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(roles)
      .where(searchCondition);
    
    return { roles: rolesList, total: count };
  }
  
  // Permissions
  async getPermissionById(id: number): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.name, name));
    return permission;
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db
      .insert(permissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async updatePermission(id: number, permissionData: Partial<InsertPermission>): Promise<Permission | undefined> {
    const [updatedPermission] = await db
      .update(permissions)
      .set({ ...permissionData, updatedAt: new Date() })
      .where(eq(permissions.id, id))
      .returning();
    
    return updatedPermission;
  }

  async deletePermission(id: number): Promise<boolean> {
    const [deletedPermission] = await db
      .delete(permissions)
      .where(eq(permissions.id, id))
      .returning();
    
    return !!deletedPermission;
  }

  async getPermissions(page = 1, limit = 10, search?: string): Promise<{ permissions: Permission[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct search condition if search term is provided
    let searchCondition = undefined;
    if (search) {
      searchCondition = or(
        ilike(permissions.name, `%${search}%`),
        ilike(permissions.description || '', `%${search}%`)
      );
    }
    
    // Get permissions with pagination
    const permissionsList = await db
      .select()
      .from(permissions)
      .where(searchCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(permissions.name));
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(permissions)
      .where(searchCondition);
    
    return { permissions: permissionsList, total: count };
  }
  
  // User-Role relations
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    await db
      .insert(userRoles)
      .values({ userId, roleId })
      .onConflictDoNothing();
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await db
      .delete(userRoles)
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId)
      ));
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const userRolesList = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id));
    
    return userRolesList.map(({ roles }) => roles);
  }

  async getUserWithRoles(userId: number): Promise<UserWithRoles | undefined> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      return undefined;
    }
    
    const userRolesList = await this.getUserRoles(userId);
    
    return {
      ...user,
      roles: userRolesList,
    };
  }
  
  // Role-Permission relations
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    await db
      .insert(rolePermissions)
      .values({ roleId, permissionId })
      .onConflictDoNothing();
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await db
      .delete(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      ));
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const rolePermissionsList = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id));
    
    return rolePermissionsList.map(({ permissions }) => permissions);
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    // Get all roles for the user
    const userRolesList = await this.getUserRoles(userId);
    
    // If user has no roles, return empty array
    if (userRolesList.length === 0) {
      return [];
    }
    
    // Get permissions for each role
    const roleIds = userRolesList.map(role => role.id);
    
    const rolePermissionsList = await db
      .select()
      .from(rolePermissions)
      .where(sql`${rolePermissions.roleId} IN ${roleIds}`)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id));
    
    // Create a Set to deduplicate permissions
    const uniquePermissions = new Set(rolePermissionsList.map(rp => JSON.stringify(rp.permissions)));
    
    // Convert back to array
    return Array.from(uniquePermissions).map(p => JSON.parse(p));
  }

  async getRoleWithPermissions(roleId: number): Promise<RoleWithPermissions | undefined> {
    const role = await this.getRoleById(roleId);
    
    if (!role) {
      return undefined;
    }
    
    const rolePermissionsList = await this.getRolePermissions(roleId);
    
    return {
      ...role,
      permissions: rolePermissionsList,
    };
  }
  
  // Customers
  async getCustomerById(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customerData, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const [deletedCustomer] = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();
    
    return !!deletedCustomer;
  }

  async getCustomers(page = 1, limit = 10, search?: string): Promise<{ customers: Customer[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct search condition if search term is provided
    let searchCondition = undefined;
    if (search) {
      searchCondition = or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.email, `%${search}%`),
        ilike(customers.phone || '', `%${search}%`),
        ilike(customers.document || '', `%${search}%`),
        ilike(customers.city || '', `%${search}%`),
        ilike(customers.state || '', `%${search}%`)
      );
    }
    
    // Get customers with pagination
    const customersList = await db
      .select()
      .from(customers)
      .where(searchCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(customers.name));
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(customers)
      .where(searchCondition);
    
    return { customers: customersList, total: count };
  }
  
  // Brands
  async getBrandById(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async getBrandByName(name: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.name, name));
    return brand;
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db
      .insert(brands)
      .values(brand)
      .returning();
    return newBrand;
  }

  async updateBrand(id: number, brandData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const [updatedBrand] = await db
      .update(brands)
      .set({ ...brandData, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    
    return updatedBrand;
  }

  async deleteBrand(id: number): Promise<boolean> {
    const [deletedBrand] = await db
      .delete(brands)
      .where(eq(brands.id, id))
      .returning();
    
    return !!deletedBrand;
  }

  async getBrands(page = 1, limit = 10, search?: string): Promise<{ brands: Brand[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct search condition if search term is provided
    let searchCondition = undefined;
    if (search) {
      searchCondition = ilike(brands.name, `%${search}%`);
    }
    
    // Get brands with pagination
    const brandsList = await db
      .select()
      .from(brands)
      .where(searchCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(brands.name));
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(brands)
      .where(searchCondition);
    
    return { brands: brandsList, total: count };
  }
  
  // Categories
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    
    return !!deletedCategory;
  }

  async getCategories(page = 1, limit = 10, search?: string): Promise<{ categories: Category[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct search condition if search term is provided
    let searchCondition = undefined;
    if (search) {
      searchCondition = or(
        ilike(categories.name, `%${search}%`),
        ilike(categories.description || '', `%${search}%`)
      );
    }
    
    // Get categories with pagination
    const categoriesList = await db
      .select()
      .from(categories)
      .where(searchCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(categories.name));
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(categories)
      .where(searchCondition);
    
    return { categories: categoriesList, total: count };
  }
  
  // Products
  async getProductById(id: number): Promise<ProductWithRelations | undefined> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        brand: true,
        category: true
      }
    });
    
    return product;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    
    return !!deletedProduct;
  }

  async getProducts(page = 1, limit = 10, search?: string): Promise<{ products: ProductWithRelations[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct search condition if search term is provided
    let searchCondition = undefined;
    if (search) {
      searchCondition = or(
        ilike(products.name, `%${search}%`),
        ilike(products.sku, `%${search}%`),
        ilike(products.description || '', `%${search}%`)
      );
    }
    
    // Get products with relations using the query builder
    const productsList = await db.query.products.findMany({
      where: searchCondition,
      with: {
        brand: true,
        category: true,
      },
      limit: limit,
      offset: offset,
      orderBy: [asc(products.name)]
    });
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(products)
      .where(searchCondition);
    
    return { products: productsList, total: count };
  }
  
  // Orders
  async getOrderById(id: number): Promise<OrderWithRelations | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        customer: true,
        orderItems: {
          with: {
            product: true
          }
        },
        payments: true,
        shipping: true
      }
    });
    
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert order
      const [newOrder] = await tx
        .insert(orders)
        .values(order)
        .returning();
      
      // Insert order items with the order ID
      if (items.length > 0) {
        await tx
          .insert(orderItems)
          .values(items.map(item => ({ ...item, orderId: newOrder.id })));
      }
      
      return newOrder;
    });
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...orderData, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const [deletedOrder] = await db
      .delete(orders)
      .where(eq(orders.id, id))
      .returning();
    
    return !!deletedOrder;
  }

  async getOrders(page = 1, limit = 10, search?: string): Promise<{ orders: OrderWithRelations[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct search condition if search term is provided
    let searchCondition = undefined;
    if (search) {
      searchCondition = or(
        ilike(orders.orderNumber, `%${search}%`),
        ilike(orders.notes || '', `%${search}%`)
      );
    }
    
    // Get orders with relations using the query builder
    const ordersList = await db.query.orders.findMany({
      where: searchCondition,
      with: {
        customer: true,
        orderItems: {
          with: {
            product: true
          }
        },
        payments: true,
        shipping: true
      },
      limit: limit,
      offset: offset,
      orderBy: [desc(orders.createdAt)]
    });
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(orders)
      .where(searchCondition);
    
    return { orders: ordersList, total: count };
  }
  
  // Order Items
  async getOrderItemById(id: number): Promise<OrderItem | undefined> {
    const [orderItem] = await db.select().from(orderItems).where(eq(orderItems.id, id));
    return orderItem;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }

  async updateOrderItem(id: number, orderItemData: Partial<InsertOrderItem>): Promise<OrderItem | undefined> {
    const [updatedOrderItem] = await db
      .update(orderItems)
      .set({ ...orderItemData, updatedAt: new Date() })
      .where(eq(orderItems.id, id))
      .returning();
    
    return updatedOrderItem;
  }

  async deleteOrderItem(id: number): Promise<boolean> {
    const [deletedOrderItem] = await db
      .delete(orderItems)
      .where(eq(orderItems.id, id))
      .returning();
    
    return !!deletedOrderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .orderBy(asc(orderItems.id));
  }
  
  // Payments
  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ ...paymentData, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    
    return updatedPayment;
  }

  async deletePayment(id: number): Promise<boolean> {
    const [deletedPayment] = await db
      .delete(payments)
      .where(eq(payments.id, id))
      .returning();
    
    return !!deletedPayment;
  }

  async getPayments(page = 1, limit = 10, orderId?: number): Promise<{ payments: Payment[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct filter condition if orderId is provided
    let filterCondition = undefined;
    if (orderId) {
      filterCondition = eq(payments.orderId, orderId);
    }
    
    // Get payments with pagination
    const paymentsList = await db
      .select()
      .from(payments)
      .where(filterCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(payments.paymentDate));
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(payments)
      .where(filterCondition);
    
    return { payments: paymentsList, total: count };
  }
  
  // Shipping
  async getShippingById(id: number): Promise<Shipping | undefined> {
    const [shippingRecord] = await db.select().from(shipping).where(eq(shipping.id, id));
    return shippingRecord;
  }

  async createShipping(shippingData: InsertShipping): Promise<Shipping> {
    const [newShipping] = await db
      .insert(shipping)
      .values(shippingData)
      .returning();
    return newShipping;
  }

  async updateShipping(id: number, shippingData: Partial<InsertShipping>): Promise<Shipping | undefined> {
    const [updatedShipping] = await db
      .update(shipping)
      .set({ ...shippingData, updatedAt: new Date() })
      .where(eq(shipping.id, id))
      .returning();
    
    return updatedShipping;
  }

  async deleteShipping(id: number): Promise<boolean> {
    const [deletedShipping] = await db
      .delete(shipping)
      .where(eq(shipping.id, id))
      .returning();
    
    return !!deletedShipping;
  }

  async getShippings(page = 1, limit = 10, orderId?: number): Promise<{ shippings: Shipping[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Construct filter condition if orderId is provided
    let filterCondition = undefined;
    if (orderId) {
      filterCondition = eq(shipping.orderId, orderId);
    }
    
    // Get shipping records with pagination
    const shippingsList = await db
      .select()
      .from(shipping)
      .where(filterCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(shipping.createdAt));
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(shipping)
      .where(filterCondition);
    
    return { shippings: shippingsList, total: count };
  }
  
  // Dashboard
  async getDashboardStats(): Promise<{
    customers: number;
    products: number;
    orders: number;
    revenue: number;
  }> {
    // Get customers count
    const [{ customersCount }] = await db
      .select({ customersCount: sql`count(*)`.mapWith(Number) })
      .from(customers);
    
    // Get products count
    const [{ productsCount }] = await db
      .select({ productsCount: sql`count(*)`.mapWith(Number) })
      .from(products);
    
    // Get orders count
    const [{ ordersCount }] = await db
      .select({ ordersCount: sql`count(*)`.mapWith(Number) })
      .from(orders);
    
    // Get total revenue
    const [{ revenue }] = await db
      .select({
        revenue: sql`COALESCE(SUM(${orders.totalAmount}), 0)`.mapWith(Number)
      })
      .from(orders)
      .where(not(eq(orders.status, 'cancelled')));
    
    return {
      customers: customersCount,
      products: productsCount,
      orders: ordersCount,
      revenue,
    };
  }

  async getRecentOrders(limit = 5): Promise<OrderWithRelations[]> {
    // Get recent orders with relations
    const recentOrders = await db.query.orders.findMany({
      with: {
        customer: true,
        orderItems: {
          with: {
            product: true
          }
        },
        payments: true,
        shipping: true
      },
      limit: limit,
      orderBy: [desc(orders.createdAt)]
    });
    
    return recentOrders;
  }

  async getTopProducts(limit = 5): Promise<(ProductWithRelations & { totalSold: number, revenue: number })[]> {
    // For top products, we need to aggregate order items
    const topProductsData = await db.execute(sql`
      SELECT 
        p.id, 
        SUM(oi.quantity) as total_sold,
        SUM(oi.total) as revenue
      FROM ${orderItems} oi
      JOIN ${products} p ON oi.product_id = p.id
      JOIN ${orders} o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT ${limit}
    `);
    
    // Convert the raw result to our expected format
    const topProductIds = topProductsData.map((row: any) => row.id);
    
    // Fetch the product details for these IDs
    const productDetails = await db.query.products.findMany({
      where: sql`${products.id} IN ${topProductIds}`,
      with: {
        brand: true,
        category: true
      }
    });
    
    // Map the product details with the aggregated data
    return productDetails.map(product => {
      const stats = topProductsData.find((row: any) => row.id === product.id);
      return {
        ...product,
        totalSold: Number(stats.total_sold),
        revenue: Number(stats.revenue)
      };
    }).sort((a, b) => b.totalSold - a.totalSold);
  }

  async getSalesByCategory(): Promise<{ categoryName: string, amount: number, percentage: number }[]> {
    // Get total sales amount
    const [{ totalSales }] = await db
      .select({
        totalSales: sql`COALESCE(SUM(${orders.totalAmount}), 0)`.mapWith(Number)
      })
      .from(orders)
      .where(not(eq(orders.status, 'cancelled')));
    
    // If no sales, return empty array
    if (totalSales === 0) {
      return [];
    }
    
    // Get sales by category
    const salesByCategory = await db.execute(sql`
      SELECT 
        c.name as category_name,
        COALESCE(SUM(oi.total), 0) as amount
      FROM ${categories} c
      LEFT JOIN ${products} p ON c.id = p.category_id
      LEFT JOIN ${orderItems} oi ON p.id = oi.product_id
      LEFT JOIN ${orders} o ON oi.order_id = o.id AND o.status != 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY amount DESC
    `);
    
    // Calculate percentages
    return salesByCategory.map((row: any) => ({
      categoryName: row.category_name,
      amount: Number(row.amount),
      percentage: Number(row.amount) * 100 / totalSales
    }));
  }
}

export const storage = new DatabaseStorage();
