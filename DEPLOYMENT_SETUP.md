# Deployment Setup: Vercel (Frontend) + Render (Backend)

## Overview
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render with MongoDB

---

## Backend Deployment (Render)

### Prerequisites
1. Create a [Render](https://render.com) account
2. Have your MongoDB connection string ready
3. Gather all environment variables

### Steps to Deploy Backend:

#### 1. Push to GitHub
```bash
git init
git add .
git commit -m "deployment setup"
git push origin main
```

#### 2. Connect to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your project

#### 3. Configure Service
- **Name**: `medicore-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free or Paid (based on your needs)

#### 4. Add Environment Variables
Set these in Render dashboard:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
CLIENT_URL=https://your-vercel-domain.vercel.app
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_DATABASE_URL=your_firebase_database_url
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
GROQ_API_KEY=your_groq_api_key
```

#### 5. Deploy
Click "Deploy" and wait for the build to complete. Your backend URL will look like:
```
https://medicore-api.onrender.com
```

---

## Frontend Deployment (Vercel)

### Prerequisites
1. Create a [Vercel](https://vercel.com) account
2. Have your backend Render URL ready

### Steps to Deploy Frontend:

#### 1. Update Environment Variables
Update `client/.env.production` (or set in Vercel dashboard):
```
REACT_APP_API_URL=https://medicore-api.onrender.com
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_DATABASE_URL=your_firebase_database_url
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
```

#### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the root directory or `client` folder

#### 3. Configure Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

#### 4. Add Environment Variables
Set in Vercel dashboard:
```
REACT_APP_API_URL=https://medicore-api.onrender.com
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_DATABASE_URL=your_firebase_database_url
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
```

#### 5. Deploy
Click "Deploy" and your frontend will be live on Vercel. Your URL will look like:
```
https://your-project.vercel.app
```

---

## Update Backend CORS

Once you have your Vercel URL, update in Render dashboard:
```
CLIENT_URL=https://your-project.vercel.app
```

Your `server/server.js` already has CORS configured:
```javascript
cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
})
```

---

## Update Frontend API URL

In your React components, use:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Example API call
axios.get(`${API_URL}/api/products`, {
  withCredentials: true
});
```

---

## Testing Deployment

### Backend
```bash
curl https://medicore-api.onrender.com/api/health
```

### Frontend
Visit: `https://your-project.vercel.app`

---

## Common Issues & Solutions

### 1. CORS Errors
- Ensure `CLIENT_URL` is set correctly on Render
- Check that frontend URL matches exactly (including https://)

### 2. MongoDB Connection Issues
- Verify MongoDB connection string is correct
- Check if IP whitelist allows Render's IP

### 3. Environment Variables Not Loading
- Make sure to redeploy after adding env vars
- Check variable names are exactly correct

### 4. 502 Bad Gateway
- Check backend has started successfully
- View logs in Render dashboard

---

## File Structure
```
medicore/
├── vercel.json                 # Root vercel config (delete if not needed)
├── render.yaml                 # Render backend configuration
├── .env.example               # Template for environment variables
├── DEPLOYMENT_SETUP.md        # This file
├── client/
│   ├── vercel.json           # Vercel frontend configuration
│   ├── package.json
│   └── src/
│       └── ...
└── server/
    ├── server.js             # Entry point for backend
    ├── package.json
    └── ...
```

---

## Next Steps
1. Set up MongoDB Atlas (free tier)
2. Configure Firebase project
3. Set up Cloudinary account
4. Push to GitHub
5. Deploy backend to Render
6. Deploy frontend to Vercel
7. Test the full application

---

## Support
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
