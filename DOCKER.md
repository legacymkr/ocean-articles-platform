# 🐳 Docker Deployment Guide

## Quick Start

### Build the Image
```bash
docker build -t galatide-ocean .
```

### Run the Container
```bash
docker run -d \
  --name galatide-ocean \
  -p 3000:3000 \
  -e DATABASE_URL="your_database_url_here" \
  -e NEXTAUTH_SECRET="your_secret_here" \
  galatide-ocean
```

## Environment Variables

Required environment variables for production:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

Optional environment variables:

```bash
RESEND_API_KEY=your-resend-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
GOOGLE_ANALYTICS_ID=your-ga-id
```

## Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/galatide
      - NEXTAUTH_SECRET=your-secret-here
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
    
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=galatide
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## Troubleshooting

### Build Issues

1. **Prisma generation fails**:
   - Ensure `prisma/schema.prisma` exists
   - Check that DATABASE_URL is set (dummy URL is used for build)

2. **Next.js build fails**:
   - Verify all source files are copied correctly
   - Check that `next.config.js` has `output: 'standalone'`

3. **Missing server.js**:
   - Ensure standalone output is enabled in `next.config.js`
   - Check build logs for errors

### Runtime Issues

1. **Container exits immediately**:
   - Check logs: `docker logs galatide-ocean`
   - Verify `server.js` exists in container

2. **Database connection fails**:
   - Ensure DATABASE_URL is correct
   - Check network connectivity to database

3. **Permission errors**:
   - Container runs as non-root user `nextjs`
   - Ensure file permissions are correct

## Health Check

The application includes a health check endpoint at `/api/health`.

Test with:
```bash
curl http://localhost:3000/api/health
```

## Performance

- Image size: ~150MB (optimized Alpine Linux)
- Memory usage: ~100MB (typical)
- Startup time: ~2-5 seconds

## Security

- Runs as non-root user
- Minimal Alpine Linux base image
- No unnecessary packages installed
- Environment variables for secrets
