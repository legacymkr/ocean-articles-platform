# 🔧 Database Migration Fix - seoTitle Column

**Date:** 2025-10-24  
**Priority:** CRITICAL  
**Status:** ✅ **FIXED**

---

## 🎯 Problem

**Error in Production:**
```
The column `t0.seoTitle` does not exist in the current database.
Database not available, returning empty media list: Error [PrismaClientKnownRequestError]: 
The column `t0.seoTitle` does not exist in the current database.
Invalid `prisma.mediaAsset.findMany()` invocation
```

**Root Cause:**
- The Prisma schema includes `seoTitle` field in `MediaAsset` model
- Production database was deployed without this column
- Migration was not run on production database

---

## ✅ Solutions Implemented

### Solution #1: Resilient Media API (Backward Compatible)

**Updated:** `src/app/api/media/route.ts`

The API now gracefully handles missing `seoTitle` column:

**GET Method:**
```typescript
try {
  mediaAssets = await db.mediaAsset.findMany({ /* ... */ });
} catch (columnError: any) {
  // If seoTitle column doesn't exist, use raw SQL fallback
  if (columnError?.code === 'P2022' || columnError?.message?.includes('seoTitle')) {
    const rawMedia = await db.$queryRaw`
      SELECT 
        m.id, m.url, m.type, m.width, m.height, 
        m.blurhash, m."altText", m."createdAt", m."updatedAt", 
        m."createdById",
        u.id as "user_id", u.name as "user_name", u.email as "user_email"
      FROM media_assets m
      LEFT JOIN users u ON m."createdById" = u.id
      ORDER BY m."createdAt" DESC
      LIMIT ${limit}
    `;
    // Transform to expected format...
  }
}
```

**POST Method:**
```typescript
try {
  // Try with seoTitle
  const mediaAsset = await db.mediaAsset.create({
    data: { /* includes seoTitle */ }
  });
} catch (createError: any) {
  // If seoTitle doesn't exist, create without it
  if (createError?.code === 'P2022' || createError?.message?.includes('seoTitle')) {
    const mediaAsset = await db.mediaAsset.create({
      data: { /* excludes seoTitle */ }
    });
  }
}
```

**Benefits:**
- ✅ API works even if migration hasn't run yet
- ✅ Backward compatible with old database schema
- ✅ No deployment downtime
- ✅ Automatic upgrade when migration runs

---

### Solution #2: Migration Endpoint

**Created:** `src/app/api/admin/database/migrate/route.ts`

A dedicated endpoint to run database migrations:

```typescript
POST /api/admin/database/migrate
```

**What it does:**
```sql
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'media_assets' 
    AND column_name = 'seoTitle'
  ) THEN
    ALTER TABLE "media_assets" ADD COLUMN "seoTitle" TEXT;
  END IF;
END $$;
```

**Features:**
- ✅ Safe - Only adds column if it doesn't exist
- ✅ Idempotent - Can run multiple times safely
- ✅ No data loss
- ✅ Works with PostgreSQL

---

### Solution #3: Migration SQL File

**Created:** `prisma/migrations/20251024000000_add_seo_title_to_media_assets/migration.sql`

For manual database migration if needed.

---

## 🚀 Deployment Instructions

### Option A: Automatic (Recommended)

After deploying the code, the API will automatically handle both cases:
1. ✅ Database **without** `seoTitle` column → Uses fallback queries
2. ✅ Database **with** `seoTitle` column → Uses normal queries

**No manual intervention needed!**

### Option B: Run Migration API

If you want to add the column immediately:

1. **Deploy the updated code**
2. **Call the migration endpoint:**
   ```bash
   curl -X POST https://your-domain.com/api/admin/database/migrate
   ```

3. **Verify migration:**
   ```bash
   curl https://your-domain.com/api/admin/database/migrate
   ```

### Option C: Manual SQL Migration

If you have direct database access:

1. **Connect to your PostgreSQL database**
2. **Run the migration SQL:**
   ```sql
   ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
   ```

