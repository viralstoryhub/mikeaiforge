# Backend Setup Guide

## Prerequisites

Before setting up the backend, ensure you have:

- ✅ Node.js 20+ installed
- ✅ PostgreSQL 16+ installed and running
- ✅ Redis 7+ installed (optional but recommended)
- ✅ Your Gemini API key
- ✅ Stripe account (for payment features)
- ✅ SendGrid account (for email features)

## Step-by-Step Setup

### 1. Install PostgreSQL

#### Windows
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember your password for the `postgres` user
4. Default port: 5432

#### Mac
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mikeaiforge;

# Create user (optional)
CREATE USER mikeaiforge_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mikeaiforge TO mikeaiforge_user;

# Exit
\q
```

### 3. Install Redis (Optional)

#### Windows
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Run the installer
3. Start Redis service

#### Mac
```bash
brew install redis
brew services start redis
```

#### Linux
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### 4. Configure Backend Environment

Create `backend/.env` file:

```bash
cd backend
cp ../.env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Application
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mikeaiforge
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
REFRESH_TOKEN_EXPIRES_IN=30d

# Google Gemini AI
GEMINI_API_KEY=AIzaSyAHJXWzA89CR4ugjDgYLA3D-_ck6Mi62mY

# Stripe Payment (Optional - use test keys)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRO_PRICE_ID=price_your_price_id

# Email Service (Optional)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- Express.js (web framework)
- Prisma (database ORM)
- JWT (authentication)
- Bcrypt (password hashing)
- Stripe (payments)
- SendGrid (emails)
- And more...

### 6. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 7. Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

This creates all database tables:
- Users
- Tools
- Workflows
- SavedTools
- UtilityUsage
- AIPersonas
- ChatSessions
- ChatMessages
- ApiKeys
- AuditLogs

### 8. Seed Database with Initial Data

```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@example.com` / `password`
- Test user: `test@example.com` / `password`
- All AI tools from the directory
- All workflows

### 9. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📝 Environment: development
```

### 10. Test Backend API

Open a new terminal and test:

```bash
# Health check
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 11. Update Frontend to Use Backend

Now that the backend is running, update the frontend:

#### Remove Mock Fallbacks

1. **Edit `services/authService.ts`**:
   - Remove all the mock authentication code
   - Keep only the API calls (try-catch blocks)

2. **Edit `services/geminiService.ts`**:
   - Remove the environment variable fallback
   - Keep only the backend API call in `fetchApiKey()`

3. **Restart frontend**:
```bash
# In the root directory
npm run dev
```

### 12. Test Full Stack

1. Open http://localhost:3000
2. Try to sign up with a new account
3. Login with the new account
4. Test utilities (they should now track usage in the database)
5. Check admin panel (login as `admin@example.com`)

## Verify Setup

### Check Database

```bash
cd backend
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can:
- View all database tables
- See user records
- Check utility usage
- Inspect chat history

### Check Logs

Backend logs are stored in:
- `backend/logs/error.log` - Error logs
- `backend/logs/combined.log` - All logs

### Check API Endpoints

Test with curl or Postman:

```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"password123","name":"New User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Troubleshooting

### Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:
1. Check PostgreSQL is running:
   ```bash
   # Windows
   services.msc (look for PostgreSQL)
   
   # Mac/Linux
   brew services list
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL in `backend/.env`
3. Test connection:
   ```bash
   psql -U postgres -d mikeaiforge
   ```

### Port 5000 Already in Use

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

Or change the port in `backend/.env`:
```env
PORT=5001
```

### Prisma Migration Failed

**Solution**:
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

### JWT Secret Error

**Error**: `JWT_SECRET is not defined`

**Solution**: Make sure `backend/.env` has:
```env
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

## Optional: Docker Setup

If you prefer using Docker:

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up
```

This automatically:
- Creates PostgreSQL database
- Starts Redis
- Runs migrations
- Seeds database
- Starts backend on port 5000
- Starts frontend on port 3000

## Next Steps

1. **Set up Stripe** (for payments):
   - Create account at https://stripe.com
   - Get test API keys
   - Add to `backend/.env`
   - Test subscription flow

2. **Set up SendGrid** (for emails):
   - Create account at https://sendgrid.com
   - Get API key
   - Add to `backend/.env`
   - Test welcome emails

3. **Set up Sentry** (for error tracking):
   - Create account at https://sentry.io
   - Get DSN
   - Add to `.env.local`
   - Test error reporting

4. **Deploy to Production**:
   - See `docs/DEPLOYMENT.md` for deployment guides
   - Options: Vercel, Railway, AWS, DigitalOcean

## Support

If you encounter issues:
1. Check the logs in `backend/logs/`
2. Review the error messages in the terminal
3. Verify all environment variables are set
4. Ensure PostgreSQL and Redis are running
5. Check that ports 3000 and 5000 are available

## Summary

Once setup is complete, you'll have:
- ✅ PostgreSQL database with all tables
- ✅ Backend API running on port 5000
- ✅ Frontend connected to backend
- ✅ Real authentication with JWT
- ✅ Database persistence
- ✅ API key stored securely on server
- ✅ Ready for production deployment