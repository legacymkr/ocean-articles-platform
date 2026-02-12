# Railway Configuration Files Status

## ✅ ACTIVE FILES (Keep These):

### 1. `railway.json` ✅
**Purpose**: Main Railway deployment configuration
**Status**: ACTIVE - Used by Railway
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### 2. `nixpacks.toml` ✅
**Purpose**: NIXPACKS build configuration
**Status**: ACTIVE - Used by Railway's NIXPACKS builder
```toml
[phases.install]
cmds = ["npm ci --omit=dev --prefer-offline"]

[phases.build]
cmds = ["npx prisma generate", "npx next build"]

[start]
cmd = "node .next/standalone/server.js"

[variables]
NODE_ENV = "production"
```

### 3. `set-railway-env.bat` ✅
**Purpose**: Windows script to set Railway environment variables
**Status**: ACTIVE - Used for initial environment setup
**Usage**: Run once to configure Railway environment variables

### 4. `package.json` (railway scripts) ✅
**Purpose**: NPM scripts for Railway deployment
**Status**: ACTIVE - Used by NIXPACKS
```json
{
  "railway-build": "npm ci --omit=dev --prefer-offline && npx prisma generate && npx next build",
  "railway-start": "node .next/standalone/server.js"
}
```

### 5. `src/app/api/health/route.ts` ✅
**Purpose**: Health check endpoint for Railway
**Status**: ACTIVE - Fixed to return 200 when database is connected
**Endpoint**: `/api/health`

## ⚠️ UNUSED/DUPLICATE FILES (Can be removed):

### 1. `scripts/railway-build.sh` ❌
**Status**: UNUSED - Duplicate of nixpacks.toml build commands
**Reason**: NIXPACKS uses `nixpacks.toml`, not shell scripts
**Action**: Can be deleted

### 2. `scripts/railway-start.sh` ❌
**Status**: UNUSED - Duplicate and uses wrong command (`npx next start`)
**Reason**: NIXPACKS uses `nixpacks.toml` start command
**Action**: Can be deleted

### 3. `railway.env` ⚠️
**Status**: REFERENCE ONLY - Not used by Railway
**Reason**: Environment variables should be set via Railway CLI or dashboard
**Action**: Keep as reference, but Railway doesn't read this file

### 4. `fix-railway-db.js` ❌
**Status**: EMPTY FILE
**Action**: Can be deleted

## 📋 DEPLOYMENT CONFIGURATION SUMMARY:

### Build Process:
1. Railway detects `railway.json` → Uses NIXPACKS builder
2. NIXPACKS reads `nixpacks.toml` → Runs install and build commands
3. Build: `npm ci --omit=dev` → `npx prisma generate` → `npx next build`
4. Start: `node .next/standalone/server.js`

### Health Check:
- **Endpoint**: `/api/health`
- **Timeout**: 60 seconds
- **Behavior**: Returns 200 if database is connected (even if needs seeding)
- **Failure**: Only returns 503 if database connection completely fails

### Environment Variables:
- Set via `set-railway-env.bat` (first time only)
- Or set via Railway dashboard/CLI
- Includes: DATABASE_URL, DIRECT_URL, all NEXT_PUBLIC_* vars, API keys

## 🚀 DEPLOYMENT WORKFLOW:

### First Time Setup:
```bash
railway login
set-railway-env.bat  # Windows
railway up
```

### Subsequent Deployments:
```bash
railway up
```

## ✅ HEALTH CHECK FIX:

**Problem**: Railway health check was failing because `/api/health` returned 503 when database needed seeding.

**Solution**: Modified health check logic to:
- Return **200** if database is connected (healthy, needs-seeding, or configured)
- Return **503** only if database connection completely fails (error or unavailable)

This allows Railway deployment to succeed even if the database hasn't been seeded yet.
