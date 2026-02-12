# 🚀 Astroqua Ocean Platform - Deployment Guide

This guide covers deploying the Astroqua Ocean Articles Platform to production.

## 📋 Prerequisites

- [Supabase](https://supabase.com) account and project
- [Vercel](https://vercel.com) account (recommended) or your preferred hosting platform
- Node.js 18+ installed locally
- Git repository set up

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and fill project details:
   - **Name**: `astroqua-ocean-platform`
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users
4. Wait for project creation (2-3 minutes)

### 2. Get Database Connection

1. In your Supabase project dashboard:
   - Go to **Settings** → **Database**
   - Copy the **Connection string** from "Connection pooling"
   - Replace `[YOUR-PASSWORD]` with your database password

### 3. Configure Environment Variables

Copy `env.example` to `.env` and fill in the values:

```bash
cp env.example .env
```

**Required variables:**
```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Update for production
NEXTAUTH_SECRET="[GENERATE_RANDOM_STRING]"
```

### 4. Initialize Database

Run the setup commands:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed with initial data
npm run seed
```

## 🌐 Vercel Deployment

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select **Framework Preset**: Next.js

### 2. Configure Environment Variables

In Vercel project settings, add these environment variables:

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
NEXTAUTH_SECRET=[GENERATE_32_CHAR_STRING]
NEXT_PUBLIC_APP_URL=https://[YOUR_VERCEL_URL].vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
NODE_ENV=production
```

### 3. Build Configuration

Vercel will automatically detect the build configuration from `vercel.json`.

**Build Command**: `npm run vercel-build`
**Output Directory**: `.next` (default)

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for build completion
3. Visit your deployment URL

## 🔧 Local Development Setup

### 1. Clone and Install

```bash
git clone [YOUR_REPO_URL]
cd astroqua-ocean-platform
npm install
```

### 2. Environment Setup

```bash
cp env.example .env
# Fill in your environment variables
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Health Checks

The platform includes a health check endpoint:

```bash
GET /api/health
```

Returns:
- Application status
- Database connectivity
- Service health

## 🌍 Multi-Language Considerations

### URL Structure
- English (default): `https://yourdomain.com/articles/slug`
- Other languages: `https://yourdomain.com/ar/articles/slug`

### SEO Configuration
- Each language has independent meta tags
- Proper `hreflang` tags for language versions
- Language-specific sitemaps

## 🔐 Security Checklist

- [ ] Database passwords are secure (20+ characters)
- [ ] `NEXTAUTH_SECRET` is randomly generated
- [ ] Service role keys are kept secret
- [ ] Environment variables are not committed to Git
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured

## 📈 Performance Optimization

### Database
- Connection pooling enabled via Supabase
- Prisma query optimization
- Proper indexing on frequently queried fields

### Frontend
- Image optimization with Next.js
- Code splitting with dynamic imports
- Font loading optimization
- Reduced motion support

### Caching
- Static generation for article pages
- API route caching where appropriate
- CDN edge caching via Vercel

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors:**
1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active
3. Ensure password doesn't contain special characters that need encoding

**Build Failures:**
1. Run `npm run type-check` locally
2. Check all environment variables are set
3. Verify Prisma schema is valid

**Translation Issues:**
1. Ensure languages are properly seeded
2. Check language codes match URL structure
3. Verify translation API endpoints are working

### Debug Commands

```bash
# Check database connection
npm run deploy:check

# Test migrations
npm run deploy:migrate

# Verify seeding
npm run deploy:seed

# Type checking
npm run type-check
```

## 📞 Support

For deployment issues:
1. Check the [troubleshooting section](#troubleshooting)
2. Verify environment variables
3. Review build logs in Vercel dashboard
4. Check Supabase project health

## 🎉 Post-Deployment

After successful deployment:

1. **Test Core Functionality:**
   - [ ] Article creation and publishing
   - [ ] Translation system
   - [ ] Language switching
   - [ ] Admin dashboard access

2. **Configure Analytics** (Optional):
   - Set up Google Analytics
   - Configure error monitoring
   - Set up uptime monitoring

3. **Content Management:**
   - Access admin panel at `/admin`
   - Create your first articles
   - Add translations for multiple languages
   - Configure tags and categories

Your Astroqua Ocean Platform is now ready to explore the digital depths! 🌊
