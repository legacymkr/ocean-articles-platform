$env:DATABASE_URL="postgresql://postgres.lszccbdufyaohdihzult:gyP8HpDNfSTGnbvW@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
Write-Host "DATABASE_URL set to: $env:DATABASE_URL"
npm run dev
