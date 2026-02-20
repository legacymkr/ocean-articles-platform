# Media Upload Testing Checklist

## Pre-Testing Setup

- [ ] Development server running: `npm run dev`
- [ ] Database accessible (Supabase connection working)
- [ ] Cloudinary credentials configured in `.env`

---

## Test 1: Basic Image Upload

### Steps:
1. Navigate to `http://localhost:3000/admin/login`
2. Log in to admin panel
3. Go to `http://localhost:3000/admin/media`
4. Click "Upload Media" button
5. Select an image file (JPG or PNG, < 10MB)
6. Enter Alt Text: "Test upload 1"
7. Enter SEO Title: "Test SEO 1"
8. Click upload

### Expected Results:
- [ ] Upload progress shows 0-100%
- [ ] Success toast message appears
- [ ] Image appears immediately in Media Library grid
- [ ] Image preview shows correctly (not broken)
- [ ] Hover over image shows action buttons (Eye, Copy, Edit, Delete)

### Verify URL:
- [ ] Click Eye icon to preview
- [ ] URL in preview starts with `https://res.cloudinary.com/douh6tfzo/`
- [ ] NO `blob:https://` URLs visible anywhere
- [ ] Click Copy button
- [ ] Paste URL in new browser tab - image loads correctly

---

## Test 2: Upload Persistence

### Steps:
1. After Test 1, refresh the page (F5)
2. Wait for page to reload

### Expected Results:
- [ ] Image still visible in Media Library
- [ ] Image preview still works
- [ ] URL still starts with Cloudinary domain
- [ ] Alt text and SEO title preserved

### Additional Check:
1. Close browser completely
2. Reopen browser
3. Navigate back to `/admin/media`

### Expected Results:
- [ ] Image still visible
- [ ] All metadata intact

---

## Test 3: Multiple Image Upload

### Steps:
1. Click "Upload Media" again
2. Select 3 different images at once
3. Add Alt Text: "Batch upload test"
4. Click upload

### Expected Results:
- [ ] All 3 images upload successfully
- [ ] All 3 appear in Media Library
- [ ] Each has unique Cloudinary URL
- [ ] All persist after refresh

---

## Test 4: Article Cover Image

### Steps:
1. Go to `http://localhost:3000/admin/articles/new`
2. Enter article title: "Test Article"
3. Click "Choose Cover Image" button
4. Upload a new image OR select existing one
5. Image should appear in cover preview
6. Save article as DRAFT

### Expected Results:
- [ ] Cover image displays correctly
- [ ] URL is Cloudinary URL (not blob)
- [ ] Save successful

### Persistence Check:
1. Refresh the page
2. Or navigate away and come back to edit

### Expected Results:
- [ ] Cover image still displays
- [ ] Image not broken
- [ ] Can change cover image if needed

---

## Test 5: Database Verification

### Steps:
1. Open new terminal
2. Run: `npx prisma studio`
3. Navigate to `MediaAsset` table

### Expected Results:
- [ ] All uploaded images have records
- [ ] Each record has:
  - `id` (UUID)
  - `url` (Cloudinary URL)
  - `type` (IMAGE)
  - `altText` (what you entered)
  - `seoTitle` (what you entered)
  - `createdById` (admin user ID)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

---

## Test 6: Cloudinary Verification

### Steps:
1. Log into Cloudinary: https://console.cloudinary.com/
2. Navigate to Media Library
3. Look for `ocean-articles` folder

### Expected Results:
- [ ] All uploaded images visible in Cloudinary
- [ ] Images have correct filenames
- [ ] Can view/download images from Cloudinary

---

## Test 7: Error Handling

### Test 7a: Database Down
1. Stop Supabase connection (or use invalid DATABASE_URL temporarily)
2. Try to upload image

### Expected Results:
- [ ] Clear error message appears
- [ ] Error mentions database unavailable
- [ ] Upload does NOT show success
- [ ] No orphaned files in Cloudinary

### Test 7b: Large File
1. Try to upload image > 10MB

### Expected Results:
- [ ] Image automatically compressed
- [ ] OR clear error if too large even after compression
- [ ] No silent failure

---

## Test 8: Image Optimization

### Steps:
1. Upload a large image (2-5 MB)
2. Watch for optimization messages

### Expected Results:
- [ ] Toast shows "Optimizing [filename]..."
- [ ] Toast shows "Optimized - saved X%"
- [ ] Compressed image uploads successfully
- [ ] Image quality still good

---

## Test 9: Media Management

### Steps:
1. In Media Library, hover over an image
2. Click Edit button
3. Change Alt Text and SEO Title
4. Save changes

### Expected Results:
- [ ] Changes save successfully
- [ ] Refresh page - changes persist

### Delete Test:
1. Select an image not used in any article
2. Click Delete button
3. Confirm deletion

### Expected Results:
- [ ] Image removed from Media Library
- [ ] Image removed from database
- [ ] (Optional) Image removed from Cloudinary

---

## Test 10: Drag & Drop Upload

### Steps:
1. Open Media Library
2. Click "Upload Media"
3. Drag an image file from desktop
4. Drop it on the upload dialog

### Expected Results:
- [ ] Drag overlay appears
- [ ] File uploads successfully
- [ ] Same behavior as clicking to upload

---

## Common Issues to Watch For

### ❌ FAIL Indicators:
- Seeing `blob:https://` URLs anywhere
- Images disappear after refresh
- "Upload successful" but image not in library
- Broken image icons
- Console errors about database
- 404 errors on API calls

### ✅ SUCCESS Indicators:
- Only Cloudinary URLs visible
- Images persist forever
- Clear error messages when things fail
- Fast upload with progress indicator
- Smooth user experience

---

## If All Tests Pass:

1. **Commit the testing checklist:**
   ```bash
   git add TESTING_CHECKLIST.md MEDIA_UPLOAD_FIX_COMPLETE.md
   git commit -m "Add testing documentation for media upload fixes"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Wait for Netlify auto-deploy** (check Netlify dashboard)

4. **Test on production:**
   - Repeat key tests on https://galatide-ocean.netlify.app
   - Verify production environment variables are set

---

## If Tests Fail:

Document what failed:
- Which test number?
- What was the error message?
- What did you see vs. what was expected?
- Any console errors?

Then let me know and I'll fix it!

---

## Production Testing (After Deploy)

Once deployed to Netlify, repeat these critical tests:

- [ ] Test 1: Basic Image Upload
- [ ] Test 2: Upload Persistence  
- [ ] Test 4: Article Cover Image
- [ ] Test 5: Database Verification

If production tests pass, the fix is complete! ✅
