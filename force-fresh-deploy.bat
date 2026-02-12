@echo off
echo ========================================
echo  FORCE FRESH DEPLOYMENT - NO CACHE
echo ========================================
echo.

echo Step 1: Committing NIXPACKS override...
git add nixpacks.toml
git add package.json
git commit -m "force-nixpacks-override-no-cache"

echo.
echo Step 2: Pushing to GitHub...
git push

echo.
echo Step 3: Force deploying to Railway...
railway up

echo.
echo ========================================
echo  FORCED DEPLOYMENT STARTED!
echo ========================================
echo.
echo This deployment:
echo - Uses NIXPACKS_NO_CACHE=1
echo - Removes railway-start from package.json
echo - Forces NIXPACKS start command override
echo.
echo Expected logs:
echo "🚂 NIXPACKS OVERRIDE Starting Railway deployment..."
echo "📍 PORT: 8080"
echo "🚀 Starting Next.js standalone server..."
echo.
pause
