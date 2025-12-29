// Service Names
export const SERVICES = {
  AUTH: 'AUTH_SERVICE',
  CATALOG: 'CATALOG_SERVICE',
  INVENTORY: 'INVENTORY_SERVICE',
  ORDERS: 'ORDERS_SERVICE',
} as const;

// Queue Names
export const QUEUES = {
  AUTH: 'auth_queue',
  CATALOG: 'catalog_queue',
  INVENTORY: 'inventory_queue',
  ORDERS: 'orders_queue',
} as const;

// Default Values
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// Stock Thresholds
export const LOW_STOCK_THRESHOLD = 10;
export const OUT_OF_STOCK_THRESHOLD = 0;

// Order Constants
export const TAX_RATE = 0.2; // 20% tax rate
export const MIN_ORDER_ITEMS = 1;
export const MAX_ORDER_ITEMS = 50;

// JWT Constants
export const JWT_EXPIRES_IN = '7d';
export const JWT_SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Password Constants
export const BCRYPT_SALT_ROUNDS = 10;
export const MIN_PASSWORD_LENGTH = 8;
