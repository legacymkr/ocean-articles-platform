# Supabase Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"

### Step 2: Create Project

- **Project name**: `astroqua-ocean`
- **Database password**: Choose a strong password (save it!)
- **Region**: Choose closest to you
- Click "Create new project"

### Step 3: Get Connection String

1. Go to **Settings** → **Database**
2. Scroll down to "Connection string"
3. Copy the **URI** (starts with `postgresql://`)

### Step 4: Create .env File

Create a `.env` file in your project root with:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Email (optional for now)
RESEND_API_KEY="your_resend_api_key_here"

# Uploadthing (optional for now)
UPLOADTHING_SECRET="your_uploadthing_secret_here"
UPLOADTHING_APP_ID="your_uploadthing_app_id_here"

# NextAuth (optional for now)
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 5: Run Database Setup

```bash
# Install dependencies (if not already done)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

### Step 6: Test the Setup

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3001` - you should now see real articles from the database!

## What Gets Created

The seed script will create:

- **7 Languages**: English, Arabic, Chinese, Russian, German, French, Hindi
- **1 Admin User**: admin@astroqua.com (password: admin123)
- **6 Tags**: Deep Sea, Space Exploration, Mystery, Research, Technology, Oceanography
- **3 Sample Articles**: With different types (VARIOUS, CLUSTER, SERIES)
- **3 Media Assets**: Placeholder images for articles

## Admin Dashboard

After setup, you can:

1. Visit `http://localhost:3001/admin`
2. Login with: `admin@astroqua.com` / `admin123`
3. Create, edit, and publish articles
4. See them appear on the website immediately!

## Troubleshooting

### Common Issues:

1. **Connection refused**: Check your DATABASE_URL is correct
2. **Migration fails**: Make sure your password doesn't contain special characters
3. **Seed fails**: Run `npx prisma generate` first

### Reset Database:

```bash
# Reset everything
npx prisma migrate reset
npx prisma db seed
```

## Supabase Dashboard

You can also manage your data through the Supabase dashboard:

1. Go to your project
2. Click "Table Editor" to see your data
3. Click "SQL Editor" to run custom queries

## Free Tier Limits

Supabase free tier includes:

- 500MB database storage
- 2GB bandwidth
- 50,000 monthly active users
- Perfect for development and small projects!

---

**Need help?** Check the [Supabase documentation](https://supabase.com/docs) or create an issue in this repository.
