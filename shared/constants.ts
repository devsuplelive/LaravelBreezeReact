export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal',
  CASH: 'cash',
  OTHER: 'other',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const SHIPPING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  RETURNED: 'returned',
} as const;

export type ShippingStatus = typeof SHIPPING_STATUS[keyof typeof SHIPPING_STATUS];

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const PERMISSIONS = {
  // Customers
  VIEW_CUSTOMERS: 'view_customers',
  CREATE_CUSTOMERS: 'create_customers',
  EDIT_CUSTOMERS: 'edit_customers',
  DELETE_CUSTOMERS: 'delete_customers',
  
  // Brands
  VIEW_BRANDS: 'view_brands',
  CREATE_BRANDS: 'create_brands',
  EDIT_BRANDS: 'edit_brands',
  DELETE_BRANDS: 'delete_brands',
  
  // Categories
  VIEW_CATEGORIES: 'view_categories',
  CREATE_CATEGORIES: 'create_categories',
  EDIT_CATEGORIES: 'edit_categories',
  DELETE_CATEGORIES: 'delete_categories',
  
  // Products
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCTS: 'create_products',
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  
  // Orders
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  EDIT_ORDERS: 'edit_orders',
  DELETE_ORDERS: 'delete_orders',
  
  // Payments
  VIEW_PAYMENTS: 'view_payments',
  CREATE_PAYMENTS: 'create_payments',
  EDIT_PAYMENTS: 'edit_payments',
  DELETE_PAYMENTS: 'delete_payments',
  
  // Shipping
  VIEW_SHIPPING: 'view_shipping',
  CREATE_SHIPPING: 'create_shipping',
  EDIT_SHIPPING: 'edit_shipping',
  DELETE_SHIPPING: 'delete_shipping',
  
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  VIEW_ROLES: 'view_roles',
  CREATE_ROLES: 'create_roles',
  EDIT_ROLES: 'edit_roles',
  DELETE_ROLES: 'delete_roles',
  
  VIEW_PERMISSIONS: 'view_permissions',
  ASSIGN_PERMISSIONS: 'assign_permissions',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.VIEW_CUSTOMERS, PERMISSIONS.CREATE_CUSTOMERS, PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.VIEW_BRANDS, PERMISSIONS.CREATE_BRANDS, PERMISSIONS.EDIT_BRANDS,
    PERMISSIONS.VIEW_CATEGORIES, PERMISSIONS.CREATE_CATEGORIES, PERMISSIONS.EDIT_CATEGORIES,
    PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.CREATE_PRODUCTS, PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS, PERMISSIONS.CREATE_ORDERS, PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.VIEW_PAYMENTS, PERMISSIONS.CREATE_PAYMENTS, PERMISSIONS.EDIT_PAYMENTS,
    PERMISSIONS.VIEW_SHIPPING, PERMISSIONS.CREATE_SHIPPING, PERMISSIONS.EDIT_SHIPPING,
    PERMISSIONS.VIEW_USERS, PERMISSIONS.VIEW_ROLES, PERMISSIONS.VIEW_PERMISSIONS,
  ],
  [USER_ROLES.SALES]: [
    PERMISSIONS.VIEW_CUSTOMERS, PERMISSIONS.CREATE_CUSTOMERS, PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.VIEW_BRANDS, PERMISSIONS.VIEW_CATEGORIES, PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS, PERMISSIONS.CREATE_ORDERS, PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.VIEW_PAYMENTS, PERMISSIONS.CREATE_PAYMENTS,
    PERMISSIONS.VIEW_SHIPPING, PERMISSIONS.CREATE_SHIPPING,
  ],
  [USER_ROLES.VIEWER]: [
    PERMISSIONS.VIEW_CUSTOMERS, PERMISSIONS.VIEW_BRANDS, PERMISSIONS.VIEW_CATEGORIES, 
    PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.VIEW_ORDERS, PERMISSIONS.VIEW_PAYMENTS, 
    PERMISSIONS.VIEW_SHIPPING
  ],
};
