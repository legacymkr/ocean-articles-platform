@echo off
echo ========================================
echo  FORCE NEW DEPLOYMENT WITH TIMESTAMP
echo ========================================
echo.

echo Step 1: Setting unique deployment variable...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%%dt:~4,2%%dt:~6,2%%dt:~8,2%%dt:~10,2%"
railway variables --set DEPLOYMENT_VERSION=v%timestamp%

echo.
echo Step 2: Deploying with unique timestamp...
railway up --detach

echo.
echo ========================================
echo  FORCED DEPLOYMENT WITH TIMESTAMP!
echo ========================================
echo.
echo Deployment version: v%timestamp%
echo This should force Railway to create a new deployment.
echo.
pause
