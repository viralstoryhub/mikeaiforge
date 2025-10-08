# Google Analytics 4 Setup Guide

## Overview

Your Google Analytics property is set up (`507271558`), but the backend needs a **Service Account** to access the Google Analytics Data API. This guide will walk you through the complete setup.

---

## Current Status

✅ **Google Analytics Property Created**: `507271558` (mikesaiforge)  
❌ **Service Account Credentials**: Not configured  
❌ **Measurement ID**: Not set in environment variables  
❌ **API Access**: Not enabled

---

## Step-by-Step Setup

### Step 1: Get Your Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Under **Property**, click **Data Streams**
4. Click on your web data stream
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

**Example**: `G-ABC123DEF4`

---

### Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it: `mikesaiforge-analytics`
4. Click **Create**

---

### Step 3: Enable Google Analytics Data API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for: `Google Analytics Data API`
3. Click on it and click **Enable**

---

### Step 4: Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - **Service account name**: `mikesaiforge-analytics-reader`
   - **Service account ID**: (auto-generated)
   - **Description**: `Service account for reading Google Analytics data`
4. Click **Create and Continue**
5. **Grant this service account access to project**:
   - Role: `Viewer`
   - Click **Continue**
6. Click **Done**

---

### Step 5: Create and Download Service Account Key

1. In **Credentials**, find your service account
2. Click on the service account email
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key**
5. Choose **JSON** format
6. Click **Create**
7. **Save the downloaded JSON file** - This is your credentials file!

---

### Step 6: Grant Service Account Access to Google Analytics

1. Go back to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon)
3. Under **Property**, click **Property Access Management**
4. Click **+** (Add users)
5. Enter the **service account email** (looks like: `mikesaiforge-analytics-reader@project-id.iam.gserviceaccount.com`)
6. Select role: **Viewer**
7. Uncheck **Notify new users by email**
8. Click **Add**

---

### Step 7: Add Credentials to Your Project

1. **Rename** the downloaded JSON file to: `google-analytics-credentials.json`
2. **Move** it to your backend folder:
   ```
   backend/google-analytics-credentials.json
   ```

**⚠️ IMPORTANT**: Add this file to `.gitignore` to keep it secure!

---

### Step 8: Update Environment Variables

#### Backend Environment (`backend/.env`)

```env
# Google Analytics Data API
GOOGLE_ANALYTICS_PROPERTY_ID=507271558
GOOGLE_ANALYTICS_CREDENTIALS_PATH=./google-analytics-credentials.json

# Google Analytics Measurement Protocol (for event tracking)
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID
GOOGLE_ANALYTICS_API_SECRET=your_api_secret_here
```

#### Frontend Environment (`.env`)

```env
# Google Analytics Measurement ID (for frontend tracking)
VITE_GA_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID
```

---

### Step 9: Get API Secret for Measurement Protocol (Optional)

This allows the backend to send events to Google Analytics:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** → **Data Streams**
3. Click on your web data stream
4. Scroll down to **Measurement Protocol API secrets**
5. Click **Create**
6. Name it: `Backend API Secret`
7. Click **Create**
8. Copy the **Secret value**
9. Add it to `backend/.env` as `GOOGLE_ANALYTICS_API_SECRET`

---

### Step 10: Restart Backend Server

```bash
cd backend
npm run dev
```

The backend should now connect to Google Analytics successfully!

---

## Verification

### Test the API Connection

```bash
curl http://localhost:3000/api/analytics/google-analytics?type=overview&startDate=2025-09-01&endDate=2025-10-07
```

**Expected Response**: JSON with analytics data (users, sessions, pageViews, etc.)

**Error Response**: If you see an error, check:
1. Service account has access to GA property
2. Credentials file path is correct
3. Property ID is correct
4. Google Analytics Data API is enabled

---

## Troubleshooting

### Error: "Google Analytics property ID is not configured"
**Solution**: Set `GOOGLE_ANALYTICS_PROPERTY_ID=507271558` in `backend/.env`

### Error: "Google Analytics credentials path is not configured"
**Solution**: Set `GOOGLE_ANALYTICS_CREDENTIALS_PATH=./google-analytics-credentials.json` in `backend/.env`

### Error: "Google Analytics credentials file not found"
**Solution**: 
1. Make sure the JSON file is in the `backend/` folder
2. Check the file name matches exactly: `google-analytics-credentials.json`
3. Verify the path in `.env` is correct

### Error: "Permission denied" or "User does not have sufficient permissions"
**Solution**: 
1. Go to Google Analytics → Admin → Property Access Management
2. Make sure the service account email is added with **Viewer** role
3. Wait 5-10 minutes for permissions to propagate

### Error: "API has not been used in project"
**Solution**: 
1. Go to Google Cloud Console
2. Enable the **Google Analytics Data API**
3. Wait a few minutes and try again

### No data showing in dashboard
**Possible causes**:
1. **No traffic yet**: Your website needs actual visitors for data to appear
2. **Tracking not installed**: Make sure GA4 tracking code is on your website
3. **Recent setup**: Data can take 24-48 hours to appear in reports

---

## Security Best Practices

### 1. Add to `.gitignore`

Make sure your credentials file is NOT committed to git:

```bash
# Add to .gitignore
backend/google-analytics-credentials.json
```

### 2. Use Environment Variables

Never hardcode credentials in your code. Always use environment variables.

### 3. Limit Service Account Permissions

Only grant **Viewer** role - the service account only needs read access.

### 4. Rotate Keys Regularly

Consider rotating service account keys every 90 days for security.

---

## Alternative: Use Environment Variables for Credentials

If you don't want to use a JSON file, you can set the credentials as an environment variable:

```bash
# In backend/.env
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

Then update the analytics controller to read from this variable instead of a file.

---

## What You'll See in the Dashboard

Once configured, your admin analytics page will show:

### Overview Tab
- Total Users
- Sessions
- Page Views
- Average Session Duration
- Bounce Rate
- Daily Trend Chart
- Top Pages

### Realtime Tab
- Active Users (right now)
- Active Pages
- Recent Events

### Engagement Tab
- Events Per Session
- Engaged Sessions
- Events Breakdown
- Session Duration Buckets

### Acquisition Tab
- Traffic by Source
- Traffic by Medium
- Traffic by Country
- Campaign Performance

---

## Summary

**Required Files**:
1. ✅ `backend/google-analytics-credentials.json` - Service account key
2. ✅ `backend/.env` - Property ID and credentials path
3. ✅ `.env` - Measurement ID for frontend

**Required Setup**:
1. ✅ Google Cloud Project created
2. ✅ Google Analytics Data API enabled
3. ✅ Service Account created with JSON key
4. ✅ Service Account added to GA property with Viewer role
5. ✅ Environment variables configured

**Once complete**, restart your backend and the Google Analytics dashboard will work! 🎉

---

## Need Help?

If you're still having issues:
1. Check the backend logs for specific error messages
2. Verify all steps above are completed
3. Make sure the service account email is exactly as shown in the JSON file
4. Wait 5-10 minutes after adding the service account to GA property

---

**Your Property ID**: `507271558`  
**Your Property Name**: `mikesaiforge`  
**Service Account Email**: (will be in your downloaded JSON file)

