# ���️ PureShop - E-Commerce Microservices Platform

A scalable, event-driven e-commerce backend built with NestJS, featuring payment processing, real-time notifications, and comprehensive inventory management.

## ��� Features

### Core Services
- **Authentication & Authorization** - JWT-based auth with role-based access control (ADMIN/CLIENT)
- **Product Catalog** - Product and category management with Redis caching
- **Inventory Management** - Real-time stock tracking with low-stock alerts
- **Order Processing** - Complete order lifecycle management
- **Payment Integration** - Stripe payment processing with webhook support
- **Notifications** - Dual-channel notifications (Email + WebSocket)

### Technical Highlights
- **Microservices Architecture** - Independent, scalable services
- **Event-Driven Communication** - RabbitMQ for async messaging
- **Database per Service** - PostgreSQL with schema-based isolation
- **Type-Safe** - 100% TypeScript with strict typing
- **Dockerized** - Complete containerization for easy deployment
- **Real-Time Updates** - WebSocket support for instant notifications
- **Email Notifications** - Transactional emails for orders, payments, and alerts

## ���️ Architecture

```
┌─────────────┐
│ API Gateway │ :3000
└──────┬──────┘
       │
       ├─────────────┬──────────────┬─────────────┬────────────────┬───────────────┐
       │             │              │             │                │               │
┌──────▼──────┐ ┌───▼────┐ ┌───────▼──────┐ ┌───▼─────┐ ┌────────▼───────┐ ┌────▼──────┐
│Auth Service │ │Catalog │ │ Inventory    │ │ Orders  │ │ Payment        │ │Notification│
│   :3001     │ │ :3002  │ │    :3003     │ │  :3004  │ │    :3005       │ │   :3006   │
└──────┬──────┘ └───┬────┘ └──────┬───────┘ └───┬─────┘ └────────┬───────┘ └────┬──────┘
       │            │             │             │                │               │
       └────────────┴─────────────┴─────────────┴────────────────┴───────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
             ┌──────▼──────┐   ┌────────▼────────┐   ┌─────▼─────┐
             │ PostgreSQL  │   │    RabbitMQ     │   │   Redis   │
             │   :5432     │   │ :5672 / :15672  │   │   :6379   │
             └─────────────┘   └─────────────────┘   └───────────┘
```

## ��� Prerequisites

- **Node.js** 20+ and npm 9+
- **Docker** and **Docker Compose**
- **Git**

## ��� Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd PureShop
cp .env.example .env
```

**⚠️ Important:** Edit `.env` and set:
- `JWT_SECRET` - Secure random string
- `STRIPE_SECRET_KEY` - Your Stripe test key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `MAIL_USER` and `MAIL_PASSWORD` - SMTP credentials

### 2. Install Dependencies

```bash
# Windows
.\scripts\install-all.ps1

# Linux/macOS
chmod +x scripts/install-all.sh
./scripts/install-all.sh
```

### 3. Start Infrastructure

```bash
cd infrastructure
docker-compose up -d postgres rabbitmq redis
```

### 4. Run Migrations

```bash
# Windows
.\scripts\migrate-all.ps1

