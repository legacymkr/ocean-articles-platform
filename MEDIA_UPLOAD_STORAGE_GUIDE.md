# 📁 Media Upload & Storage Guide

**Date:** 2025-10-25  
**Status:** ⚠️ IMPORTANT INFORMATION  

---

## 🚨 Media Upload Auto-Deletion Issue

### Problem Description
Uploaded media files (images, videos) are being automatically deleted after a period of time, causing broken article cover images and missing media assets.

### Root Cause
The project uses **UploadThing** for file uploads, which has the following limitations on the **Free Tier**:

- **Storage Limit:** 2GB total
- **Auto-Deletion:** Files are automatically deleted after **30 days** on the free tier
- **File Limit:** Limited number of uploads per month

This means any media uploaded to use as article covers or in content will disappear after 30 days, breaking the website.

---

## ✅ Solutions

### Option 1: Upgrade UploadThing (Recommended for Quick Fix)
**Cost:** Starting at $20/month  
**Benefits:**
- ✅ Permanent file storage
- ✅ No auto-deletion
- ✅ Larger storage limits
- ✅ More bandwidth
- ✅ Minimal code changes needed

**How to Upgrade:**
1. Visit https://uploadthing.com/dashboard
2. Navigate to your project
3. Upgrade to a paid plan
4. Files will no longer be auto-deleted

---

### Option 2: Switch to Cloudinary (Best Long-term Solution)
**Cost:** Free tier includes 25GB storage + 25GB bandwidth  
**Benefits:**
- ✅ Generous free tier
- ✅ Permanent storage (no auto-deletion)
- ✅ Image optimization and transformations
- ✅ CDN delivery
- ✅ Better performance

**Implementation Status:**
The codebase already has Cloudinary integration set up in `src/lib/cloudinary.ts`

**How to Switch:**
1. Create a free account at https://cloudinary.com
2. Get your credentials from the dashboard
3. Add to `.env.local`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
4. Update uploader component to use Cloudinary instead of UploadThing

---

### Option 3: Use Supabase Storage (Already in Project)
**Cost:** Free tier includes 1GB storage  
**Benefits:**
- ✅ Already configured in the project
- ✅ Permanent storage
- ✅ Direct integration with Supabase database
- ✅ Good for smaller projects

**How to Enable:**
The project already has Supabase configured. Storage can be enabled in the Supabase dashboard.

---

## 🔧 Current Implementation

### Files Involved
- `src/lib/uploadthing.ts` - UploadThing configuration
- `src/components/uploader.tsx` - Upload component
- `src/lib/cloudinary.ts` - Cloudinary helper (ready to use)
- `src/lib/supabase.ts` - Supabase client (ready to use)
- `src/app/api/media/route.ts` - Media API endpoints

### Media Database Storage
All uploaded media URLs are stored in the `media_assets` table in PostgreSQL:
```sql
CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  type MediaType NOT NULL,
  width INTEGER,
  height INTEGER,
  blurhash TEXT,
  altText TEXT,
  seoTitle TEXT,
  createdById TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The URLs are preserved in the database, but if UploadThing deletes the actual files, the URLs become broken links.

---

## 📝 Recent Improvements (Completed)

### ✅ Added Copy URL Button to Media Library
**Location:** `src/app/(admin)/admin/media/page.tsx`

**Features:**
- Copy URL button for each media item (grid and list view)
- One-click copy to clipboard
- Success notification on copy
- View and Delete buttons remain functional

**Usage:**
1. Go to Admin → Media Library
2. Find any media item
3. Click the **Copy** button (clipboard icon)
4. URL is copied to clipboard
5. Paste anywhere (article cover URL, content, etc.)

---

## 🎯 Recommended Action Plan

### Immediate (This Week)
1. **Document all current media URLs** from the media library
2. **Re-upload critical media** to ensure 30-day timer resets
3. **Set calendar reminder** for 25 days from now to re-upload again

### Short-term (This Month)
**Choose one of these options:**

**Option A: Pay for UploadThing**
- Upgrade to paid plan ($20/month)
- Zero code changes needed
- Immediate fix

**Option B: Switch to Cloudinary** (Recommended)
- Free for most use cases
- Better features
- Requires small code update
- One-time setup effort

### Long-term (Best Practice)
1. Use Cloudinary for permanent storage
2. Set up automated backups of media URLs
3. Implement media migration script if needed
4. Monitor storage usage

---

## 🛠️ Migration to Cloudinary (Step-by-Step)

If you decide to switch to Cloudinary, here's how:

### Step 1: Set up Cloudinary Account
```bash
# 1. Create account at https://cloudinary.com
# 2. Get credentials from dashboard
# 3. Add to .env.local:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 2: Update Uploader Component
The code is already ready in `src/lib/cloudinary.ts`. You just need to update the uploader to use it instead of UploadThing.

### Step 3: Test Upload
1. Upload a test image
2. Verify it appears in Cloudinary dashboard
3. Verify URL works and doesn't expire
4. Use URL in an article
5. Wait 30+ days - URL should still work!

---

## 📊 Storage Comparison

| Feature | UploadThing Free | UploadThing Paid | Cloudinary Free | Supabase Free |
|---------|------------------|------------------|-----------------|---------------|
| **Storage** | 2GB | 100GB+ | 25GB | 1GB |
| **Bandwidth** | Limited | Unlimited | 25GB/month | 2GB |
| **File Retention** | 30 days | ✅ Permanent | ✅ Permanent | ✅ Permanent |
| **Auto-Delete** | ❌ Yes | ✅ No | ✅ No | ✅ No |
| **Cost** | Free | $20/month | Free | Free |
| **CDN** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Transformations** | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **Best For** | Testing | Production | Production | Small projects |

---

## 🔍 How to Check Your Current Storage

### UploadThing Dashboard
1. Visit https://uploadthing.com/dashboard
2. Check "Storage" tab
3. See file count and retention period

### Cloudinary Dashboard
1. Visit https://cloudinary.com/console
2. Check "Media Library"
3. View all uploaded files

### Database Check
Run this query in your PostgreSQL database:
```sql
SELECT 
  type,
  COUNT(*) as file_count,
  MIN(createdAt) as oldest_file,
  MAX(createdAt) as newest_file
FROM media_assets
GROUP BY type;
```

---

## 💡 Best Practices

1. **Always save URLs to database** - Already implemented ✅
2. **Use descriptive filenames** - Helps with SEO
3. **Compress images before upload** - Saves bandwidth
4. **Add alt text and SEO titles** - Now available in image dialog ✅
5. **Regular backups** - Export media URLs monthly
6. **Monitor storage usage** - Check dashboard weekly
7. **Use CDN for delivery** - All options include this ✅

---

## 🆘 Emergency Recovery

If media files have been deleted:

1. **Check database for URLs**
   ```sql
   SELECT url FROM media_assets ORDER BY createdAt DESC;
   ```

2. **Use Internet Archive** (if previously crawled)
   - Visit https://web.archive.org
   - Enter your media URLs
   - Download cached versions

3. **Re-upload from local backups**
   - Keep local copies of all uploaded media
   - Re-upload to new permanent storage
   - Update database URLs if needed

---

## 📞 Support Resources

- **UploadThing:** https://uploadthing.com/dashboard
- **Cloudinary:** https://support.cloudinary.com
- **Supabase:** https://supabase.com/docs/guides/storage

---

**Status:** ✅ Copy URL button added to Media Library  
**Next:** Choose permanent storage solution (Cloudinary recommended)
