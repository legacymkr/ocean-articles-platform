# Environment Variables Configuration

## Required Environment Variables

### Database Configuration (Supabase)

#### DATABASE_URL (REQUIRED)
PostgreSQL connection string for your Supabase database.

**Format:**
```
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

**For your project:**
- Project URL: https://lszccbdufyaohdihzult.supabase.co
- Database Host: aws-1-us-east-2.pooler.supabase.com
- Port: 5432
- Database: postgres

**Where to find:**
1. Go to your Supabase project dashboard
2. Navigate to Project Settings → Database
3. Look for "Connection string" section
4. Use the "Connection pooling" string (with pgbouncer=true)

**Example:**
```
DATABASE_URL="postgresql://postgres.lszccbdufyaohdihzult:[YOUR_PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

#### DIRECT_DATABASE_URL (OPTIONAL)
Direct connection to the database (without pooling). Used for migrations.

**Format:**
```
DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-2.compute.amazonaws.com:5432/postgres"
```

**Note:** Use the direct connection string from Supabase (without pgbouncer).

---

### Email Configuration (Resend)

```env
RESEND_API_KEY="re_4s1dXKYU_5ZiTBTfAU5CSayqwu1Pv6mvc"
RESEND_NEWSLETTER_AUDIENCE_ID="78261eea-8f8b-4381-83c6-79fa7120f1cf"
```

**Required for:**
- Sending welcome emails to new admin users
- Article publication notifications
- Newsletter functionality
- Managing newsletter subscribers via Resend Audiences

**Setup:**
1. Sign up at [Resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Create an audience for newsletter subscribers
4. Add both the API key and audience ID to your environment variables

**Note:** The audience ID will be automatically created on first newsletter subscription if not provided, but it's recommended to set it up manually for better control.

---

### Application Configuration

#### NEXT_PUBLIC_APP_URL (REQUIRED)
The public URL where your application is deployed.

**For Railway deployment:**
```
NEXT_PUBLIC_APP_URL="https://ocean.galatide.com"
```

**For local development:**
```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

### Media Storage (Supabase Storage)

#### NEXT_PUBLIC_SUPABASE_URL (REQUIRED)
Your Supabase project URL.

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL="https://lszccbdufyaohdihzult.supabase.co"
```

#### NEXT_PUBLIC_SUPABASE_ANON_KEY (REQUIRED)
Your Supabase anonymous key for client-side operations.

**Where to find:**
1. Go to Supabase project dashboard
2. Navigate to Project Settings → API
3. Copy the "anon public" key

**Example:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Analytics (Optional)

#### NEXT_PUBLIC_GA_ID
Google Analytics tracking ID.

**Example:**
```
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

---

## Railway Deployment Setup

1. Go to your Railway project dashboard
2. Click on your service
3. Navigate to "Variables" tab
4. Add each environment variable listed above
5. Redeploy your service

### Important for Railway:
- DO NOT include quotes around values in Railway dashboard
- Railway automatically sets `PORT` - don't override it
- Railway provides `RAILWAY_ENVIRONMENT` automatically

---

## Troubleshooting Database Connection

### Error: "Can't reach database server"

**Possible causes:**
1. Incorrect DATABASE_URL format
2. Wrong password in connection string
3. Database is paused (Supabase free tier)
4. Network connectivity issues

**Solutions:**
1. Verify your DATABASE_URL matches the format above
2. Check your database password in Supabase dashboard
3. Ensure your Supabase project is not paused
4. Use the pooled connection string (with pgbouncer=true)
5. Check Railway logs for detailed error messages

### Supabase Connection Strings:

**Connection Pooling (Use this for DATABASE_URL):**
- URL: `aws-1-us-east-2.pooler.supabase.com`
- Port: `5432`
- Includes: `?pgbouncer=true`

**Direct Connection (Optional, for migrations):**
- URL: `aws-1-us-east-2.compute.amazonaws.com`
- Port: `5432`
- No pgbouncer parameter

---

## Testing Locally

Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="postgresql://postgres.lszccbdufyaohdihzult:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://lszccbdufyaohdihzult.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Email (Optional for local testing)
RESEND_API_KEY="your-resend-api-key-here"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="your-ga-id-here"
```

Then run:
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

## Security Notes

- ⚠️ NEVER commit `.env.local` or `.env` files to Git
- ⚠️ NEVER share your Supabase password or API keys publicly
- ✅ Use environment variables for ALL sensitive data
- ✅ Rotate API keys periodically for security
