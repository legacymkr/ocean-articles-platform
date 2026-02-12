@echo off
echo ========================================
echo  FINAL Railway Fix - NIXPACKS Override
echo ========================================
echo.

echo Step 1: Committing NIXPACKS override...
git add nixpacks.toml
git add railway.json
git add fix-database-url.bat
git commit -m "nixpacks-override-start-command"

echo.
echo Step 2: Pushing to GitHub...
git push

echo.
echo Step 3: Deploying to Railway...
railway up --detach

echo.
echo ========================================
echo  NIXPACKS Deployment Started!
echo ========================================
echo.
echo This deployment uses NIXPACKS start command override
echo to bypass package.json completely.
echo.
echo Expected logs:
echo "🚂 NIXPACKS Starting Railway deployment..."
echo "📍 PORT: 8080"
echo "🚀 Starting Next.js standalone server..."
echo.
pause
