# Post Image Storage - Cloudinary + MongoDB Implementation

## Overview
Posts are now stored using a hybrid approach:
- **Images**: Stored in Cloudinary (cloud storage)
- **Post Data**: Stored in MongoDB (database)
- **Retrieval**: Reading from both Cloudinary (via stored URLs) and MongoDB (for post metadata)

---

## Architecture

### Post Model (MongoDB)
```javascript
{
  author: ObjectId,          // Reference to User
  content: String,           // Post text content
  category: String,          // Tips, Question, Success Story, Discussion
  images: [{
    url: String,            // Cloudinary secure URL
    publicId: String        // Cloudinary public ID (for deletion)
  }],
  likes: [ObjectId],       // User IDs who liked the post
  comments: [{
    user: ObjectId,        // User who commented
    text: String,          // Comment text
    createdAt: Date
  }],
  shares: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### 1. Create Post (with Images)
**POST** `/api/posts`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```
- images: [File, File, ...] (max 4 images, 10MB each)
- content: string (required)
- category: string (Tips, Question, Success Story, Discussion)
```

**Process:**
1. Receives multipart form data with images
2. Each image is uploaded to Cloudinary in `posts` folder
3. Returns Cloudinary URL and public ID
4. Stores post data + image URLs in MongoDB
5. Populates author info
6. Emits real-time `newPost` event

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "_id": "...",
    "author": {
      "_id": "...",
      "name": "Farmer Name",
      "email": "farmer@example.com"
    },
    "content": "Post content",
    "category": "Tips",
    "images": [
      {
        "url": "https://res.cloudinary.com/djdieezso/image/upload/v1234567890/posts/abc123.jpg",
        "publicId": "posts/abc123"
      }
    ],
    "likes": [],
    "comments": [],
    "shares": 0,
    "createdAt": "2024-02-25T...",
    "updatedAt": "2024-02-25T..."
  }
}
```

---

### 2. Get All Posts
**GET** `/api/posts?category=Tips`

**Response:**
```json
[
  {
    "_id": "...",
    "author": { "_id": "...", "name": "Farmer Name", "email": "..." },
    "content": "Post content",
    "category": "Tips",
    "images": [
      {
        "url": "https://res.cloudinary.com/...",
        "publicId": "posts/..."
      }
    ],
    "likes": [...],
    "comments": [...],
    "createdAt": "2024-02-25T..."
  }
]
```

Images are served directly from Cloudinary URLs stored in MongoDB.

---

### 3. Get Post by ID
**GET** `/api/posts/{postId}`

Returns single post with all details including images from Cloudinary.

---

