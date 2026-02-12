@echo off
echo ========================================
echo  MOST BASIC HEALTH CHECK - JUST "OK"
echo ========================================
echo.

echo Step 1: Committing basic health check...
git add src/app/api/health/route.ts
git commit -m "most-basic-health-check-just-ok"

echo.
echo Step 2: Pushing to GitHub...
git push

echo.
echo Step 3: Deploying to Railway...
railway up --detach

echo.
echo ========================================
echo  BASIC HEALTH CHECK DEPLOYED!
echo ========================================
echo.
echo This health check just returns "OK" text
echo No JSON, no database, no complexity.
echo.
pause
