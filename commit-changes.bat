@echo off
git add railway.json
git add nixpacks.toml
git add src\app\api\health\route.ts
git add RAILWAY_DEPLOYMENT_ISSUE.md
git commit -m "fix-railway-deployment"
echo.
echo Changes committed! Now run: railway up
pause
