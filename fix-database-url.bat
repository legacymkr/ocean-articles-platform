@echo off
echo Fixing DATABASE_URL with connection pooling...
railway variables --set "DATABASE_URL=postgresql://postgres.lszccbdufyaohdihzult:gyP8HpDNfSTGnbvW@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1"
echo.
echo DATABASE_URL updated!
pause
