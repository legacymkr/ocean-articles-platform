# Astroqua Database Setup

This guide will help you set up the database for the Astroqua project.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ installed and running

## Quick Setup

### Option 1: Using Docker (Recommended for Development)

1. **Start PostgreSQL with Docker:**

   ```bash
   docker run --name astroqua-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   ```

2. **Create the database:**

   ```bash
   docker exec -it astroqua-postgres createdb astroqua
   ```

3. **Update your .env file:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/astroqua?schema=public"
   ```

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL** on your system
2. **Create a database:**

   ```sql
   CREATE DATABASE astroqua;
   ```

3. **Update your .env file** with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/astroqua?schema=public"
   ```

## Database Migration and Seeding

Once your database is set up:

1. **Run the migration:**

   ```bash
   npm run prisma:migrate
   ```

2. **Seed the database with sample data:**
   ```bash
   npm run prisma:seed
   ```

## What Gets Created

The seed script will create:

- **7 Languages**: English, Arabic, Chinese, Russian, German, French, Hindi
- **1 Admin User**: admin@astroqua.com (password: admin123)
- **6 Tags**: Deep Sea, Space Exploration, Mystery, Research, Technology, Oceanography
- **3 Sample Articles**: With different types (VARIOUS, CLUSTER, SERIES)
- **3 Media Assets**: Placeholder images for articles

## Database Schema

The database includes the following models:

- **User**: Admin and editor accounts
- **Article**: Main article content with SEO fields
- **ArticleTranslation**: Multi-language article translations
- **Language**: Supported languages with RTL support
- **Tag**: Article categorization
- **ArticleTag**: Many-to-many relationship
- **MediaAsset**: Images, videos, and other media files

## Multi-Language Support

The system supports:

- **7 Languages**: English (default), Arabic, Chinese, Russian, German, French, Hindi
- **RTL Support**: Arabic and Hebrew are fully supported
- **SEO Optimization**: Each language has its own meta fields
- **Slug Generation**: Unique slugs per language

## Troubleshooting

### Common Issues

1. **Connection refused**: Make sure PostgreSQL is running
2. **Database doesn't exist**: Create the database manually
3. **Permission denied**: Check your PostgreSQL user permissions
4. **Migration fails**: Ensure your DATABASE_URL is correct

### Reset Database

To reset the database completely:

```bash
# Drop and recreate the database
docker exec -it astroqua-postgres dropdb astroqua
docker exec -it astroqua-postgres createdb astroqua

# Or if using local PostgreSQL
psql -c "DROP DATABASE astroqua;"
psql -c "CREATE DATABASE astroqua;"

# Then run migration and seed
npm run prisma:migrate
npm run prisma:seed
```

## Next Steps

After setting up the database:

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000` to see the site
3. The admin dashboard will be available at `/admin` (Phase 7)

## Support

If you encounter any issues, check:

- PostgreSQL is running
- Database credentials are correct
- Port 5432 is not blocked
- Node.js and npm are up to date
