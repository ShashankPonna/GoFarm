# Deployment Checklist: Vercel + Render

## 📋 Pre-Deployment

### Local Testing
- [ ] Clone/pull latest code
- [ ] Create `.env` file from `.env.example`
- [ ] Run `npm install && npm install --prefix client`
- [ ] Test backend: `npm run dev`
- [ ] Test frontend: `npm run client`
- [ ] Verify API calls work

### GitHub Setup
- [ ] Initialize git repo (if not done)
- [ ] Create GitHub account
- [ ] Create new repository
- [ ] Add `.env` to `.gitignore`
- [ ] Push code:
  ```bash
  git add .
  git commit -m "Initial commit with deployment configs"
  git push origin main
  ```

---

## 🚀 Backend Deployment (Render)

### Services Setup
- [ ] Create [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [ ] Create free MongoDB cluster
- [ ] Get connection string (with username/password)
- [ ] Create [Cloudinary](https://cloudinary.com) account
- [ ] Get Cloudinary credentials (Cloud Name, API Key, Secret)
- [ ] Create [Firebase](https://firebase.google.com) project
- [ ] Generate Firebase Service Account JSON
- [ ] Create [GROQ](https://console.groq.com) account
- [ ] Get GROQ API key

### Render Deployment
- [ ] Create [Render](https://render.com) account
- [ ] Connect GitHub to Render
- [ ] Create new Web Service
- [ ] Configure:
  - [ ] Name: `medicore-api`
  - [ ] Environment: Node
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Plan: Free or Paid
- [ ] Add Environment Variables:
  - [ ] `NODE_ENV` = production
  - [ ] `PORT` = 10000
  - [ ] `MONGODB_URI` = (from MongoDB Atlas)
  - [ ] `JWT_SECRET` = (create strong secret)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `FIREBASE_SERVICE_ACCOUNT_PATH` = (from Firebase)
  - [ ] `GROQ_API_KEY`
  - [ ] `HUGGING_FACE_API_KEY` = (if used)
  - [ ] `CLIENT_URL` = (will update after frontend deployment)
- [ ] Click Deploy
- [ ] Wait for build to complete
- [ ] Copy backend URL (e.g., `https://medicore-api.onrender.com`)
- [ ] Test backend health:
  ```bash
  curl https://medicore-api.onrender.com/api/health
  ```

---

## 🎨 Frontend Deployment (Vercel)

### Vercel Setup
- [ ] Create [Vercel](https://vercel.com) account
- [ ] Connect GitHub to Vercel
- [ ] Create new project
- [ ] Configure:
  - [ ] Root Directory: `./` or leave default
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `build` (in client folder)
  - [ ] Install Command: `npm install`
- [ ] Add Environment Variables:
  - [ ] `REACT_APP_API_URL` = (your Render backend URL)
- [ ] Click Deploy
- [ ] Wait for build to complete
- [ ] Copy frontend URL (e.g., `https://yourapp.vercel.app`)
- [ ] Test frontend loads in browser

---

## 🔗 Post-Deployment: Connect Frontend & Backend

### Update Backend CORS
- [ ] Go to Render Dashboard
- [ ] Select `medicore-api` service
- [ ] Go to Environment Variables
- [ ] Update `CLIENT_URL` = (your Vercel frontend URL)
- [ ] Click "Redeploy"

### Update API URL Variable
- [ ] Go to Vercel Dashboard
- [ ] Select your project
- [ ] Settings → Environment Variables
- [ ] Verify `REACT_APP_API_URL` matches Render backend URL
- [ ] If needed, redeploy from Git

---

## ✅ Testing & Verification

### Health Checks
- [ ] Backend responds: `curl https://medicore-api.onrender.com`
- [ ] Frontend loads in browser
- [ ] Console has no CORS errors

### Functional Tests
- [ ] Can register/login user
- [ ] Can upload image
- [ ] Can view products
- [ ] Can create orders
- [ ] WebSocket works (if using chat)

### Production Checks
- [ ] Remove all console.log debugging
- [ ] Enable production error handling
- [ ] Check both services are using HTTPS
- [ ] Verify API calls include credentials: `withCredentials: true`

---

## 📊 Configuration Files Created

✅ **Backend (Render)**
- `render.yaml` - Render configuration
- `server/deploy.sh` - Deployment script
- Updated `.env.example` - Environment template

✅ **Frontend (Vercel)**
- `client/vercel.json` - Vercel configuration
- `client/deploy.sh` - Deployment script
- Updated `client/package.json` - Removed proxy

✅ **Documentation**
- `DEPLOYMENT_SETUP.md` - Detailed guide
- `QUICK_DEPLOY_GUIDE.md` - Quick reference
- `DEPLOYMENT_CHECKLIST.md` - This file

---

## 🐛 Troubleshooting

### Issue: CORS Errors
**Solution:**
```
1. Check CLIENT_URL in Render env vars
2. Ensure it matches exactly: https://yourapp.vercel.app
3. Redeploy backend after updating
```

### Issue: 502 Bad Gateway
**Solution:**
```
1. Go to Render Dashboard
2. Check logs for errors
3. Ensure PORT=10000 is set
4. Check all env vars are filled
```

### Issue: API calls return 404
**Solution:**
```
1. Check REACT_APP_API_URL in Vercel env vars
2. Get backend URL from Render
3. Update Vercel env var
4. Redeploy frontend
```

### Issue: Image upload fails
**Solution:**
```
1. Check Cloudinary credentials
2. Verify API key and secret
3. Check file size limit (10MB default)
```

---

## 📞 Support Links

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Help](https://www.mongodb.com/docs/atlas/)
- [Firebase Console](https://console.firebase.google.com)

---

## 🎯 Next Steps After Deployment

1. **Monitor Logs**
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployments → Detailed logs

2. **Set Up Custom Domain**
   - Render: Service Settings → Custom Domain
   - Vercel: Settings → Domains

3. **Enable Auto-Deploy**
   - Both platforms auto-deploy on git push

4. **Set Up Analytics**
   - Vercel: Built-in analytics in dashboard
   - Render: Check CPU/memory usage

5. **Backup Database**
   - MongoDB Atlas: Enable automatic backups

