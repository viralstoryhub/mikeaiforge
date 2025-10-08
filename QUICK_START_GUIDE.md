# Quick Start Guide - Getting Your Project Running

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Set Up Environment Variables

Your `.env` file has been fixed! But you need to configure a few things:

#### Required: API URL (Already Set ✅)
```bash
VITE_API_URL=http://localhost:5000/api
```

#### Optional: Google Analytics
If you want Google Analytics tracking:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a GA4 property
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)
4. Update `.env`:
   ```bash
   VITE_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID
   ```

If you don't have GA or don't want it yet, leave it empty:
```bash
VITE_GA_MEASUREMENT_ID=
```

### Step 3: Set Up Backend Database

```bash
cd backend

# Create a .env file for backend
cp .env.example .env

# Edit backend/.env with your database credentials
# At minimum, set:
# DATABASE_URL=postgresql://user:password@localhost:5432/mikeaiforge

# Run database migrations
npx prisma migrate dev

# Seed initial data (including news articles)
npm run seed
```

### Step 4: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 5: Open Your Browser

Navigate to: `http://localhost:5173`

---

## ✅ Verify Everything Works

### Check AI News Section

1. **Homepage:** Scroll down to "Latest AI News" section
   - Should show 3 news articles
   - If empty, backend might not have news data yet

2. **News Page:** Click "Read AI News" or navigate to `/news`
   - Should show a list of news articles
   - Should have categories and search functionality

3. **If no news appears:**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/health
   
   # Test news endpoint
   curl http://localhost:5000/api/news
   
   # If empty, seed the database
   cd backend
   npm run seed
   ```

### Check Google Analytics

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Look for:**
   - No GA errors
   - If you set a GA ID, you should see GA initialization

4. **Go to Network tab**
   - Filter by "gtag" or "google-analytics"
   - Should see requests if GA ID is configured

---

## 🔧 Common Issues & Solutions

### Issue: "Failed to fetch articles"

**Solution:**
```bash
# 1. Check if backend is running
curl http://localhost:5000/health

# 2. Check if VITE_API_URL is correct in .env
cat .env | grep VITE_API_URL

# 3. Restart frontend dev server
npm run dev
```

### Issue: "CORS Error"

**Solution:**
The backend is configured to allow `localhost:5173`. If you're using a different port:

1. Check your frontend dev server port
2. Update `backend/src/server.ts` to include your port in `allowedOrigins`

### Issue: "Database connection error"

**Solution:**
```bash
# 1. Make sure PostgreSQL is running
# 2. Check backend/.env has correct DATABASE_URL
# 3. Create database if it doesn't exist
createdb mikeaiforge

# 4. Run migrations
cd backend
npx prisma migrate dev
```

### Issue: "No news articles showing"

**Solution:**
```bash
# Option 1: Seed the database
cd backend
npm run seed

# Option 2: Manually trigger news sync
# (Requires RSS feeds configured in backend/.env)
cd backend
npm run sync-news
```

### Issue: Google Analytics not tracking

**Checklist:**
- [ ] `VITE_GA_MEASUREMENT_ID` is set in `.env`
- [ ] GA Measurement ID format is correct: `G-XXXXXXXXXX`
- [ ] Frontend dev server was restarted after changing `.env`
- [ ] No ad blockers are enabled
- [ ] Browser console shows no GA errors

---

## 📁 Project Structure

```
mikeaiforge-master/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services (FIXED: newsService.ts)
│   ├── App.tsx            # Main app (FIXED: Added GA init)
│   └── main.tsx           # Entry point
├── backend/               # Backend source code
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── server.ts      # Express server
│   └── prisma/            # Database schema
├── .env                   # Frontend env vars (FIXED)
├── backend/.env           # Backend env vars
└── package.json           # Frontend dependencies
```

---

## 🎯 What Was Fixed

### 1. AI News Section ✅
- **Fixed API endpoints:** `/news/articles` → `/news`
- **Fixed response handling:** Added `extractData()` helper
- **Fixed `.env`:** Proper configuration instead of template

### 2. Google Analytics ✅
- **Added initialization:** GA now initializes on app start
- **Fixed `.env`:** Ready for your GA Measurement ID
- **Added tracking:** Page views and events will be tracked

---

## 📚 Additional Resources

- **Full Setup Guide:** See `FIXES_APPLIED.md`
- **Google Analytics Setup:** See `docs/GOOGLE_ANALYTICS_SETUP.md`
- **Backend Setup:** See `BACKEND_SETUP.md`
- **Deployment:** See `docs/DEPLOYMENT.md`

---

## 🆘 Still Having Issues?

1. **Check browser console** for error messages
2. **Check backend logs** in the terminal
3. **Verify all environment variables** are set correctly
4. **Make sure both servers are running**
5. **Try clearing browser cache** and localStorage

### Debug Commands

```bash
# Check if backend is accessible
curl http://localhost:5000/health

# Check news endpoint
curl http://localhost:5000/api/news

# Check frontend env vars
cat .env

# Check backend env vars
cat backend/.env

# Restart everything
# Kill all node processes, then:
cd backend && npm run dev &
npm run dev
```

---

## ✨ You're All Set!

Your AI News section and Google Analytics should now be working. 

**Next Steps:**
1. Add your Google Analytics Measurement ID (optional)
2. Customize the news RSS feeds in `backend/.env`
3. Add more content and features
4. Deploy to production when ready

Happy coding! 🚀

