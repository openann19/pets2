# 🚀 Admin Panel - Quick Start Guide

## Get Started in 3 Minutes!

### Step 1: Setup Admin Accounts (30 seconds)

```bash
cd /Users/elvira/Downloads/pets-pr-1
node scripts/setup-admin.js
```

This creates 5 admin accounts with different roles:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Administrator** | admin@pawfectmatch.com | Admin123! | Full access to everything |
| **Moderator** | moderator@pawfectmatch.com | Moderator123! | User/chat/content management |
| **Support** | support@pawfectmatch.com | Support123! | Read-only access |
| **Analyst** | analyst@pawfectmatch.com | Analyst123! | Analytics and reports |
| **Billing Admin** | billing@pawfectmatch.com | Billing123! | Billing and Stripe |

### Step 2: Start the Backend (1 minute)

```bash
cd server
npm install express-rate-limit ws
npm start
```

You should see:
```
✅ Server running on port 3001
✅ Admin WebSocket service initialized
✅ Connected to MongoDB
```

### Step 3: Start the Frontend (1 minute)

```bash
cd apps/web
npm run dev
```

You should see:
```
✅ Ready on http://localhost:3000
```

### Step 4: Login & Explore! (30 seconds)

1. Open browser: `http://localhost:3000`
2. Click **Login**
3. Use any admin account from the table above
4. Navigate to: `http://localhost:3000/admin`

---

## 🎯 What You Can Do

### As Administrator (Full Access)
- ✅ View real-time analytics dashboard
- ✅ Manage all users (suspend, ban, activate)
- ✅ Configure Stripe settings
- ✅ View audit logs
- ✅ Monitor security alerts
- ✅ Access all features

### As Moderator
- ✅ Manage users (suspend, ban)
- ✅ Moderate chats and content
- ✅ Approve/reject uploads
- ✅ View analytics
- ❌ Cannot configure Stripe
- ❌ Cannot access billing

### As Support
- ✅ View users and chats
- ✅ View analytics
- ❌ Cannot modify anything
- ❌ Read-only access

### As Analyst
- ✅ View and export analytics
- ✅ Create custom reports
- ✅ View user data
- ❌ Cannot modify users
- ❌ Cannot access billing

### As Billing Admin
- ✅ Manage Stripe configuration
- ✅ View billing metrics
- ✅ Manage subscriptions
- ✅ View revenue analytics
- ❌ Cannot manage users
- ❌ Cannot moderate content

---

## 🔍 Explore Features

### 1. Real-Time Analytics Dashboard
**URL**: `http://localhost:3000/admin/dashboard`

**What You'll See**:
- 📊 User statistics (total, active, growth)
- 🐾 Pet statistics
- 💬 Match and message metrics
- 💰 Revenue metrics (from Stripe)
- 📈 30-day trend charts
- 🌍 Geographic distribution
- 📱 Device statistics
- 🔒 Security metrics

**Features**:
- Auto-refresh every 30 seconds
- Export data as CSV/PDF
- Real-time WebSocket updates
- No mock data - all real!

### 2. User Management
**URL**: `http://localhost:3000/admin/users`

**What You Can Do**:
- Search and filter users
- View user details
- Suspend/ban users
- Activate suspended accounts
- View user activity
- See user's pets and matches

### 3. Audit Logs
**URL**: `http://localhost:3000/admin/audit-logs`

**What You'll See**:
- All admin actions logged
- Who did what and when
- Filter by admin, action, date
- Export audit logs
- Compliance tracking

### 4. Stripe Management
**URL**: `http://localhost:3000/admin/stripe`

**What You Can Do**:
- Configure Stripe API keys
- View active subscriptions
- Monitor billing metrics
- Track revenue (MRR, ARPU, churn)
- Manage payment settings

### 5. Security Alerts
**URL**: `http://localhost:3000/admin/security`

**What You'll See**:
- Real-time security alerts
- Unauthorized access attempts
- Rate limit violations
- Suspicious activities
- Alert management

---

## 🧪 Test Different Roles

### Test 1: Administrator Access
```bash
# Login as: admin@pawfectmatch.com / Admin123!
# Try: Access all pages ✅
# Try: Suspend a user ✅
# Try: Configure Stripe ✅
# Try: View audit logs ✅
```

### Test 2: Moderator Access
```bash
# Login as: moderator@pawfectmatch.com / Moderator123!
# Try: Access dashboard ✅
# Try: Suspend a user ✅
# Try: Configure Stripe ❌ (Should be blocked)
# Try: View billing ❌ (Should be blocked)
```

