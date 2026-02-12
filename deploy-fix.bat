@echo off
echo Committing PORT fix...
git add railway.json
git add start-railway.sh
git add server.js
git commit -m "fix-port-configuration"
echo.
echo Deploying to Railway...
railway up --detach
echo.
echo Deployment started! Check Railway dashboard for status.
pause
