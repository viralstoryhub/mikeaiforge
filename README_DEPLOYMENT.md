# 🚀 Mike's AI Forge - Deployment Guide

## Your Current Setup

- **Frontend:** Netlify → https://mikesaiforge.netlify.app
- **Backend:** Render → https://mikeaiforge-backend.onrender.com
- **Database:** Neon PostgreSQL (Serverless)

---

## 🔥 IMMEDIATE ACTION REQUIRED

Your AI News section isn't working because:

1. ❌ Backend database hasn't been initialized (no migrations run)
2. ❌ No news articles in database
3. ❌ Environment variables need updating

### Quick Fix (15 minutes)

**Follow this guide:** `IMMEDIATE_FIXES.md`

**TL;DR:**
1. Update Netlify env vars → Redeploy
2. Run `npx prisma migrate deploy` in Render Shell
3. Run `npm run seed` in Render Shell
4. Update Render env vars → Redeploy
5. Test!

---

## 📁 Files Created for You

| File | Purpose |
|------|---------|
| `IMMEDIATE_FIXES.md` | **START HERE** - Step-by-step fix guide |
| `DEPLOYMENT_SETUP.md` | Complete deployment documentation |
| `FIXES_APPLIED.md` | What was fixed in the code |
| `QUICK_START_GUIDE.md` | Local development setup |
| `backend/.env` | Backend environment variables (configured with your Neon DB) |
| `.env` | Frontend environment variables (configured for production) |

---

## 🎯 What Was Fixed in Code

### 1. News Service API Endpoints ✅
**File:** `src/services/newsService.ts`

- Fixed API paths: `/news/articles` → `/news`
- Added `extractData()` helper for backend response format
- Added missing `getFeaturedArticles()` function

### 2. Google Analytics Initialization ✅
**File:** `src/App.tsx`

- Added GA initialization on app mount
- Imported `initializeAnalytics` service

### 3. Environment Configuration ✅
**Files:** `.env`, `backend/.env`

- Configured production URLs (Render backend)
- Added Neon database connection string
- Set up proper environment variables

---

## 🔧 Environment Variables Reference

### Netlify (Frontend)

```bash
VITE_API_URL=https://mikeaiforge-backend.onrender.com/api
VITE_API_BASE_URL=https://mikeaiforge-backend.onrender.com/api
VITE_GA_MEASUREMENT_ID=  # Optional: Add your GA4 ID
```

### Render (Backend)

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_gAuHoj0LkE6Z@ep-autumn-union-ad9pwpua-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# App Config
NODE_ENV=production
FRONTEND_URL=https://mikesaiforge.netlify.app
ENABLE_NEWS_SYNC=true

# Security (CHANGE THESE!)
JWT_SECRET=<generate-random-32-char-string>
REFRESH_TOKEN_SECRET=<generate-random-32-char-string>
SESSION_SECRET=<generate-random-32-char-string>

# News Feeds
NEWS_RSS_FEEDS=https://feeds.feedburner.com/venturebeat/SZYF,https://techcrunch.com/tag/artificial-intelligence/feed/
```

**Generate random secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 Deployment Checklist

### Backend (Render)

- [ ] Environment variables configured
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Database seeded (`npm run seed`)
- [ ] Health check passes: https://mikeaiforge-backend.onrender.com/health
- [ ] News API works: https://mikeaiforge-backend.onrender.com/api/news

### Frontend (Netlify)

- [ ] Environment variables configured
- [ ] Site deployed successfully
- [ ] No build errors
- [ ] Site loads: https://mikesaiforge.netlify.app
- [ ] No console errors in browser

### Database (Neon)

- [ ] Database is active
- [ ] Migrations applied
- [ ] Sample data exists
- [ ] Connection string works

---

## 🧪 Testing

### 1. Test Backend

```bash
# Health check
curl https://mikeaiforge-backend.onrender.com/health

# News API
curl https://mikeaiforge-backend.onrender.com/api/news

