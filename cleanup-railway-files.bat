@echo off
echo Cleaning up unused Railway configuration files...

if exist "scripts\railway-build.sh" (
    del "scripts\railway-build.sh"
    echo Deleted: scripts\railway-build.sh
)

if exist "scripts\railway-start.sh" (
    del "scripts\railway-start.sh"
    echo Deleted: scripts\railway-start.sh
)

if exist "fix-railway-db.js" (
    del "fix-railway-db.js"
    echo Deleted: fix-railway-db.js
)

echo.
echo Cleanup complete!
echo.
echo Remaining Railway files (ACTIVE):
echo - railway.json (main config)
echo - nixpacks.toml (build config)
echo - set-railway-env.bat (env setup)
echo - package.json (railway scripts)
echo - src\app\api\health\route.ts (health check)
echo.
pause
