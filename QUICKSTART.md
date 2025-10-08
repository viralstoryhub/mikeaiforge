# Quick Start Guide

## ✅ Your API Key
Your Gemini API key has been configured: `AIzaSyAHJXWzA89CR4ugjDgYLA3D-_ck6Mi62mY`

## 🚀 Start the Website (2 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Development Server
```bash
npm run dev
```

### Step 3: Open Your Browser
The website will automatically open at: **http://localhost:3000**

If it doesn't open automatically, manually navigate to `http://localhost:3000` in your browser.

## 🎯 What You Can Do Right Now

### Test the Website
1. **Browse AI Tools** - View the curated directory of 6 AI tools
2. **Try Utilities** - Test all 11 content creation utilities:
   - Titles/Hooks Generator
   - YouTube Chapters Generator
   - Caption Formatter
   - Thumbnail Prompt Generator
   - Thumbnail Tester
   - Video Clip Generator (Veo 2.0)
   - Video/Audio Transcriber
   - Content Repurposer
   - AI Thumbnail Generator (Pro)
   - AI Image Editor (Pro)
   - Live Presentation Coach (Pro)
3. **Explore Workflows** - Check out the 4 automation workflows
4. **Chat with AI** - Use the Gemini-powered chat interface

### Login Credentials (Mock Authentication)
- **Admin Account**: 
  - Email: `admin@example.com`
  - Password: `password`
- **Test User Account**:
  - Email: `test@example.com`
  - Password: `password`
- **Or create a new account** - Sign up with any email

## 📝 Current Setup

✅ **Working Now:**
- Frontend React application
- All AI utilities with Gemini API
- Mock authentication (localStorage-based)
- All UI features and components
- Chat interface
- Admin panel

⏳ **Not Yet Implemented (Optional for Production):**
- Real backend API server
- PostgreSQL database
- Real authentication with JWT
- Stripe payment integration
- Email notifications
- Analytics tracking

## 🔧 Next Steps (Optional)

If you want to set up the full production backend:

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL Database
- Install PostgreSQL 16+
- Create a database named `mikeaiforge`
- Update `backend/.env` with your database URL

### 3. Run Database Migrations
```bash
cd backend
npx prisma migrate dev
npm run seed
```

### 4. Start Backend Server
```bash
cd backend
npm run dev
```

### 5. Update Frontend to Use Backend
- Remove the temporary mock fallbacks in `services/authService.ts`
- Remove the environment variable fallback in `services/geminiService.ts`
- The frontend will automatically connect to `http://localhost:5000/api`

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### API Key Not Working
If you see "API Key not available" errors:
1. Check that `.env.local` exists in the root directory
2. Verify the API key is correct
3. Restart the development server (`Ctrl+C` then `npm run dev`)

### Dependencies Installation Failed
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- **Full README**: See `README.md` for complete project documentation
- **API Documentation**: See `docs/API.md` for backend API reference
- **Deployment Guide**: See `docs/DEPLOYMENT.md` for production deployment

## 💡 Tips

1. **Use Chrome DevTools** - Press F12 to see console logs and network requests
2. **Check the Console** - Any errors will appear in the browser console
3. **Hot Reload** - Changes to code will automatically refresh the browser
4. **Mock Data** - All user data is stored in localStorage (browser storage)
5. **Clear Data** - Open DevTools → Application → Local Storage → Clear All

## 🎉 You're All Set!

Your website is now running with full AI capabilities. Enjoy testing!