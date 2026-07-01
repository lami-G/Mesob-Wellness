# Mesob Wellness Platform

<div align="center">

![Mesob Wellness](https://img.shields.io/badge/Mesob-Wellness-2563eb?style=for-the-badge)
![License](https://img.shields.io/badge/License-Government-10b981?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-10b981?style=for-the-badge)

**A comprehensive government-grade digital wellness platform for managing health screenings, vitals tracking, appointments, wellness plans, and center analytics across Ethiopia.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Docker](#-docker-deployment) • [API](#-api-reference)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [Database](#️-database)
- [API Reference](#-api-reference)
- [Role-Based Access Control](#-role-based-access-control)
- [Testing](#-testing)
- [Security & Compliance](#-security--compliance)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Mesob Wellness is a complete healthcare management system designed for the Government of Ethiopia's Ministry of Health. It provides end-to-end digital health services with robust analytics, multi-center operations, and comprehensive reporting capabilities.

### Key Highlights

- 🏥 **Multi-Center Management** - Manage healthcare centers across regions and nationally
- 📊 **Advanced Analytics** - Real-time dashboards with regional and national insights
- 🗺️ **GeoJSON Mapping** - Interactive Ethiopia regional map with health data visualization
- 🔐 **Enterprise Security** - JWT authentication, audit logging, RBAC with 5 role levels
- 📱 **Responsive Design** - Mobile-first UI with React and Tailwind CSS
- 🚀 **Production Ready** - Docker support, PostgreSQL, comprehensive testing

---

## ✨ Features

### 🔐 Authentication & Authorization
- Multi-level role-based access control (5 roles)
- JWT token authentication with secure refresh
- Hierarchical user creation system
- Password encryption with bcrypt
- Session management and audit trails

### 👥 User Management
- Comprehensive user profiles
- Health record management
- Multi-role support (Customer Staff, Nurse, Manager, Regional Office, Federal Admin)
- User activity tracking
- Profile picture upload

### 📈 Vitals Tracking
- BMI calculation and categorization
- Blood pressure monitoring and classification
- Glucose level tracking (Fasting/Random)
- Health metrics history with trending
- Latest vitals quick access
- Visual analytics and charts

### 📅 Appointment Management
- Complete lifecycle tracking (6 status types)
- Walk-in and scheduled appointments
- Sequential display IDs for easy reference
- Status transitions: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
- Diagnosis and prescription recording
- No-show and cancelled tracking

### 🎯 Wellness Plans
- Personalized health plans
- Goal setting and tracking
- Duration management
- Active/inactive status monitoring
- Progress reports

### 💬 Feedback System
- Patient satisfaction ratings (1-5 stars)
- NPS (Net Promoter Score) tracking
- Categorized feedback (Service, Facility, Staff, etc.)
- SMS reminder tracking
- Statistical analysis and reports

### 🏥 Centers Management
- Multi-center operations
- Regional organization (11 regions)
- Staff assignment and management
- Center status monitoring (Active/Inactive)
- Comprehensive center analytics
- Regional and national dashboards

### 📊 Analytics & Reporting
- **Center Level**: Staff, appointments, vitals, feedback
- **Regional Level**: Aggregated statistics, center comparisons
- **National Level**: Nationwide metrics, regional breakdowns
- **Health Comparison**: Regional health metrics visualization
- **Interactive Maps**: GeoJSON-based Ethiopia regional map
- Real-time data visualization with Chart.js and Recharts

### 🗺️ Regional Map Features (NEW)
- Official Ethiopia GeoJSON boundaries
- Interactive region highlighting
- Dynamic health data tooltips
- Color-coded employee metrics
- Zoom and pan navigation
- Filter support (Time period, Region)
- Mobile-responsive design

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt, helmet, cors
- **Logging**: morgan
- **PDF Generation**: pdfkit
- **Email**: nodemailer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS, CSS Modules
- **Charts**: Chart.js, Recharts
- **Maps**: React Leaflet, Leaflet
- **Icons**: Lucide React
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker, Docker Compose
- **Database**: PostgreSQL (official image)
- **Reverse Proxy**: Nginx (optional)
- **CI/CD**: GitHub Actions ready

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  (React SPA, Mobile-Responsive, PWA-Ready)             │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS/WSS
┌───────────────────▼─────────────────────────────────────┐
│               API Gateway / Load Balancer               │
│              (Nginx, Optional in Docker)                │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                Application Layer                        │
│  (Express.js, TypeScript, REST API)                    │
│  ├─ Authentication & Authorization                      │
│  ├─ Business Logic (Services)                          │
│  ├─ Controllers (Request Handlers)                     │
│  ├─ Middleware (Auth, Validation, Logging)             │
│  └─ Routes (31 API Endpoints)                          │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                  Data Layer                             │
│  (Prisma ORM, PostgreSQL 15+)                          │
│  ├─ Users & Authentication                             │
│  ├─ Health Profiles & Vitals                           │
│  ├─ Appointments & Wellness Plans                      │
│  ├─ Centers & Regional Data                            │
│  ├─ Feedback & Analytics                               │
│  └─ Audit Logs & Compliance                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**
- **Git**

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mesob-wellness.git
cd mesob-wellness
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mesob_wellness

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# Seed test users (optional)
node seed.mjs

# Start development server
npm run dev
```

Backend will run at: http://localhost:5000

#### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

Frontend will run at: http://localhost:5173

#### 4. Access the Application

Open your browser and navigate to: http://localhost:5173

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

#### 1. Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

#### 2. Production Deployment

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Build with no cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Scale services (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Service URLs (Docker)

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432 (internal)
- **Prisma Studio**: http://localhost:5555

### Docker Commands Reference

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Execute commands in container
docker-compose exec backend npm run prisma:studio
docker-compose exec backend npx prisma migrate dev

# Clean up volumes (⚠️ deletes data)
docker-compose down -v
```

### Environment Variables (Docker)

The Docker setup uses environment variables defined in:
- `docker-compose.yml` - Development configuration
- `docker-compose.prod.yml` - Production configuration
- `.env.docker` - Shared Docker environment variables

---

## 🗄️ Database

### PostgreSQL Setup

#### Why PostgreSQL?
- ✅ Native UUID support for unique identifiers
- ✅ JSONB for flexible health data storage
- ✅ Timezone-aware timestamps for global operations
- ✅ Advanced indexing (GiST, GIN) for fast queries
- ✅ Full-text search capabilities
- ✅ Better performance and horizontal scalability
- ✅ ACID compliance for data integrity
- ✅ Mature ecosystem and active community

#### Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download installer from: https://www.postgresql.org/download/windows/

#### Create Database

```bash
# Access PostgreSQL shell
sudo -u postgres psql

# Create database
CREATE DATABASE mesob_wellness;

# Create user (optional)
CREATE USER mesob_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mesob_wellness TO mesob_user;

# Exit
\q
```

#### Connection String

```env
DATABASE_URL=postgresql://username:password@localhost:5432/mesob_wellness?schema=public
```

### Database Schema

The database includes 12 main tables:

- **User** - Authentication and user accounts
- **HealthProfile** - Medical history and conditions
- **VitalRecord** - BMI, blood pressure, glucose measurements
- **Appointment** - Appointment scheduling and tracking
- **WellnessPlan** - Personalized health plans
- **Feedback** - Patient feedback and ratings
- **Center** - Healthcare facilities management
- **Region** - Ethiopian regional divisions
- **Notification** - System notifications
- **Settings** - Application configuration
- **AuditLog** - Compliance and security tracking
- **SMSReminder** - SMS notification tracking

### Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create new migration
npm run prisma:migrate:dev --name migration_name

# Deploy migrations (production)
npm run prisma:migrate:deploy

# Reset database (⚠️ deletes all data)
npm run prisma:reset

# Open Prisma Studio (GUI)
npm run prisma:studio
```

---

## 📡 API Reference

### Base URL

```
Development: http://localhost:5000/api/v1
Production: https://api.mesob.et/api/v1
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### API Endpoints (31 Total)

#### Authentication (6 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Public registration (CUSTOMER_STAFF only) | ❌ |
| POST | `/auth/create-user` | Hierarchical user creation | ✅ |
| POST | `/auth/login` | Login and receive JWT token | ❌ |
| POST | `/auth/verify-token` | Verify token validity | ❌ |
| GET | `/auth/me` | Get current authenticated user | ✅ |
| POST | `/auth/logout` | Logout user | ✅ |

#### Users (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get user profile | ✅ |
| PUT | `/users/me` | Update user profile | ✅ |
| POST | `/users/me/upload` | Upload profile picture | ✅ |

#### Vitals (5 endpoints)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/vitals/status` | Check vitals module status | Public |
| POST | `/vitals/bmi` | Record BMI | Nurse+ |
| POST | `/vitals/blood-pressure` | Record blood pressure | Nurse+ |
| GET | `/vitals/history/:userId` | Get vitals history | Auth |
| GET | `/vitals/latest/:userId` | Get latest vitals | Auth |

#### Appointments (4 endpoints)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/appointments` | List appointments (with filters) | Auth |
| POST | `/appointments` | Create appointment | Auth |
| GET | `/appointments/:id` | Get appointment details | Auth |
| PATCH | `/appointments/:id` | Update appointment status | Nurse+ |

#### Wellness Plans (2 endpoints)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/plans` | Create wellness plan | Nurse+ |
| GET | `/plans/:userId` | Get user's wellness plans | Auth |

#### Feedback (2 endpoints)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/feedback` | Submit feedback | Auth |
| GET | `/feedback` | Get all feedback with stats | Manager+ |

#### Centers Management (10 endpoints)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/centers` | Create center | Federal Admin |
| GET | `/centers` | List all centers (with filters) | Auth |
| GET | `/centers/:id` | Get center details | Auth |
| PUT | `/centers/:id` | Update center | Federal Admin |
| DELETE | `/centers/:id` | Delete center | Federal Admin |
| GET | `/centers/:id/analytics` | Get center analytics | Manager+ |
| GET | `/centers/analytics/region/:region` | Regional analytics | Regional+ |
| GET | `/centers/analytics/all` | National analytics | Federal Admin |
| POST | `/admin/centers` | Admin create center | Federal Admin |
| GET | `/admin/regions/:region/centers` | Get centers by region | Auth |

#### Admin & Analytics (5+ endpoints)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/dashboard/metrics` | Dashboard metrics | Manager+ |
| GET | `/admin/users` | List users (filtered) | Manager+ |
| GET | `/admin/regions` | List regions | Auth |
| GET | `/admin/regions/health-comparison` | Regional health data | Manager+ |
| GET | `/admin/centers/health-comparison` | Center health data | Manager+ |

#### Health Checks (2 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | API health check | ❌ |
| GET | `/api/health` | Detailed health status | ❌ |

### API Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Role-Based Access Control

### Roles Hierarchy

1. **CUSTOMER_STAFF** - Basic patient access
2. **NURSE_OFFICER** - Medical staff, record vitals
3. **MANAGER** - Center management
4. **REGIONAL_OFFICE** - Regional oversight
5. **FEDERAL_ADMIN** - Full system access

### Permission Matrix

| Feature | Customer | Nurse | Manager | Regional | Federal |
|---------|----------|-------|---------|----------|---------|
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Record vitals | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create appointments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update appointments | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create wellness plans | ❌ | ✅ | ✅ | ✅ | ✅ |
| Submit feedback | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all feedback | ❌ | ❌ | ✅ | ✅ | ✅ |
| View center analytics | ❌ | Own | Own | Region | All |
| View regional analytics | ❌ | ❌ | ❌ | Own | All |
| Manage centers | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create users | ❌ | ❌ | Limited | ❌ | ✅ |
| View audit logs | ❌ | ❌ | Limited | Limited | All |

### Hierarchical User Creation

| Creator Role | Can Create Roles |
|--------------|------------------|
| Public Registration | CUSTOMER_STAFF only |
| MANAGER | NURSE_OFFICER, CUSTOMER_STAFF |
| FEDERAL_ADMIN | All roles |

---

## 🧪 Testing

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer Staff | customer@mesob.et | Customer123! |
| Nurse Officer | nurse@mesob.et | Nurse123! |
| Manager | manager@mesob.et | Manager123! |
| Regional Office | regional@mesob.et | Regional123! |
| Federal Admin | admin@mesob.et | Admin123! |

### Running Tests

```bash
# Seed test users
cd backend
node seed.mjs

# Run comprehensive test suite
cd docs
bash test-all-endpoints.sh

# Test database connection
cd backend
node test-postgres-connection.js
```

### Test Coverage

- ✅ 30+ automated test cases
- ✅ All 31 API endpoints tested
- ✅ Authentication & authorization flows
- ✅ Role-based access control validation
- ✅ Error handling & edge cases
- ✅ Multi-role testing scenarios

---

## 🔒 Security & Compliance

### Security Features

- **JWT Authentication** - 1-hour token expiration with refresh capability
- **Password Hashing** - bcrypt with 12 salt rounds
- **Audit Logging** - Comprehensive activity tracking for compliance
- **Data Sovereignty** - All data stored locally, no external dependencies
- **Input Validation** - Request validation and sanitization
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **XSS Protection** - helmet middleware for HTTP headers
- **CORS** - Configurable cross-origin resource sharing

### Compliance

- **Proclamation 1321/2024** - Ethiopian data protection compliance
- **HIPAA-Ready** - Health data encryption and access controls
- **Audit Trail** - Complete action logging for regulatory requirements
- **Data Retention** - Configurable retention policies
- **Access Control** - Granular RBAC implementation

---

## 📚 Documentation

### Available Documentation

- **[API Complete Guide](docs/API_COMPLETE_GUIDE.md)** - Comprehensive API documentation
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Database structure and relationships
- **[PostgreSQL Migration](docs/POSTGRESQL_MIGRATION.md)** - Migration guide from MySQL
- **[Implementation Status](docs/IMPLEMENTATION_STATUS.md)** - Feature implementation tracking
- **[Backend API](docs/BACKEND_API.md)** - Detailed backend API reference
- **[Ethiopia Map Rebuild](ETHIOPIA_MAP_REBUILD.md)** - GeoJSON map implementation
- **[Map Testing Guide](MAP_TESTING_GUIDE.md)** - Map testing checklist

### Additional Resources

- **Prisma Schema**: `backend/prisma/schema.prisma`
- **API Contract**: `docs/api.md`
- **Seed Data**: `backend/seed.mjs`
- **Environment Template**: `backend/.env.example`

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow the existing code style
- Add meaningful commit messages

---

## 📝 License

**Government of Ethiopia - Ministry of Health**

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

© 2026 Ministry of Health, Ethiopia. All rights reserved.

---

## 📞 Support & Contact

For issues, questions, or support:

- **Issues**: [GitHub Issues](https://github.com/your-org/mesob-wellness/issues)
- **Email**: support@mesob.et
- **Documentation**: [docs/](docs/)

---

<div align="center">

**Built with ❤️ for the people of Ethiopia**

[⬆ Back to Top](#mesob-wellness-platform)

</div>