### 4. Update Post
**PUT** `/api/posts/{postId}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```
- images: [File, File, ...] (optional - replaces old images)
- content: string (optional)
- category: string (optional)
```

**Process:**
1. Validates authorization (only post author can update)
2. If new images provided:
   - Deletes old images from Cloudinary
   - Uploads new images to Cloudinary
3. Updates post content/category in MongoDB
4. Emits real-time `postUpdated` event

---

### 5. Delete Post
**DELETE** `/api/posts/{postId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Process:**
1. Validates authorization (only post author can delete)
2. Deletes all images from Cloudinary using public IDs
3. Deletes post document from MongoDB
4. Emits real-time `postDeleted` event

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### 6. Like Post
**POST** `/api/posts/{postId}/like`

Toggles like status for authenticated user.

---

### 7. Comment on Post
**POST** `/api/posts/{postId}/comment`

**Body:**
```json
{
  "text": "Comment text"
}
```

---

## Environment Variables

Required Cloudinary configuration in `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get these from: https://cloudinary.com/console

---

## File Storage Flow

### Upload Flow (Creating/Updating Post)
```
Client
  ↓ (multipart/form-data with images)
Server (Multer - Memory Storage)
  ↓ (file buffer in memory)
Cloudinary Service
  ↓ (uploadToCloudinary function)
Cloudinary Cloud
  ↓ (returns secure_url + public_id)
MongoDB
  ↓ (stores post with image URLs)
Client
  ↓ (receives post with Cloudinary URLs)
```

### Retrieval Flow (Getting Posts)
```
Client
  ↓ (GET request)
MongoDB
  ↓ (returns post documents with image URLs)
Client
  ↓ (receives post with Cloudinary URLs)
Browser
  ↓ (loads images directly from Cloudinary)
Cloudinary CDN
  ↓ (serves images globally)
User
```

---

## Implementation Files Modified

### Backend Controllers
**File:** `server/controllers/post.controller.js`

Changes:
- ✅ `createPost()` - Upload images to Cloudinary before saving to MongoDB
- ✅ `updatePost()` - NEW - Update posts with image replacement
- ✅ `deletePost()` - NEW - Delete images from Cloudinary + post from MongoDB
- ✅ `getPosts()` - Returns posts with Cloudinary image URLs
- ✅ `getPostById()` - Returns single post with images
- ✅ `likePost()` - Unchanged
- ✅ `commentPost()` - Unchanged

### Backend Routes
**File:** `server/routes/post.routes.js`

Changes:
- Changed from **disk storage** (`multer.diskStorage`) to **memory storage** (`multer.memoryStorage`)
- Added PUT route for updating posts
- Added DELETE route for deleting posts
- File buffers are passed directly to Cloudinary service

### Utilities
**File:** `server/utils/cloudinaryService.js`

Existing functions used:
- `uploadToCloudinary(buffer, folder, public_id)` - Uploads image to Cloudinary
- `deleteFromCloudinary(public_id)` - Deletes image from Cloudinary
- `getImageUrl(public_id)` - Gets URL from public ID

### Data Model
**File:** `server/models/Post.model.js`

No changes - existing schema already supports images array with url and publicId.

---

## Frontend Integration Example

### Create Post with Images

```javascript
const createPost = async (formData) => {
  const form = new FormData();
  form.append('content', formData.content);
  form.append('category', formData.category);
  
  // Append images
  if (formData.images) {
    formData.images.forEach(image => {
      form.append('images', image);
    });
  }
  
  const response = await axios.post('/api/posts', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data.post;
};
```

### Display Posts

```javascript
const [posts, setPosts] = useState([]);

useEffect(() => {
  // Fetch posts from MongoDB (which contains Cloudinary URLs)
  const fetchPosts = async () => {
    const response = await axios.get('/api/posts');
    setPosts(response.data);
  };
  
  fetchPosts();
}, []);

// Render images directly from Cloudinary URLs
const renderPost = (post) => (
  <div className="post">
    <p>{post.content}</p>
    <div className="images">
      {post.images && post.images.map(img => (
        <img key={img.publicId} src={img.url} alt="Post" />
      ))}
    </div>
  </div>
);
```

### Update Post with Images

```javascript
const updatePost = async (postId, formData) => {
  const form = new FormData();
  form.append('content', formData.content);
  form.append('category', formData.category);
  
  // New images to replace old ones
  if (formData.images) {
    formData.images.forEach(image => {
      form.append('images', image);
    });
  }
  
  const response = await axios.put(`/api/posts/${postId}`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data.post;
};
```

### Delete Post

```javascript
const deletePost = async (postId) => {
  const response = await axios.delete(`/api/posts/${postId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

---

## Key Features

✅ **Cloudinary Integration**
- Images stored in Cloudinary cloud storage
- Automatic image optimization
- Global CDN delivery
- Secure URLs (https)

✅ **MongoDB Storage**
- Post metadata stored in MongoDB
- References to Cloudinary URLs stored
- Public IDs stored for deletion

✅ **Automatic Cleanup**
- Images deleted from Cloudinary when post is deleted
- Old images deleted when images are replaced
- No orphaned files in Cloudinary

✅ **Security**
- Only post author can update/delete
- Authorization checks on all operations
- File type validation (images only)
- File size limits (10MB per image)

✅ **Real-time Updates**
- Socket.io events emitted for new/updated/deleted posts
- Clients receive real-time notifications

✅ **Error Handling**
- Rollback on upload failures
- Detailed error messages
- Console logging for debugging

---

## Testing the Implementation

### Using Postman/cURL

**1. Create Post with Images**
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Great farming tips for cotton!" \
  -F "category=Tips" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**2. Get All Posts**
```bash
curl http://localhost:5000/api/posts
```

**3. Update Post**
```bash
curl -X PUT http://localhost:5000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Updated content" \
  -F "images=@/path/to/new-image.jpg"
```

**4. Delete Post**
```bash
curl -X DELETE http://localhost:5000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Cloudinary Upload Fails with 400 Error
- ✅ Check `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env`
- ✅ Verify `CLOUDINARY_CLOUD_NAME` is correct
- ✅ Check image file size (max 10MB)
- ✅ Check image format (jpg, png, gif, etc.)

### Images Not Displayed in Frontend
- ✅ Verify Cloudinary URLs are correctly stored in MongoDB
- ✅ Check CORS settings if loading from different domain
- ✅ Check Cloudinary delivery settings

### Post Deletion Failed, but Images Remain
- ✅ Check CloudinaryService error logs
- ✅ Manually delete images from Cloudinary dashboard if needed

---

## Summary

Post creation, update, and deletion now seamlessly integrate:
1. **Images** → Cloudinary (or Cloudinary delete)
2. **Post Data** → MongoDB (includes image URLs)
3. **Retrieval** → MongoDB (which contains Cloudinary URLs)

Images are served efficiently from Cloudinary's global CDN, while post metadata remains in MongoDB for fast queries and organization.
