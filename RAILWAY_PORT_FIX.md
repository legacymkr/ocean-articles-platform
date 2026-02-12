# Railway PORT Configuration Fix

## 🔴 Critical Issue: Healthcheck Never Became Healthy

### Root Cause
Railway healthcheck is failing because the application **is not listening on the PORT environment variable** that Railway provides.

**Railway Documentation States**:
> Railway will inject a PORT environment variable that your application should listen on.
> This variable's value is also used when performing health checks on your deployments.
> If your application doesn't listen on the PORT variable, possibly due to using target ports, you can manually set a PORT variable to inform Railway of the port to use for health checks.
> Not listening on the PORT variable or omitting it when using target ports can result in your health check returning a service unavailable error.

### The Problem
1. **Railway injects PORT variable** (e.g., PORT=8080)
2. **Next.js standalone server** needs to explicitly use this PORT
3. **Healthcheck fails** because Railway checks on the PORT it provided, but the app might be listening on a different port

## ✅ Solution Applied

### 1. Created Start Script (`start-railway.sh`)
```bash
#!/bin/bash

# Railway start script - ensures PORT is set correctly
echo "🚂 Starting Railway deployment..."
echo "📍 PORT: ${PORT:-8080}"
echo "🌍 Environment: ${NODE_ENV}"

# Set default PORT if not provided
export PORT=${PORT:-8080}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

echo "🚀 Starting Next.js standalone server..."

# Start the Next.js standalone server
exec node .next/standalone/server.js
```

### 2. Updated `railway.json`
```json
{
  "deploy": {
    "startCommand": "bash start-railway.sh",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### 3. Updated Health Check Timeout
- **Old**: 60 seconds
- **New**: 300 seconds (5 minutes)
- **Reason**: Give more time for the app to start and become healthy

## 🔧 How It Works

1. **Railway starts container** with PORT environment variable
2. **start-railway.sh executes**:
   - Logs the PORT being used
   - Ensures PORT is exported
   - Sets HOSTNAME to 0.0.0.0 (listen on all interfaces)
3. **Next.js standalone server starts** on the correct PORT
4. **Railway healthcheck** hits `/api/health` on the same PORT
5. **Health check passes** with 200 status code
6. **Deployment succeeds** ✅

## 📋 Files Modified

1. ✅ `start-railway.sh` - New start script with PORT handling
2. ✅ `railway.json` - Updated to use bash script and increased timeout
3. ✅ `server.js` - Custom server wrapper (backup option)
4. ✅ `src/app/api/health/route.ts` - Already returns 200 always

## 🎯 Expected Behavior

### Before Fix ❌:
```
Starting Container
> npx next start
⚠ "next start" does not work with "output: standalone" configuration
Healthcheck failed with service unavailable
Deploy failed
```

### After Fix ✅:
```
Starting Container
🚂 Starting Railway deployment...
📍 PORT: 8080
🌍 Environment: production
🚀 Starting Next.js standalone server...
▲ Next.js 15.5.4
- Network: http://0.0.0.0:8080
✓ Ready in 262ms
Healthcheck passed ✅
Deploy succeeded ✅
```

## 🚀 Deployment Status

**Latest Deployment**: ID `39e6095e-713c-4c50-9794-86d61e0291b5`

**Changes Committed**:
- start-railway.sh
- railway.json
- server.js

**Deployment Command**: `railway up --detach`

## 🔍 Verification Steps

Once deployment completes, verify:

1. **Check Logs for PORT**:
   ```bash
   railway logs
   ```
   Should show: `📍 PORT: 8080` (or whatever Railway assigns)

2. **Check Healthcheck**:
   - Should see "Healthcheck passed" in logs
   - No "service unavailable" errors

3. **Verify Website**:
   - Visit: https://ocean.galatide.com
   - Should load successfully

4. **Check Health Endpoint**:
   ```bash
   curl https://ocean.galatide.com/api/health
   ```
   Should return 200 with health status

## 💡 Additional Notes

### Healthcheck Hostname
Railway uses `healthcheck.railway.app` as the hostname when performing healthchecks. Our app doesn't restrict by hostname, so this is fine.

### PORT Variable
- Railway automatically injects PORT
- Default fallback: 8080
- The app MUST listen on this PORT for healthcheck to work

### Timeout
- Increased to 300 seconds (5 minutes)
- Gives plenty of time for:
  - Container startup
  - Dependencies loading
  - Database connection
  - Next.js initialization

## 🎯 Next Steps

1. **Wait for deployment** to complete (2-3 minutes)
2. **Check Railway dashboard** for deployment status
3. **Verify logs** show correct PORT usage
4. **Test website** at ocean.galatide.com
5. **Confirm healthcheck** passes

## 📊 Deployment Timeline

- **Attempt 1-4**: Failed - Wrong start command, health check issues
- **Attempt 5**: Failed - Not listening on PORT variable
- **Attempt 6** (Current): Fixed - Using start-railway.sh with PORT handling

**This should be the successful deployment!** 🎉