### Test 3: Support Access
```bash
# Login as: support@pawfectmatch.com / Support123!
# Try: View users ✅
# Try: View analytics ✅
# Try: Edit user ❌ (Should be blocked)
# Try: Delete anything ❌ (Should be blocked)
```

---

## 🔧 API Testing

### Get Analytics (with curl)
```bash
# 1. Login and get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pawfectmatch.com","password":"Admin123!"}'

# 2. Use token to get analytics
curl http://localhost:3001/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Audit Logs
```bash
curl http://localhost:3001/api/admin/audit-logs?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Rate Limiting
```bash
# Send 101 requests quickly (should get rate limited)
for i in {1..101}; do
  curl http://localhost:3001/api/admin/analytics \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
done
# After 100 requests, you'll get: 429 Too Many Requests
```

---

## 🎨 Frontend Components

### Permission Guard Example
```typescript
import { PermissionGuard } from '@/hooks/useAdminPermissions';

<PermissionGuard permission="users:edit">
  <button>Edit User</button>
</PermissionGuard>

// Button only shows if user has 'users:edit' permission
```

### Role Guard Example
```typescript
import { RoleGuard } from '@/hooks/useAdminPermissions';

<RoleGuard role="administrator">
  <button>Delete Everything</button>
</RoleGuard>

// Button only shows for administrators
```

### Check Permission in Code
```typescript
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

function MyComponent() {
  const { hasPermission, user } = useAdminPermissions();
  
  if (hasPermission('stripe:configure')) {
    // Show Stripe settings
  }
  
  console.log('Current role:', user?.role);
}
```

---

## 🌐 WebSocket Real-Time Updates

### Connect to WebSocket
```javascript
const token = localStorage.getItem('auth-token');
const ws = new WebSocket(`ws://localhost:3001/admin/ws?token=${token}`);

ws.onopen = () => {
  console.log('✅ Connected to admin WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Received:', data);
  
  switch (data.event) {
    case 'user_update':
      console.log('User updated:', data.data);
      break;
    case 'security_alert':
      console.log('🚨 Security alert:', data.data);
      break;
  }
};
```

### Test Real-Time Updates
1. Open admin dashboard in two browser windows
2. Login with different admin accounts
3. Make a change in one window
4. See it update in real-time in the other window!

---

## 📊 Sample Data

### Create Test Users (Optional)
```bash
node scripts/create-test-data.js
```

This creates:
- 100 test users
- 50 test pets
- 25 test matches
- 100 test messages

Now your analytics will have real data to display!

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"
```bash
# Make sure MongoDB is running
brew services start mongodb-community
# or
mongod --dbpath /path/to/data
```

### Issue: "Port 3001 already in use"
```bash
# Kill the process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Issue: "Module not found"
```bash
# Install dependencies
cd server && npm install
cd ../apps/web && npm install
```

### Issue: "Unauthorized" when accessing admin
```bash
# Make sure you're logged in with an admin account
# Check that role is set correctly in database:
mongo
use pawfectmatch
db.users.findOne({email: 'admin@pawfectmatch.com'})
# Should show: role: 'administrator'
```

---

## 🎯 Quick Commands Reference

```bash
# Setup admin accounts
node scripts/setup-admin.js

# Start backend
cd server && npm start

# Start frontend
cd apps/web && npm run dev

# View logs
tail -f server/logs/admin.log

# Check database
mongo pawfectmatch
db.users.find({role: {$ne: 'user'}})  # Show all admins
db.adminactivitylogs.find().limit(10) # Show recent admin actions

# Test API
curl http://localhost:3001/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎉 You're Ready!

The admin panel is now fully functional with:
- ✅ 5 different admin roles
- ✅ Real-time analytics
- ✅ WebSocket synchronization
- ✅ Complete audit logging
- ✅ Rate limiting
- ✅ Session management
- ✅ Zero mock data

**Start exploring and enjoy your enterprise-grade admin panel! 🚀**

---

## 📚 Need More Help?

- **Full Documentation**: See `ADMIN_PANEL_FINAL_SUMMARY.md`
- **API Reference**: See `ADMIN_PANEL_COMPLETE_IMPLEMENTATION.md`
- **Security Details**: See `ADMIN_PANEL_ANALYSIS_AND_FIXES.md`

**Happy Exploring! 🎊**