# Should return JSON with articles
```

### 2. Test Frontend

1. Open: https://mikesaiforge.netlify.app
2. Open DevTools (F12) → Console
3. Check for errors (should be none)
4. Scroll to "Latest AI News" section
5. Should see 3 news articles
6. Click "Read AI News" → Should show news page

### 3. Test Database

```bash
# In Render Shell
npx prisma studio
```

Opens web interface to view database contents.

---

## 🐛 Troubleshooting

### "No news articles yet"

**Cause:** Database is empty

**Fix:**
```bash
# In Render Shell
npm run seed
# OR manually add articles via Prisma Studio
npx prisma studio
```

### CORS Errors

**Cause:** Frontend URL not whitelisted

**Fix:**
1. Check `FRONTEND_URL` in Render env vars
2. Should be: `https://mikesaiforge.netlify.app`
3. No trailing slash!
4. Redeploy backend

### Network Errors

**Cause:** Backend is down or wrong URL

**Fix:**
1. Check Render service is running
2. Check `VITE_API_URL` in Netlify
3. Should be: `https://mikeaiforge-backend.onrender.com/api`
4. Redeploy frontend

### Database Connection Failed

**Cause:** Invalid DATABASE_URL or Neon DB inactive

**Fix:**
1. Check Neon dashboard - is DB active?
2. Verify DATABASE_URL in Render
3. Test connection:
   ```bash
   npx prisma db pull
   ```

---

## 📊 Monitoring

### Render Logs

https://dashboard.render.com/web/srv-d8lh7m3gph9c7sem7f0/logs

Watch for:
- Startup messages
- News sync job registration
- API requests
- Errors

### Netlify Logs

https://app.netlify.com/sites/mikesaiforge/deploys

Watch for:
- Build success/failure
- Deploy time
- Build warnings

### Neon Dashboard

https://console.neon.tech/

Monitor:
- Database size
- Active connections
- Query performance

---

## 🎨 Optional Enhancements

### 1. Google Analytics

1. Create GA4 property: https://analytics.google.com
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to Netlify env vars: `VITE_GA_MEASUREMENT_ID=G-YOUR-ID`
4. Redeploy Netlify

### 2. Custom Domain

**Netlify:**
- Site settings → Domain management
- Add custom domain
- Configure DNS

**Render:**
- Settings → Custom Domain
- Add API subdomain (api.yourdomain.com)

### 3. Email Notifications

Add to Render env vars:
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-key
FROM_EMAIL=noreply@yourdomain.com
```

---

## 🆘 Need Help?

### Check These First:

1. **Render Logs** - Most backend errors show here
2. **Browser Console** - Frontend errors appear here
3. **Netlify Deploy Log** - Build errors show here
4. **Neon Dashboard** - Database status

### Common Commands:

```bash
# Render Shell
npx prisma migrate deploy    # Run migrations
npx prisma generate          # Generate Prisma client
npx prisma studio           # Open database GUI
npm run seed                # Seed sample data
npm run sync-news           # Manually sync news

# Local Development
npm install                 # Install dependencies
npm run dev                 # Start dev server
```

---

## 📚 Documentation

- **Render:** https://render.com/docs
- **Netlify:** https://docs.netlify.com
- **Neon:** https://neon.tech/docs
- **Prisma:** https://www.prisma.io/docs

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Backend health check returns `{"status":"ok"}`
- ✅ News API returns articles array
- ✅ Frontend loads without errors
- ✅ News section displays articles
- ✅ No CORS errors
- ✅ All features work as expected

---

## 🎉 Next Steps

Once everything is working:

1. **Add more content** (tools, workflows, forum posts)
2. **Customize branding** (colors, logo, copy)
3. **Set up monitoring** (Sentry, LogRocket)
4. **Configure custom domain**
5. **Enable Google Analytics**
6. **Set up email notifications**
7. **Add more news sources** (RSS feeds)

---

**Good luck! 🚀**

If you follow `IMMEDIATE_FIXES.md`, your AI News section should be working in ~15 minutes!