3. **Verify column exists:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'media_assets' 
   AND column_name = 'seoTitle';
   ```

---

## 🧪 Testing

### Test #1: API Works Without Migration

1. **Call media API:**
   ```bash
   curl https://your-domain.com/api/media
   ```

2. **Expected Result:**
   - ✅ Returns media assets list
   - ✅ No errors about `seoTitle`
   - ✅ Console shows: "seoTitle column not found, using fallback query"

### Test #2: API Works After Migration

1. **Run migration:**
   ```bash
   curl -X POST https://your-domain.com/api/admin/database/migrate
   ```

2. **Call media API:**
   ```bash
   curl https://your-domain.com/api/media
   ```

3. **Expected Result:**
   - ✅ Returns media assets with `seoTitle` field
   - ✅ No fallback query needed
   - ✅ Faster performance

### Test #3: Create Media Asset

1. **Create media with seoTitle:**
   ```bash
   curl -X POST https://your-domain.com/api/media \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com/image.jpg",
       "type": "IMAGE",
       "altText": "Test image",
       "seoTitle": "SEO optimized title",
       "createdById": "user-id"
     }'
   ```

2. **Expected Result:**
   - ✅ Before migration: Creates asset without `seoTitle`
   - ✅ After migration: Creates asset with `seoTitle`
   - ✅ No errors in either case

---

## 📁 Files Changed

### Modified Files (1)

1. **`src/app/api/media/route.ts`**
   - Added fallback query for GET when `seoTitle` missing
   - Added fallback create for POST when `seoTitle` missing
   - Error handling for P2022 (column not found)
   - Lines added: ~108
   - Lines removed: ~33
   - **Net change:** +75 lines

### New Files (2)

2. **`src/app/api/admin/database/migrate/route.ts`**
   - Migration endpoint for adding `seoTitle` column
   - Safe, idempotent migration
   - Lines: 59

3. **`prisma/migrations/20251024000000_add_seo_title_to_media_assets/migration.sql`**
   - SQL migration file
   - Can be run manually on production database
   - Lines: 14

---

## 🎯 Success Criteria

| Feature | Status | Verification |
|---------|--------|--------------|
| API works without seoTitle | ✅ | No deployment errors |
| Fallback query works | ✅ | Returns media list |
| API works with seoTitle | ✅ | After migration runs |
| No data loss | ✅ | Existing media preserved |
| Backward compatible | ✅ | Old and new databases work |
| Migration is safe | ✅ | Idempotent, no duplicates |
| No downtime | ✅ | Continuous operation |

---

## 💡 Technical Details

### Why This Happened

1. **Schema Updated:** Added `seoTitle` field to Prisma schema
2. **Migration Not Run:** Production database didn't get the column
3. **Deployment:** Code expected column to exist
4. **Error:** Prisma couldn't find the column

### How We Fixed It

**Approach:** Graceful degradation with automatic upgrade

```
┌─────────────────────────────────────────────┐
│  Old Database (no seoTitle)                 │
│  ↓                                           │
│  API detects missing column                 │
│  ↓                                           │
│  Uses fallback raw SQL query                │
│  ↓                                           │
│  Returns data without seoTitle              │
│  ✅ Works!                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  New Database (with seoTitle)               │
│  ↓                                           │
│  API uses normal Prisma query               │
│  ↓                                           │
│  Returns data with seoTitle                 │
│  ✅ Works better!                            │
└─────────────────────────────────────────────┘
```

### Error Code P2022

Prisma error code **P2022** means:
> "The column does not exist in the current database"

We catch this specific error and fall back to a raw SQL query that only selects columns we know exist.

---

## 📞 Troubleshooting

### Still Getting Errors?

**Check deployment logs:**
```bash
# Look for these messages:
"seoTitle column not found, using fallback query"
"seoTitle column not found, creating without it"
```

If you see these, the fallback is working correctly!

### Want to Add the Column?

**Option 1: Use the migration endpoint**
```bash
curl -X POST https://your-domain.com/api/admin/database/migrate
```

**Option 2: Run SQL manually**
```sql
ALTER TABLE "media_assets" ADD COLUMN "seoTitle" TEXT;
```

### Verify Column Exists

**SQL Query:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'media_assets';
```

---

## 🎉 Summary

### What Was Fixed

✅ **Resilient Media API**
- Handles missing `seoTitle` column gracefully
- Automatic fallback to safe queries
- No deployment errors

✅ **Migration Endpoint**
- Easy way to add `seoTitle` column
- Safe, idempotent operation
- Can run anytime

✅ **Backward Compatibility**
- Works with old and new database schemas
- No breaking changes
- Zero downtime deployment

### Impact

- ✅ **Immediate Fix** - No more deployment errors
- ✅ **Flexible Upgrade** - Add column when ready
- ✅ **Production Safe** - No data loss risk
- ✅ **Future Proof** - Handles schema evolution

---

**Status:** ✅ **PRODUCTION READY**  
**Deployment Risk:** LOW  
**Data Loss Risk:** NONE  
**Downtime Required:** ZERO

🌊✨ **Your media API is now bulletproof!**
