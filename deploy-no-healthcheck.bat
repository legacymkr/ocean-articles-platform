@echo off
echo ========================================
echo  DEPLOY WITHOUT HEALTH CHECK
echo ========================================
echo.

echo Step 1: Committing no health check config...
git add src/app/api/health/route.ts
git add railway.json
git commit -m "disable-healthcheck-test-nixpacks"

echo.
echo Step 2: Pushing to GitHub...
git push

echo.
echo Step 3: Deploying to Railway WITHOUT health check...
railway up --detach

echo.
echo ========================================
echo  NO HEALTH CHECK DEPLOYMENT!
echo ========================================
echo.
echo This deployment has NO health check
echo so it should succeed if NIXPACKS works.
echo.
echo If this succeeds, we know NIXPACKS is working
echo and the issue is with the health check endpoint.
echo.
pause
