export const ROUTES = {
  // Auth routes
  AUTH: {
    REGISTER: 'auth/register',
    LOGIN: 'auth/login',
    PROFILE: 'auth/profile',
  },
  
  // Catalog routes
  CATALOG: {
    PRODUCTS: 'catalog/products',
    PRODUCT_DETAIL: 'catalog/products/:id',
    CATEGORIES: 'catalog/categories',
  },
  
  // Inventory routes
  INVENTORY: {
    STOCK: 'inventory/stock',
    STOCK_BY_SKU: 'inventory/stock/:sku',
  },
  
  // Order routes
  ORDERS: {
    CREATE: 'orders',
    GET_ORDERS: 'orders',
    GET_ORDER_BY_ID: 'orders/:id',
    CANCEL_ORDER: 'orders/:id/cancel',
  },
  
  // Health
  HEALTH: 'health',
};