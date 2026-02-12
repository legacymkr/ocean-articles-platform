@echo off
echo ========================================
echo  Ultra-Simple Health Check Fix
echo ========================================
echo.

echo Step 1: Committing simple health check...
git add src/app/api/health/route.ts
git commit -m "ultra-simple-health-check"

echo.
echo Step 2: Pushing to GitHub...
git push

echo.
echo Step 3: Deploying to Railway...
railway up --detach

echo.
echo ========================================
echo  Simple Health Check Deployed!
echo ========================================
echo.
echo This health check has NO database calls
echo and should always return 200.
echo.
pause
