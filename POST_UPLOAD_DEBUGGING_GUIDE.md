# Post Upload Debugging Guide

## Issues Fixed

✅ **Fixed FormData Content-Type Header Issue**
- Axios was incorrectly setting `Content-Type: multipart/form-data` 
- Now letting Axios automatically set the correct boundary header
- Applied to both `postsAPI.create()` and `productsAPI.create()`

✅ **Enhanced Error Messages**
- Server now returns detailed error messages
- Client displays specific errors from server response
- Browser console logs more detailed information

✅ **Added Multer Error Handling**
- File size errors (>10MB)
- File count errors (>4 images)
- Invalid file type errors

---

## How to Test Post Upload

### Step 1: Start the Server
```bash
cd C:\Users\Admin\OneDrive\Desktop\medicore
npm start
```

Check logs for:
```
🔥 Initializing Firebase...
✓ Firebase Admin SDK initialized
🚀 Server Started Successfully
🌍 Port: 5000
📡 Environment: development
✅ MongoDB Connected Successfully
```

### Step 2: Start the Client
```bash
cd C:\Users\Admin\OneDrive\Desktop\medicore\client
npm start
```

### Step 3: Create a Post with Images

1. Login to the application
2. Navigate to Posts section
3. Click "Create Post" or "Photo" button
4. Select a post category (Tips, Question, Success Story, Discussion)
5. Enter post content
6. Select 1-4 images
7. Click "Post" button

---

## Troubleshooting Steps

### Issue: "Authentication required" Error

**What's happening:**
- User is not authenticated
- Token is missing or invalid

**Fix:**
1. Ensure you're logged in
2. Check browser DevTools → Application → Local Storage
3. Look for `auth` or `token` key
4. If missing, logout and login again

---

### Issue: "Post content is required" Error

**What's happening:**
- The textarea was empty or only whitespace

**Fix:**
1. Type at least 1 character in the content field
2. Post button should be enabled (not grayed out)

---

### Issue: "File size too large" Error

**What's happening:**
- One or more images are larger than 10MB