# Linux/macOS
chmod +x scripts/migrate-all.sh
./scripts/migrate-all.sh
```

### 5. Start All Services

```bash
docker-compose up -d
```

### 6. Verify

```bash
curl http://localhost:3000/health
```

**��� Detailed setup instructions:** See [SETUP.md](SETUP.md)

## ��� API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (returns JWT)
- `GET /auth/profile` - Get user profile (protected)

### Catalog
- `GET /catalog/products` - List products with pagination
- `GET /catalog/products/:id` - Get product details
- `POST /catalog/products` - Create product (admin)
- `PATCH /catalog/products/:id` - Update product (admin)
- `DELETE /catalog/products/:id` - Delete product (admin)

### Inventory
- `GET /inventory/stock/:productId` - Check stock
- `POST /inventory/reserve` - Reserve stock
- `POST /inventory/release` - Release reservation

### Orders
- `POST /orders` - Create order (protected)
- `GET /orders/:id` - Get order details (protected)
- `GET /orders/user/:userId` - Get user orders (protected)

### Payments *(Coming soon to API Gateway)*
- `POST /payments/checkout` - Create Stripe checkout session
- `GET /payments/:orderId` - Get payment status
- `POST /payments/refund` - Refund payment

**��� Full API Documentation:** http://localhost:3000/api/docs

## ���️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | NestJS 11.x |
| **Language** | TypeScript 5.7.3 |
| **Database** | PostgreSQL 15 |
| **ORM** | Prisma 7.2.0 |
| **Message Broker** | RabbitMQ 3.x |
| **Cache** | Redis 7.x |
| **Payments** | Stripe SDK 14.x |
| **WebSocket** | Socket.io 4.7.0 |
| **Email** | Nodemailer 6.9.0 |
| **Authentication** | JWT + Passport |
| **Containerization** | Docker + Docker Compose |

## ��� Project Structure

```
PureShop/
├── services/
│   ├── api-gateway/         # HTTP entry point & request routing
│   ├── auth-service/        # User authentication & JWT
│   ├── catalog-service/     # Product & category management
│   ├── inventory-service/   # Stock management & reservations
│   ├── order-service/       # Order processing & lifecycle
│   ├── payment-service/     # Stripe integration & webhooks
│   └── notification-service/# Email & WebSocket notifications
├── libs/
│   └── shared/             # Shared DTOs, events, interfaces
├── infrastructure/
│   ├── docker-compose.yml  # Container orchestration
│   └── init-databases.sql  # Database initialization
├── scripts/
│   ├── migrate-all.*       # Run all Prisma migrations
│   └── install-all.*       # Install all dependencies
└── prisma/
    └── schema.prisma       # Shared database schema
```

## ��� Development

### Run Single Service

```bash
cd services/auth-service
npm run start:dev
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f payment-service
```

### Access Database

```bash
cd services/auth-service
npm run prisma:studio
```

### Run Tests

```bash
cd services/auth-service
npm run test        # Unit tests
npm run test:cov    # With coverage
npm run test:e2e    # E2E tests
```

## ��� Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Database
DATABASE_URL=postgresql://pureshop_user:pureshop_password@localhost:5432/pureshop_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=24h

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## ��� Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| API Gateway | 3000 | http://localhost:3000/health |
| Auth | 3001 | http://localhost:3001/health |
| Catalog | 3002 | http://localhost:3002/health |
| Inventory | 3003 | http://localhost:3003/health |
| Orders | 3004 | http://localhost:3004/health |
| Payment | 3005 | http://localhost:3005/health |
| Notification | 3006 | http://localhost:3006/health |
| PostgreSQL | 5432 | - |
| RabbitMQ | 5672 (AMQP) | http://localhost:15672 |
| Redis | 6379 | - |

## ��� Roadmap

- [x] Core microservices architecture
- [x] Authentication with JWT
- [x] Product catalog with caching
- [x] Inventory management
- [x] Order processing
- [x] Stripe payment integration
- [x] Email & WebSocket notifications
- [ ] Payment endpoints in API Gateway
- [ ] Complete event-driven workflows
- [ ] Comprehensive testing (70% coverage)
- [ ] API rate limiting
- [ ] Admin dashboard
- [ ] CI/CD pipeline
- [ ] Monitoring & logging
- [ ] API versioning

## ��� Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ��� License

MIT License - see [LICENSE](LICENSE) file for details

## ��� Troubleshooting

### Common Issues

**Services won't start:**
- Verify Docker is running: `docker ps`
- Check port availability: `netstat -ano | findstr :3000`
- Review logs: `docker-compose logs`

**Database connection errors:**
- Ensure PostgreSQL is running: `docker-compose ps postgres`
- Verify DATABASE_URL in `.env`
- Check schemas exist: `\dn` in psql

**Migration failures:**
- Ensure PostgreSQL is accessible
- Run migrations one at a time
- Check `init-databases.sql` ran successfully

See [SETUP.md](SETUP.md) for detailed troubleshooting.

## ��� Support

For issues and questions:
- Create an issue on GitHub
- Check service logs: `docker-compose logs [service-name]`
- Review health endpoints

---

**Built with ❤️ using NestJS**
