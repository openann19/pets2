# PawfectMatch Admin API Management System

This document provides an overview of the Admin API management system implementation for PawfectMatch. The system is designed to securely manage and configure external services such as Stripe, DeepSeek AI, Google Maps, and more.

## 🔒 Security Features

### Authentication & Authorization
- **Admin Route Protection**: All `/api/admin/*` routes are protected with:
  - `authenticateToken` middleware to verify JWT token
  - `requireAdmin` middleware to ensure admin role
- **Input Validation**: 
  - Server-side validation using express-validator & Joi
  - Data format verification before processing
- **API Key Management**: 
  - Encrypted storage of API keys using AES-256-GCM
  - Key rotation capability 
  - Environment-specific configs

### Audit & Compliance
- **Admin Action Logging**:
  - Every admin action is logged with:
    - Admin user ID
    - Action type
    - Details/parameters 
    - IP address
    - User agent
    - Timestamp
    - Success/failure status
  - Searchable & filterable audit trail

## 💾 Data Persistence

### Configuration Storage
- **Database-First Approach**:
  - All configurations stored in MongoDB
  - Environment variables as fallback
- **Configuration Model**:
  - Type-based configuration (e.g., 'stripe', 'ai', 'maps')
  - Encrypted sensitive fields
  - Version history tracking

### Schema Design
- **Configuration**: Stores service configurations with encryption
- **AdminActivityLog**: Records all admin actions
- **AdminApiKey**: Manages programmatic API access

## 🔌 API Integrations

### Stripe Integration
- **Real API Connections**:
  - Direct connection to Stripe API
  - Subscription management
  - Customer billing data
  - Payment method handling
  - Webhook configuration
- **Fallback to Mock Data**:
  - Gracefully handles connection issues
  - Provides mock data for development

### AI & Maps Services
- **DeepSeek AI Configuration**:
  - API key management
  - Model selection
  - Parameter configuration
- **Google Maps Services**:
  - API key management
  - Quota monitoring
  - Service usage tracking

## 📊 Monitoring & Alerts

- **Service Health Monitoring**:
  - Status checks for all services
  - Error rate tracking
  - Response time monitoring
- **Usage Analytics**:
  - API call volumes
  - Cost tracking
  - Quota utilization

## 🛠️ Implementation Details

### Middleware

| Middleware | Purpose |
|------------|---------|
| `authenticateToken` | Verifies JWT token and adds user to request |
| `requireAdmin` | Ensures user has admin role |
| `adminActionLogger` | Logs all admin actions |
| `validate` | Validates request bodies against schemas |
| `inputValidator` | Validates specific input formats (e.g., API keys) |

### Models

| Model | Purpose |
|-------|---------|
| `Configuration` | Stores service configurations |
| `AdminActivityLog` | Records admin actions |
| `AdminApiKey` | Manages programmatic API access |

### Services

| Service | Purpose |
|---------|---------|
| `stripeService` | Manages Stripe API interactions |
| `aiService` | Manages DeepSeek AI API interactions |
| `mapsService` | Manages Google Maps API interactions |

## 🔄 API Endpoints

### Stripe Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stripe/config` | GET | Get Stripe configuration |
| `/api/admin/stripe/config` | POST | Update Stripe configuration |
| `/api/admin/stripe/subscriptions` | GET | List all subscriptions |
| `/api/admin/stripe/metrics` | GET | Get billing metrics |

### AI Service Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/ai/config` | GET | Get AI service configuration |
| `/api/admin/ai/config` | POST | Update AI service configuration |
| `/api/admin/ai/stats` | GET | Get AI usage statistics |

### Maps Service Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/maps/config` | GET | Get Maps configuration |
| `/api/admin/maps/config` | POST | Update Maps configuration |
| `/api/admin/maps/stats` | GET | Get Maps usage statistics |

## 🚀 Usage

### Configuration Setup

1. Set environment variables or use admin UI to configure services
2. API keys and secrets are automatically encrypted in the database
3. Service configurations are available to authorized admin users only

### Admin Audit Log

1. All admin actions are automatically logged
2. Logs can be viewed in the admin UI or via API
3. Logs include user, action, details, timestamp, and status

### API Key Management

1. Create API keys for programmatic access
2. Set permissions and expiration dates
3. Monitor API key usage

## 🔐 Security Recommendations

1. **Rotate API Keys**: Regularly rotate all external service API keys
2. **Review Audit Logs**: Periodically review admin activity logs
3. **Set IP Restrictions**: Restrict admin access to trusted IP addresses
4. **2FA**: Enforce two-factor authentication for admin users
5. **Environment Isolation**: Use separate API keys for dev, staging, and production

## 📝 Notes

- Sensitive configuration is stored encrypted in the database
- The `CONFIG_ENCRYPTION_KEY` environment variable must be set and kept secure
- Admin actions are logged for audit and compliance purposes
- All API routes are protected with authentication and authorization
