# 🛍️ PureShop Microservices

A modern, scalable e-commerce platform built with microservices architecture using NestJS, TypeScript, PostgreSQL, RabbitMQ, and Docker.

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Services](#-services)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Architecture

PureShop follows a microservices architecture with the following components:

```
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway (Port 3000)                     │
│                    (Swagger Docs: /api/docs)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼─────┐ ┌───────▼────┐
        │ Auth Service │ │  Catalog   │ │ Inventory  │
        │  (Port 3001) │ │  Service   │ │  Service   │
        │              │ │ (Port 3002)│ │ (Port 3003)│
        └──────────────┘ └────────────┘ └────────────┘
                │               │               │
        ┌───────▼──────┐        │               │
        │Order Service │        │               │
        │ (Port 3004)  │        │               │
        └──────────────┘        │               │
                │               │               │
        ┌───────▼───────────────▼───────────────▼─────┐
        │         RabbitMQ (Message Broker)           │
        │            (Port 5672, 15672)               │
        └─────────────────────────────────────────────┘
                │
        ┌───────▼───────┐       ┌────────────┐
        │  PostgreSQL   │       │   Redis    │
        │  (Port 5432)  │       │ (Port 6379)│
        └───────────────┘       └────────────┘
```

## ✨ Features

### Authentication & Authorization
- ✅ User registration with email/password
- ✅ JWT-based authentication
- ✅ Role-based access control (ADMIN, CLIENT)
- ✅ User login/logout
- ✅ Profile management
- ✅ Secure password hashing with bcrypt

### Catalog Management
- ✅ Product CRUD operations
- ✅ Category management
- ✅ Product search and filtering
- ✅ Image upload support
- ✅ Product pagination

### Inventory Management
- ✅ Real-time stock tracking
- ✅ Stock reservation system
- ✅ Low stock alerts
- ✅ Multi-location inventory support

### Order Management
- ✅ Order creation and processing
- ✅ Order status tracking
- ✅ Order history
- ✅ Payment integration ready

### Infrastructure
- ✅ Microservices communication via RabbitMQ
- ✅ Centralized API Gateway
- ✅ Docker containerization
- ✅ Database migrations with Prisma
- ✅ Health check endpoints
- ✅ Swagger API documentation
- ✅ CORS support
- ✅ Global error handling
- ✅ Request validation
- ✅ Logging middleware

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **ORM:** Prisma 5.x
- **Message Broker:** RabbitMQ 3.12
- **Cache:** Redis 7
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI

### DevOps
- **Containerization:** Docker & Docker Compose
- **Base Images:** 
  - Node.js services: `node:20-slim` (Debian-based for OpenSSL 1.1 compatibility)
  - API Gateway: `node:20-alpine`
  - PostgreSQL: `postgres:15-alpine`
  - RabbitMQ: `rabbitmq:3.12-management-alpine`
  - Redis: `redis:7-alpine`

## 📦 Prerequisites

- **Docker Desktop** 20.10+ & **Docker Compose** 2.0+
- **Node.js** 20+ (for local development)
- **npm** or **yarn**
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pureshop-microservices
```

### 2. Build and Start All Services

```bash
# Build and start all services with Docker Compose
docker-compose -f infrastructure/docker-compose.yml up -d --build

# Wait for services to be healthy (30-40 seconds)
docker ps

# Check logs if needed
docker-compose -f infrastructure/docker-compose.yml logs -f
```

### 3. Verify Services are Running

```bash
# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Expected output:
# pureshop-api-gateway      Up X minutes (healthy)
# pureshop-auth-service     Up X minutes (healthy)
# pureshop-catalog-service  Up X minutes (healthy)
# pureshop-inventory-service Up X minutes (healthy)
# pureshop-order-service    Up X minutes (healthy)
# pureshop-postgres         Up X minutes (healthy)
# pureshop-rabbitmq         Up X minutes (healthy)
# pureshop-redis            Up X minutes (healthy)
```

### 4. Access Services

- **API Gateway:** http://localhost:3000
- **Swagger Documentation:** http://localhost:3000/api/docs
- **RabbitMQ Management:** http://localhost:15672 (guest/guest)
- **PostgreSQL:** localhost:5432 (pureshop_user/pureshop_password)
- **Redis:** localhost:6379

### 5. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a new user (CLIENT role by default)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'

# Register an admin user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123",
    "name": "Admin User",
    "role": "ADMIN"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'

# Get user profile (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 API Documentation

### Swagger UI
Visit http://localhost:3000/api/docs for interactive API documentation.

### Available Endpoints

#### Authentication (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with credentials
- `GET /auth/profile` - Get current user profile (requires authentication)
- `POST /auth/logout` - Logout current user (requires authentication)

#### Catalog (`/catalog`)
- `GET /catalog/products` - Get all products
- `GET /catalog/products/:id` - Get product by ID
- `POST /catalog/products` - Create new product (ADMIN only)
- `PUT /catalog/products/:id` - Update product (ADMIN only)
- `DELETE /catalog/products/:id` - Delete product (ADMIN only)
- `GET /catalog/categories` - Get all categories

#### Inventory (`/inventory`)
- `GET /inventory/:productId` - Get product stock
- `POST /inventory/reserve` - Reserve stock
- `POST /inventory/release` - Release reserved stock
- `PUT /inventory/:productId` - Update stock levels (ADMIN only)

#### Orders (`/orders`)
- `POST /orders` - Create new order
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id/status` - Update order status (ADMIN only)

#### Health
- `GET /health` - API Gateway health check

## 🔧 Services

### API Gateway (Port 3000)
- Single entry point for all client requests
- JWT authentication & authorization
- Request routing to microservices
- Global error handling
- Rate limiting & CORS
- Swagger documentation

### Auth Service (Port 3001)
- User registration & authentication
- JWT token generation
- Password hashing & validation
- Role-based access control
- User profile management
- **Database:** PostgreSQL (schema: `auth`)

### Catalog Service (Port 3002)
- Product management
- Category management
- Product search & filtering
- Image handling
- **Database:** PostgreSQL (schema: `catalog`)

### Inventory Service (Port 3003)
- Stock level tracking
- Stock reservation/release
- Low stock notifications
- Multi-warehouse support
- **Database:** PostgreSQL (schema: `inventory`)

### Order Service (Port 3004)
- Order creation & processing
- Order status management
- Payment processing integration
- Order history
- **Database:** PostgreSQL (schema: `orders`)

## 💾 Database Schema

### Auth Service Schema (`auth`)
```sql
Table: users
- id: String (UUID, Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String
- role: Enum (ADMIN, CLIENT)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### Catalog Service Schema (`catalog`)
```sql
Table: products
- id: String (UUID, Primary Key)
- name: String
- description: String
- price: Decimal
- categoryId: String (Foreign Key)
- imageUrl: String
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime

Table: categories
- id: String (UUID, Primary Key)
- name: String
- description: String
- createdAt: DateTime
- updatedAt: DateTime
```

### Inventory Service Schema (`inventory`)
```sql
Table: stock
- id: String (UUID, Primary Key)
- productId: String (Unique)
- quantity: Integer
- reserved: Integer
- location: String
- updatedAt: DateTime
```

### Order Service Schema (`orders`)
```sql
Table: orders
- id: String (UUID, Primary Key)
- userId: String
- status: Enum (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- totalAmount: Decimal
- createdAt: DateTime
- updatedAt: DateTime

Table: orderItems
- id: String (UUID, Primary Key)
- orderId: String (Foreign Key)
- productId: String
- quantity: Integer
- price: Decimal
```

## 🔐 Authentication

### User Roles
- **CLIENT** (default): Can browse products, create orders, manage their profile
- **ADMIN**: Full access to all resources, can manage products, inventory, and all orders

### JWT Token
- Tokens expire in 24 hours (configurable)
- Payload includes: `userId`, `email`, `role`
- Secured with HS256 algorithm
- Client should include token in `Authorization: Bearer <token>` header

### Role-Based Endpoints
Some endpoints require specific roles:
- `@Roles('ADMIN')` - Admin only endpoints
- `@UseGuards(JwtAuthGuard)` - Authenticated users only
- Public endpoints - No authentication required

## 🌍 Environment Variables

Create a `.env` file in the `infrastructure/` directory:

```env
# Node Environment
NODE_ENV=development

# PostgreSQL
POSTGRES_USER=pureshop_user
POSTGRES_PASSWORD=pureshop_password
POSTGRES_DB=pureshop_db

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h

# Password Hashing
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=debug

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200
```

⚠️ **Important:** Change `JWT_SECRET` in production!

## 💻 Development

### Local Development (Without Docker)

Each service can be run locally for development:

```bash
# Auth Service
cd services/auth-service
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Repeat for other services...
```

### Running Migrations

Migrations are automatically applied on container startup via `docker-entrypoint.sh`.

For manual migration:

```bash
# Generate migration
docker exec -it pureshop-auth-service npx prisma migrate dev --name migration_name

# Apply migrations
docker exec -it pureshop-auth-service npx prisma migrate deploy

# Reset database (development only)
docker exec -it pureshop-auth-service npx prisma migrate reset
```

### Viewing Logs

```bash
# All services
docker-compose -f infrastructure/docker-compose.yml logs -f

# Specific service
docker logs pureshop-auth-service -f
docker logs pureshop-api-gateway -f --tail 100
```

### Rebuilding a Single Service

```bash
# Rebuild specific service
docker-compose -f infrastructure/docker-compose.yml up -d --build auth-service

# Restart service
docker-compose -f infrastructure/docker-compose.yml restart api-gateway
```

### Database Access

```bash
# PostgreSQL CLI
docker exec -it pureshop-postgres psql -U pureshop_user -d pureshop_db

# List schemas
\dn

# Connect to schema
SET search_path TO auth;

# List tables
\dt

# View users
SELECT * FROM users;
```

### RabbitMQ Management

Access RabbitMQ management UI at http://localhost:15672
- Username: `guest`
- Password: `guest`

View queues, exchanges, and message rates.

## 🔍 Troubleshooting

### Services are unhealthy

```bash
# Check service logs
docker logs pureshop-auth-service --tail 50

# Check if migrations ran
docker logs pureshop-auth-service | grep -i migration

# Restart unhealthy service
docker-compose -f infrastructure/docker-compose.yml restart auth-service
```

### Database connection errors

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec -it pureshop-postgres psql -U pureshop_user -d pureshop_db -c "SELECT 1"

# Check database exists
docker exec -it pureshop-postgres psql -U pureshop_user -l
```

### OpenSSL compatibility issues

If you see `libssl.so.1.1` errors, ensure services use `node:20-slim` (Debian) instead of Alpine:

```dockerfile
# Correct base image for Prisma services
FROM node:20-slim

# Install OpenSSL
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*
```

### Migrations not deploying

Ensure `prisma/migrations` is NOT in `.dockerignore`:

```dockerignore
# .dockerignore should NOT include:
# prisma/migrations   ❌ Remove this line

# But should include:
node_modules
dist
.env
*.log
```

### Port conflicts

If ports are already in use:

```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux

# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

### Clean slate restart

```bash
# Stop all containers
docker-compose -f infrastructure/docker-compose.yml down

# Remove volumes (⚠️ deletes all data)
docker-compose -f infrastructure/docker-compose.yml down -v

# Rebuild everything
docker-compose -f infrastructure/docker-compose.yml up -d --build --force-recreate
```

## 📝 Project Structure

```
pureshop-microservices/
├── infrastructure/
│   ├── docker-compose.yml        # Docker orchestration
│   └── init-databases.sql        # Database initialization
├── services/
│   ├── api-gateway/              # API Gateway (Port 3000)
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── controllers/      # Route controllers
│   │   │   ├── guards/           # Auth guards
│   │   │   ├── filters/          # Exception filters
│   │   │   ├── interceptors/     # Response interceptors
│   │   │   └── dto/              # Data transfer objects
│   │   └── package.json
│   ├── auth-service/             # Authentication Service
│   │   ├── Dockerfile
│   │   ├── docker-entrypoint.sh  # Migration runner
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── src/
│   ├── catalog-service/          # Catalog Service
│   ├── inventory-service/        # Inventory Service
│   └── order-service/            # Order Service
├── shared/                        # Shared libraries
│   ├── constants/
│   ├── dtos/
│   ├── interfaces/
│   └── utils/
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- NestJS - Progressive Node.js framework
- Prisma - Next-generation ORM
- RabbitMQ - Message broker
- Docker - Containerization platform

---

**Built using NestJS & TypeScript**
