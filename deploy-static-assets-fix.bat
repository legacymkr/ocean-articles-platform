
@echo off
echo ========================================
echo  STATIC ASSETS FIX - DEPLOYMENT
echo ========================================
echo.

echo Step 1: Committing static assets fix...
git add next.config.js
git add railway-server.js
git add nixpacks.toml
git commit -m "fix-static-assets-serving-mime-types"

echo.
echo Step 2: Pushing to GitHub...
git push

echo.
echo Step 3: Linking to Railway project...
railway link -p 592f460f-544c-435e-8337-3df8e9bbdee9

echo.
echo Step 4: Deploying with fixed static asset serving...
railway up

echo.
echo ========================================
echo  STATIC ASSETS FIX DEPLOYED!
echo ========================================
echo.
echo This deployment fixes:
echo - CSS files now served with correct MIME type (text/css)
echo - JavaScript files served with correct MIME type (application/javascript)
echo - All static assets (_next/static/) properly served
echo - Removed standalone output that was causing issues
echo - Next.js handles static assets automatically
echo.
echo Expected result:
echo - Website should display with full styling and animations
echo - No more 404 errors for static assets
echo - No more MIME type errors in console
echo.
pause
