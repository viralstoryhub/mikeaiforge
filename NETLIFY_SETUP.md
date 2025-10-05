# Netlify Configuration Guide

This document explains how to configure environment variables on Netlify to ensure the frontend connects to the backend API correctly.

## Environment Variables Setup

### Step 1: Access Netlify Site Settings

1. Log in to your Netlify account
2. Navigate to your site (e.g., `mikesaiforge`)
3. Go to **Site settings** → **Build & deploy** → **Environment**

### Step 2: Add Environment Variables

Add the following environment variable:

#### Required Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_API_BASE_URL` | `https://mikeaiforge-backend.onrender.com/api` | Backend API endpoint (must include `/api` path) |

#### Optional Variables

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics measurement ID |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable key for payments |

### Step 3: Trigger a Redeploy

After adding/updating environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete

## Verification

### Local Development

1. Open your browser's Developer Tools (F12)
2. Go to the **Network** tab
3. Navigate to `http://localhost:5174` (or your dev port)
4. Verify requests go to `http://localhost:5001/api/...` and return status 200

### Production (Netlify)

1. After deployment completes, open your Netlify site
2. Open Developer Tools → **Network** tab
3. Hard refresh the page (Ctrl/Cmd + Shift + R)
4. Verify requests go to `https://mikeaiforge-backend.onrender.com/api/...` and return status 200

### Direct API Test

You can test the backend API directly in your browser:

- **Development**: `http://localhost:5001/api/news?page=1&limit=1`
- **Production**: `https://mikeaiforge-backend.onrender.com/api/news?page=1&limit=1`

Both should return JSON data.

## Troubleshooting

### Issue: Requests timing out or failing

**Solution**: 
- Ensure `VITE_API_BASE_URL` includes the `/api` path
- Verify the backend is running and accessible
- Check CORS settings on the backend allow your frontend origin

### Issue: 404 errors on API calls

**Solution**:
- Double-check the `VITE_API_BASE_URL` value
- Ensure there are no trailing slashes in the environment variable
- Verify the backend routes are correctly configured

### Issue: Changes not taking effect

**Solution**:
1. Clear your browser cache
2. Hard refresh (Ctrl/Cmd + Shift + R)
3. Verify environment variables are set correctly in Netlify
4. Trigger a new deployment after making changes

## Architecture Overview

```
Frontend (Netlify)
    ↓
    Uses VITE_API_BASE_URL from environment
    ↓
API Client (axios)
    ↓
    Makes requests to: VITE_API_BASE_URL + endpoint
    ↓
Backend (Render)
    https://mikeaiforge-backend.onrender.com/api
```

## Important Notes

- **Always include `/api` in the `VITE_API_BASE_URL`** - the axios client no longer adds it automatically
- Environment variables prefixed with `VITE_` are exposed to the browser
- Changes to environment variables require a new deployment to take effect
- The homepage uses `Promise.allSettled()` to gracefully handle API failures and will render even if some sections fail to load
