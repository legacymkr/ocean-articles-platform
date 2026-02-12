@echo off
echo ========================================
echo  Railway Deployment - Final Fix
echo ========================================
echo.

echo Step 1: Committing package.json fix...
git add package.json
git commit -m "fix-railway-start-script"

echo.
echo Step 2: Deploying to Railway...
railway up --detach

echo.
echo ========================================
echo  Deployment Started!
echo ========================================
echo.
echo The deployment will take 2-3 minutes.
echo Check Railway dashboard for progress.
echo.
pause
