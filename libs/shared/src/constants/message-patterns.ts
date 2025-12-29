// RabbitMQ Message Patterns
export const MESSAGE_PATTERNS = {
  // Auth Service
  AUTH: {
    REGISTER: 'auth.register',
    LOGIN: 'auth.login',
    VALIDATE_USER: 'auth.validate',
    HEALTH: 'auth.health',
  },

  // Catalog Service
  CATALOG: {
    GET_PRODUCTS: 'catalog.products.get',
    GET_PRODUCT: 'catalog.product.get',
    CREATE_PRODUCT: 'catalog.product.create',
    UPDATE_PRODUCT: 'catalog.product.update',
    DELETE_PRODUCT: 'catalog.product.delete',
    GET_CATEGORIES: 'catalog.categories.get',
    GET_CATEGORY: 'catalog.category.get',
    CREATE_CATEGORY: 'catalog.category.create',
    UPDATE_CATEGORY: 'catalog.category.update',
    DELETE_CATEGORY: 'catalog.category.delete',
    HEALTH: 'catalog.health',
  },

  // Inventory Service
  INVENTORY: {
    GET_STOCK: 'inventory.stock.get',
    CREATE_STOCK: 'inventory.stock.create',
    UPDATE_STOCK: 'inventory.stock.update',
    ADJUST_STOCK: 'inventory.stock.adjust',
    RESERVE_STOCK: 'inventory.stock.reserve',
    RELEASE_STOCK: 'inventory.stock.release',
    CHECK_AVAILABILITY: 'inventory.stock.check',
    GET_LOW_STOCK: 'inventory.stock.low',
    HEALTH: 'inventory.health',
  },

  // Orders Service
  ORDERS: {
    CREATE_ORDER: 'orders.order.create',
    GET_ORDER: 'orders.order.get',
    GET_USER_ORDERS: 'orders.user.orders',
    UPDATE_ORDER_STATUS: 'orders.order.status.update',
    UPDATE_PAYMENT_STATUS: 'orders.order.payment-status.update',
    CANCEL_ORDER: 'orders.order.cancel',
    CALCULATE_TOTAL: 'orders.order.calculate',
    HEALTH: 'orders.health',
  },
};

// Event Patterns (for async events via EventEmitter or RabbitMQ pub/sub)
export const EVENT_PATTERNS = {
  // Auth Events
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged.in',
  PASSWORD_RESET_REQUESTED: 'user.password.reset.requested',
  USER_ROLE_UPDATED: 'user.role.updated',

  // Catalog Events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  CATEGORY_CREATED: 'category.created',
  CATEGORY_UPDATED: 'category.updated',
  CATEGORY_DELETED: 'category.deleted',

  // Inventory Events
  STOCK_CREATED: 'stock.created',
  STOCK_UPDATED: 'stock.updated',
  STOCK_ADJUSTED: 'stock.adjusted',
  STOCK_RESERVED: 'stock.reserved',
  STOCK_RELEASED: 'stock.released',
  LOW_STOCK_ALERT: 'stock.low.alert',
  OUT_OF_STOCK: 'stock.out',

  // Order Events
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  ORDER_PAYMENT_STATUS_CHANGED: 'order.payment.status.changed',
  ORDER_PAID: 'order.paid',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
};
