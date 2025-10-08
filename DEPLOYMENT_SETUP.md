# Complete Deployment Setup Guide

## Current Setup Status

✅ **Frontend:** Deployed on Netlify (https://mikesaiforge.netlify.app)  
✅ **Backend:** Deployed on Render (https://mikeaiforge-backend.onrender.com)  
✅ **Database:** Neon PostgreSQL (configured)  

## Issues to Fix

### 1. Backend Database Migration

Your backend needs to run database migrations on Neon PostgreSQL.

**Steps:**

1. **Connect to your Render backend:**
   - Go to https://dashboard.render.com
   - Click on `mikeaiforge-backend`
   - Go to "Shell" tab

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed initial data (optional but recommended):**
   ```bash
   npm run seed
   ```

   If you don't have a seed script, you can manually create some news articles later.

### 2. Update Render Environment Variables

Go to Render Dashboard → mikeaiforge-backend → Environment

**Add/Update these variables:**

```bash
# Database (Already configured via DATABASE_URL)
DATABASE_URL=postgresql://neondb_owner:npg_gAuHoj0LkE6Z@ep-autumn-union-ad9pwpua-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Frontend URL
FRONTEND_URL=https://mikesaiforge.netlify.app

# Node Environment
NODE_ENV=production

# Enable News Sync
ENABLE_NEWS_SYNC=true

# News RSS Feeds
NEWS_RSS_FEEDS=https://feeds.feedburner.com/venturebeat/SZYF,https://techcrunch.com/tag/artificial-intelligence/feed/,https://www.artificialintelligence-news.com/feed/,https://www.theverge.com/rss/ai-artificial-intelligence/index.xml

# JWT Secrets (IMPORTANT: Change these to random strings!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this

# Session Secret
SESSION_SECRET=your-session-secret-change-this
```

**Generate Random Secrets:**
```bash
# Run this in your terminal to generate random secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Update Netlify Environment Variables

Go to Netlify Dashboard → mikesaiforge → Site settings → Environment variables

**Add/Update these variables:**

```bash
# Backend API URL
VITE_API_URL=https://mikeaiforge-backend.onrender.com/api
VITE_API_BASE_URL=https://mikeaiforge-backend.onrender.com/api

# Google Analytics (Optional - add your GA4 Measurement ID)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Trigger Redeploy

After updating environment variables:

1. **Render Backend:**
   - Go to Render Dashboard
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete

2. **Netlify Frontend:**
   - Go to Netlify Dashboard
   - Click "Trigger deploy" → "Deploy site"
   - Wait for deployment to complete

---

## Testing After Deployment

### 1. Test Backend Health

```bash
curl https://mikeaiforge-backend.onrender.com/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-10-07T..."}
```

### 2. Test News API

```bash
curl https://mikeaiforge-backend.onrender.com/api/news
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {...}
  }
}
```

### 3. Test Frontend

1. Visit: https://mikesaiforge.netlify.app
2. Open browser DevTools (F12) → Console
3. Check for errors
4. Scroll to "Latest AI News" section
5. Click "Read AI News" to go to /news page

---

## Common Issues & Solutions

### Issue: "No news articles yet"

**Solution 1: Seed the database**
```bash
# In Render Shell
npm run seed
```

**Solution 2: Manually trigger news sync**
```bash
# In Render Shell
npm run sync-news
```

**Solution 3: Wait for automatic sync**
- News sync runs every 6 hours automatically
- Check Render logs to see if it's running

### Issue: CORS Errors

**Check:**
1. `FRONTEND_URL` in Render matches your Netlify URL exactly
2. No trailing slash in URLs
3. Redeploy backend after changing CORS settings

**Fix in backend/src/server.ts if needed:**
```javascript
const allowedOrigins = [
  'https://mikesaiforge.netlify.app',
  'https://app.netlify.com', // Netlify preview
  process.env.FRONTEND_URL,
].filter(Boolean);
```

### Issue: Database Connection Errors

**Check:**
1. DATABASE_URL is correct in Render
2. Neon database is active (check Neon dashboard)
3. SSL mode is set to `require`

**Test connection:**
```bash
# In Render Shell
npx prisma db pull
```

### Issue: 500 Internal Server Error

**Check Render Logs:**
1. Go to Render Dashboard → mikeaiforge-backend
2. Click "Logs" tab
3. Look for error messages
4. Common issues:
   - Missing environment variables
   - Database migration not run
   - Invalid JWT secrets

---

## Database Management

### View Database Schema

```bash
# In Render Shell
npx prisma studio
```

This opens a web interface to view/edit your database.

### Run Migrations

```bash
# In Render Shell
npx prisma migrate deploy
```

### Reset Database (CAUTION: Deletes all data!)

```bash
# In Render Shell
npx prisma migrate reset
```

---

## Monitoring & Maintenance

### Check Backend Logs

1. Go to Render Dashboard
2. Click on `mikeaiforge-backend`
3. Click "Logs" tab
4. Monitor for errors

### Check Netlify Logs

1. Go to Netlify Dashboard
2. Click on `mikesaiforge`
3. Click "Deploys" tab
4. Click on latest deploy → "Deploy log"

### Monitor News Sync

News sync runs every 6 hours. Check logs for:
```
📰 News sync job registered successfully
Fetching AI news from X RSS sources
```

---

## Optional Enhancements

### 1. Set up Google Analytics

1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to Netlify environment variables:
   ```
   VITE_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID
   ```
4. Redeploy Netlify

### 2. Set up Custom Domain

**Netlify:**
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to Settings → Custom Domain
2. Add your API subdomain (e.g., api.yourdomain.com)
3. Update VITE_API_URL in Netlify

### 3. Enable Email Notifications

Add to Render environment variables:
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

---

## Quick Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Netlify
- [ ] Database migrations run on Neon
- [ ] Environment variables set on Render
- [ ] Environment variables set on Netlify
- [ ] Backend health check passes
- [ ] News API returns data
- [ ] Frontend loads without errors
- [ ] News section displays articles
- [ ] CORS configured correctly
- [ ] JWT secrets are random and secure

---

## Next Steps

1. **Run database migrations** on Render
2. **Seed initial data** (tools, workflows, news)
3. **Test all features** on production
4. **Set up monitoring** (optional: Sentry, LogRocket)
5. **Configure custom domain** (optional)
6. **Set up Google Analytics** (optional)

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Neon Docs:** https://neon.tech/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## Emergency Rollback

If something breaks:

1. **Render:** Click "Rollback to previous deploy"
2. **Netlify:** Go to Deploys → Click on previous deploy → "Publish deploy"
3. **Database:** Restore from Neon backup (if available)

