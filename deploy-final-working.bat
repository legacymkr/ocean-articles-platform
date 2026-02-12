@echo off
echo ========================================
echo  FINAL WORKING DEPLOYMENT
echo ========================================
echo.

echo Step 1: Committing working configuration...
git add railway.json
git commit -m "final-working-nixpacks-with-healthcheck"

echo.
echo Step 2: Pushing to GitHub...
git push

echo.
echo Step 3: Deploying final working version...
railway up --detach

echo.
echo ========================================
echo  FINAL DEPLOYMENT STARTED!
echo ========================================
echo.
echo This deployment has:
echo - NIXPACKS override (working)
echo - Simple health check (working)
echo - Correct PORT configuration
echo.
echo Expected result: SUCCESS!
echo.
pause
