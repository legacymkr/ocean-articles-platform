# Cloudinary Upload Setup

## ✅ What Was Done

1. **Removed UploadThing**
   - Uninstalled `uploadthing` and `@uploadthing/react` packages
   - Deleted UploadThing configuration files
   - Removed UploadThing API routes

2. **Installed Cloudinary**
   - Using existing `cloudinary` package (v2.7.0)
   - Created new upload API route at `/api/upload`
   - Created React components for file uploads

3. **New Files Created**
   - `src/app/api/upload/route.ts` - Cloudinary upload API
   - `src/components/cloudinary-uploader.tsx` - New uploader component
   - `src/components/uploader.tsx` - Updated backward-compatible uploader
   - `.env` - Environment variables file

## 🔑 Environment Variables

Make sure these are set in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME="douh6tfzo"
CLOUDINARY_API_KEY="827437729188963"
CLOUDINARY_API_SECRET="jtOveLgGrvU7lUy5v03k_ZQeH6Y"
```

## 📝 How to Use

### Option 1: Use the CloudinaryUploader Component

```tsx
import { CloudinaryUploader } from "@/components/cloudinary-uploader";

<CloudinaryUploader
  onUploadComplete={(url, mediaAsset) => {
    console.log("Uploaded:", url);
    // Use the URL in your form
  }}
  onUploadError={(error) => {
    console.error("Upload failed:", error);
  }}
  accept="image/*"
  maxSize={10}
  buttonText="Upload Image"
/>
```

### Option 2: Use the Uploader Component (Backward Compatible)

```tsx
import { Uploader } from "@/components/uploader";

<Uploader
  onUploadComplete={(url) => {
    console.log("Uploaded:", url);
  }}
  accept="image/*,video/*"
  maxSize={10}
/>
```

## 🚀 Features

- ✅ Supports images, videos, audio, and documents
- ✅ Automatic file type detection
- ✅ Progress tracking
- ✅ Image preview
- ✅ File size validation
- ✅ Saves to database automatically
- ✅ 25 GB storage (free tier)
- ✅ 25 GB bandwidth/month
- ✅ CDN delivery
- ✅ Image optimization

## 🔧 Testing

1. Start your development server: `npm run dev`
2. Go to the admin panel
3. Try uploading an image in the article editor
4. The image should upload to Cloudinary and return a URL

## 📦 Cloudinary Free Tier Limits

- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month
- Max file size: 10 MB (configurable)

## 🌐 Netlify Deployment

Don't forget to add these environment variables in Netlify:

1. Go to https://app.netlify.com/projects/galatide-ocean
2. Site settings → Environment variables
3. Add:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `DATABASE_URL`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`

## 🎉 Done!

Your app now uses Cloudinary for all file uploads. Try uploading an image and it should work without the "Failed to run middleware" error!
