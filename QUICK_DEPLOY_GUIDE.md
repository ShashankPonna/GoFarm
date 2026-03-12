# Quick Deployment Guide: Vercel + Render

## ⚡ Frontend (Vercel)

### Step 1: Prepare Frontend
```bash
cd client
npm run build
```

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repo
4. Select `client` folder as root
5. Add Environment Variables:
   - `REACT_APP_API_URL` = Your Render backend URL

### Step 3: Deploy
Click Deploy button

---

## 🚀 Backend (Render)

### Step 1: Prepare Environment
1. Copy `.env.example` to `.env`
2. Fill in all values from your services

### Step 2: Deploy to Render
1. Go to [Render](https://render.com)
2. Click "New Web Service"
3. Connect GitHub repo
4. Settings:
   - **Name**: medicore-api
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables from `.env`
6. Deploy

### Step 3: Get Backend URL
After deployment, copy your Render URL (e.g., `https://medicore-api.onrender.com`)

---

## 🔗 Connect Frontend to Backend

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Update `REACT_APP_API_URL` to your Render URL
5. Redeploy

---

## ✅ Verify Deployment

### Frontend Health Check
Visit your Vercel URL in browser - should see your app

### Backend Health Check
```
curl https://your-render-url.onrender.com/api/health

# Or check specific endpoints
curl https://your-render-url.onrender.com/api/products
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| CORS Error | Check CLIENT_URL in Render matches Vercel URL |
| 502 Bad Gateway | Check backend logs in Render dashboard |
| Build fails | Check `npm install && npm run build` works locally |
| Env vars not loading | Redeploy after adding variables |

---

## 📝 Important Notes

⚠️ **Keep `.env` local only** - Don't commit to GitHub!

✅ **Sensitive data** - Cloudinary, Firebase, GROQ keys should be in Render environment variables

✅ **CORS** - Already configured in `server/server.js` to use `CLIENT_URL` env var