**Fix:**
1. Compress images before uploading
2. Recommended size: 1-5MB per image
3. Use tools like [TinyPNG](https://tinypng.com/) or similar

---

### Issue: "Too many files" Error

**What's happening:**
- User selected more than 4 images

**Fix:**
1. Select maximum 4 images per post
2. Remove extra images from selection

---

### Issue: "Only image files are allowed" Error

**What's happening:**
- Selected file is not an image (e.g., PDF, text file)

**Fix:**
1. Select only image files (JPG, PNG, GIF, WebP, etc.)
2. Check file extension before uploading

---

### Issue: "Failed to upload image to Cloudinary" Error

**What's happening:**
- Cloudinary API credentials are missing or incorrect
- Cloudinary account has reached storage limit
- Network issue connecting to Cloudinary

**Fix:**
1. **Check Environment Variables:**
   ```
   Open .env file and verify:
   - CLOUDINARY_CLOUD_NAME is set
   - CLOUDINARY_API_KEY is set
   - CLOUDINARY_API_SECRET is set
   ```

2. **Restart Server:**
   ```bash
   # Kill any running node processes
   taskkill /IM node.exe /F
   
   # Restart the server
   npm start
   ```

3. **Check Cloudinary Dashboard:**
   - Visit https://cloudinary.com/console
   - Verify API credentials match .env file
   - Check if account has available storage

4. **Test Cloudinary Directly:**
   ```bash
   # Run this to test Cloudinary connection
   node -e "const cloudinary = require('cloudinary').v2; cloudinary.config({cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET}); console.log('✅ Cloudinary configured:', cloudinary.config().cloud_name);"
   ```

---

### Issue: "Server error" without specific message

**What's happening:**
- Unexpected error on the server side

**Fix:**
1. **Check Server Logs:**
   ```
   Look in terminal where npm start is running
   Find the ❌ error messages
   Note the exact error and stack trace
   ```

2. **Check Browser Console:**
   - Press F12 to open DevTools
   - Click "Console" tab
   - Look for red error messages
   - Screenshot the error

3. **Check Network Tab:**
   - Open DevTools → Network tab
   - Create a post with image
   - Look for POST `/api/posts` request
   - Click on it and check Response tab
   - You should see error details

---

## Server-Side Debugging

### Check Logs in Console

When you create a post, you should see:

**For Posts WITHOUT Images:**
```
💾 Saving post to MongoDB...
✅ Post created successfully with 0 images
POST /api/posts 201
```

**For Posts WITH Images:**
```
📸 Processing 2 image(s) for post...
📤 Uploading image1.jpg (245620 bytes) to Cloudinary...
✅ Image uploaded to Cloudinary: posts/abc123
📤 Uploading image2.jpg (189456 bytes) to Cloudinary...
✅ Image uploaded to Cloudinary: posts/def456
💾 Saving post to MongoDB...
✅ Post created successfully with 2 images
POST /api/posts 201
```

**If Upload Fails:**
```
❌ Error uploading image to Cloudinary: Error message here
🗑️ Cleaning up 1 previously uploaded images...
✅ Deleted: posts/abc123
POST /api/posts 400
```

---

## Client-Side Debugging

### Check Browser Console

Press `F12` → Console tab and look for:

**Success:**
```
📤 Submitting post with 2 images...
✅ Post created successfully: {_id: "...", content: "...", ...}
```

**Error:**
```
❌ Error creating post: Error: Request failed with status 400
```

### Check Network Tab

1. Press `F12` → Network tab
2. Create a post
3. Look for POST request to `localhost:5000/api/posts`
4. Click on it
5. Check:
   - **Request Headers** (should have `Authorization: Bearer token`)
   - **Request Payload** (should be FormData with content, category, images)
   - **Response** (should show error message)

---

## Quick Fix Checklist

- [ ] Server is running (`npm start`)
- [ ] Client is running (`npm start` in client folder)
- [ ] User is logged in
- [ ] Post content is not empty
- [ ] Images are < 10MB each
- [ ] Maximum 4 images selected
- [ ] Images are in valid format (JPG, PNG, GIF, etc.)
- [ ] `.env` file has CLOUDINARY credentials
- [ ] MongoDB is connected (check server logs)
- [ ] Network connection is working
- [ ] No CORS errors in browser console

---

## Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---|---|---|
| `Authentication required` | User not logged in | Login first |
| `Post content is required` | Empty post | Type something |
| `File size too large` | Image > 10MB | Compress image |
| `Too many files` | > 4 images | Select ≤ 4 images |
| `Only image files allowed` | Wrong file type | Select image files |
| `Failed to upload to Cloudinary` | Cloudinary error | Check credentials |
| `Not authorized to delete` | Not post author | Can only delete own posts |
| `Post not found` | Deleted or wrong ID | Refresh page |
| `CORS error` | Frontend/Backend mismatch | Check CORS config |

---

## Testing with cURL

### Create Post WITHOUT Images
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test post",
    "category": "Tips"
  }'
```

### Create Post WITH Images
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Test post with image" \
  -F "category=Tips" \
  -F "images=@/path/to/image.jpg"
```

### Expected Successful Response
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "_id": "...",
    "author": {
      "_id": "...",
      "name": "User Name",
      "email": "user@example.com"
    },
    "content": "Post content here",
    "category": "Tips",
    "images": [
      {
        "url": "https://res.cloudinary.com/...",
        "publicId": "posts/..."
      }
    ],
    "likes": [],
    "comments": [],
    "createdAt": "2024-02-25T..."
  }
}
```

---

## Performance Tips

1. **Compress Images Before Upload**
   - Use ImageOptim (Mac) or FileOptimizer (Windows)
   - Target: 500KB - 2MB per image

2. **Use Modern Image Formats**
   - WebP format is smaller (need browser support)
   - JPEG/PNG work on all browsers

3. **Post Without Images First**
   - If having image issues, post without images first
   - Test if text posts work

4. **Test One Image At a Time**
   - If multiple images fail, test with single image
   - Helps identify problematic image

---

## Getting Help

If you're still having issues:

1. **Collect Information:**
   - Browser console error message
   - Server log error message
   - Network tab response body
   - Screenshot of error

2. **Check GitHub Issues:**
   - Search existing issues
   - Create new issue with details

3. **Enable Debug Mode:**
   - Add `DEBUG=*` to environment
   - Restart server
   - Look for detailed logs

---

## Files Modified in This Update

✅ `server/routes/post.routes.js`
- Added multer error handling middleware
- Better error messages for file size/type/count

✅ `server/controllers/post.controller.js`
- Enhanced validation
- Better error logging
- Improved error messages

✅ `client/src/utils/api.js`
- Fixed FormData Content-Type handling
- Added update and delete methods for posts

✅ `client/src/components/CreatePost.jsx`
- Better error handling
- Console logging for debugging
- Specific error message display

✅ `server/routes/post.routes.js`
- Added DELETE route
- Added PUT route for updates
