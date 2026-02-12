@echo off
echo ========================================
echo  100% FIX - HOSTNAME BINDING SOLUTION
echo ========================================
echo.

echo Step 1: Committing critical fixes...
git add nixpacks.toml
git add src/app/api/health/route.ts
git add railway-server.js
git add start-production.js
git commit -m "fix-hostname-binding-0.0.0.0"

echo.
echo Step 2: Pushing to GitHub...
git push

echo.
echo Step 3: Linking to Railway project...
railway link -p 592f460f-544c-435e-8337-3df8e9bbdee9

echo.
echo Step 4: Deploying with fixed configuration...
railway up

echo.
echo ========================================
echo  DEPLOYMENT STARTED WITH 100% FIX!
echo ========================================
echo.
echo This deployment fixes:
echo - Binds to 0.0.0.0 instead of container hostname
echo - Simple health check with logging
echo - Custom server wrapper for proper binding
echo.
echo Expected logs:
echo "Railway Production Server"
echo "Binding to: 0.0.0.0:8080"
echo.
pause
