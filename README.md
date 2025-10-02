# Mike's AI Forge 🚀

A production-ready AI-powered content creation platform built with React, TypeScript, and Google Gemini AI.

## 🌟 Features

- **AI Tools Directory**: Curated collection of 6+ AI tools with detailed reviews
- **Categorized Utilities**: Organized into SEO, Content Management, and SaaS experiences
- **Community Forum**: Full-featured discussions with categories, threads, and moderation tools
- **AI News Hub**: Curated AI news and tool updates with category filtering and featured highlights
- **Workflow Vault**: One-click automation workflows
- **AI Chat**: Powered by Gemini 2.5 Flash with streaming responses
- **User Dashboard**: Profile management, saved tools, custom personas
- **Admin Panel**: Complete administrative interface with analytics
- **Real-time Features**: Live presentation coaching with audio streaming
- **Multimodal AI**: Text, image, video, and audio generation

> These enhancements deliver a mind-blowing community-driven experience that keeps creators informed and connected.

## 🏗️ Tech Stack

### Frontend
- React 19.1.1 + TypeScript
- Vite 6.2.0
- React Router 7.9.2
- TailwindCSS
- Google GenAI SDK 1.20.0

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- Redis (caching & rate limiting)
- JWT Authentication
- Stripe Payments
- Prisma Models: ForumCategory, ForumThread, ForumPost, NewsArticle

### DevOps
- Docker + Docker Compose
- GitHub Actions CI/CD
- Vitest + Playwright (testing)
- ESLint + Prettier
- Sentry (error tracking)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Gemini API Key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mikeaiforge09292025
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Set up database**
Apply the latest Prisma migrations (including the forum/news updates).
```bash
cd backend
npx prisma migrate dev
npm run seed
```

5. **Run development servers**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

Visit `http://localhost:3000`

### Using Docker

```bash
docker-compose up
```

## 📚 Documentation

### Project Structure
```
mikeaiforge09292025/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation, etc.
│   │   ├── utils/        # Helpers
│   │   └── server.ts     # Entry point
│   └── prisma/           # Database schema
├── components/           # React components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── pages/                # Route pages
│   ├── ForumPage.tsx
│   ├── ForumCategoryPage.tsx
│   ├── ForumThreadPage.tsx
│   ├── NewsPage.tsx
│   └── NewsArticlePage.tsx
├── pages/admin/          # Admin console pages
│   ├── AdminForumPage.tsx
│   └── AdminNewsPage.tsx
├── services/             # API clients
│   ├── forumService.ts
│   └── newsService.ts
├── tests/                # Test files
└── App.tsx               # Main app component
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `POST /api/users/saved-tools` - Toggle saved tool
- `POST /api/users/utility-usage` - Record utility usage
- `POST /api/users/personas` - Create persona
- `PATCH /api/users/personas/:id` - Update persona
- `DELETE /api/users/personas/:id` - Delete persona

#### Forum
- `GET /api/forum/categories` - Fetch all forum categories with counts
- `GET /api/forum/categories/:categorySlug/threads` - Get paginated threads in a category
- `GET /api/forum/threads/:threadSlug` - Retrieve thread details and posts
- `POST /api/forum/threads` - Create a new thread (auth required)
- `PATCH /api/forum/threads/:threadId` - Update a thread (author or admin)
- `DELETE /api/forum/threads/:threadId` - Delete a thread (author or admin)
- `POST /api/forum/threads/:threadId/posts` - Reply to a thread (auth required)
- `PATCH /api/forum/posts/:postId` - Edit a post (author or admin)
- `DELETE /api/forum/posts/:postId` - Remove a post (author or admin)
- `PATCH /api/forum/threads/:threadId/pin` - Toggle pinned status (admin)
- `PATCH /api/forum/threads/:threadId/lock` - Toggle locked status (admin)

#### News
- `GET /api/news` - Fetch paginated news articles with optional filters
- `GET /api/news/featured` - Get featured news articles
- `GET /api/news/categories` - Retrieve news categories with counts
- `GET /api/news/:slug` - Fetch a single article by slug
- `POST /api/news` - Create a news article (admin only)
- `PATCH /api/news/:articleId` - Update a news article (admin only)
- `DELETE /api/news/:articleId` - Delete a news article (admin only)
- `PATCH /api/news/:articleId/featured` - Toggle featured status (admin only)

#### Payments
- `POST /api/stripe/create-checkout-session` - Create Stripe checkout
- `POST /api/stripe/create-portal-session` - Manage subscription
- `POST /api/stripe/webhook` - Stripe webhook handler

#### Admin
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get analytics data

### Testing

```bash
# Unit tests
npm test

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E UI mode
npm run test:e2e:ui
```

### Deployment

#### Production Build
```bash
npm run build
cd backend && npm run build
```

#### Environment Variables
See `.env.example` for all required variables.

#### Hosting Options
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, AWS, DigitalOcean
- **Database**: Supabase, Neon, AWS RDS

## 🧪 Testing

The project includes comprehensive testing:
- **Unit Tests**: Component and service tests with Vitest
- **Integration Tests**: API endpoint tests
- **E2E Tests**: Full user flow tests with Playwright
- **Coverage Target**: 80%+

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing
- Rate limiting (100 req/15min)
- CORS protection
- Helmet.js security headers
- Input validation with express-validator
- SQL injection prevention (Prisma)
- XSS protection

## 📊 Monitoring

- **Error Tracking**: Sentry
- **Analytics**: Google Analytics 4, Mixpanel
- **Logging**: Winston (backend), Console (frontend)
- **Performance**: Lighthouse CI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini AI for powerful AI capabilities
- React team for the amazing framework
- All open-source contributors

## 📧 Support

For support, email support@mikesaiforge.com or open an issue.
