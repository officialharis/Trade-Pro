# 🚀 TradePro Deployment Guide

## Quick Fix for Vercel Error

Your Vercel deployment is failing because the frontend can't connect to the backend. Here's the complete fix:

---

## 🔧 **Step 1: Deploy Backend to Railway**

### **1. Go to Railway**
- Visit [railway.app](https://railway.app)
- Sign up/Login with GitHub

### **2. Deploy Backend**
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose your **`Trade-Pro`** repository
- Railway will auto-detect Node.js

### **3. Add Environment Variables**
In Railway dashboard, go to **Variables** and add:

```env
MONGODB_URI=mongodb+srv://h10dewangan:groww@cluster0.jezzunf.mongodb.net/tradepro?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-here-tradepro-2024
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-app.vercel.app
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thisissecretkey
```

### **4. Configure Build Settings**
- **Build Command**: `npm install`
- **Start Command**: `npm run server`
- **Root Directory**: `/`

### **5. Deploy**
- Click **"Deploy"**
- Wait for deployment to complete
- Copy your Railway URL (e.g., `https://tradepro-backend.railway.app`)

---

## 🌐 **Step 2: Update Vercel Frontend**

### **1. Update Environment Variables in Vercel**
- Go to your Vercel project dashboard
- Navigate to **Settings** → **Environment Variables**
- Update/Add:

```env
VITE_API_URL=https://your-railway-url.railway.app
NODE_ENV=production
```

### **2. Redeploy Frontend**
- Go to **Deployments** tab
- Click **"Redeploy"** on the latest deployment
- Or push a new commit to trigger auto-deployment

---

## 🎯 **Step 3: Test Your Application**

### **1. Check Backend Health**
Visit: `https://your-railway-url.railway.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "database": "connected"
}
```

### **2. Test Frontend**
Visit your Vercel URL and try:
- ✅ Sign up for new account
- ✅ Login with existing account
- ✅ Browse stocks
- ✅ Make a trade
- ✅ Check portfolio

---

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. CORS Error**
```
Access to fetch at 'railway-url' from origin 'vercel-url' has been blocked by CORS
```
**Fix**: Update `CORS_ORIGIN` in Railway to your exact Vercel URL

#### **2. Database Connection Error**
```
MongooseError: Could not connect to MongoDB
```
**Fix**: Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Railway)

#### **3. Environment Variables Not Working**
```
Cannot read property 'VITE_API_URL' of undefined
```
**Fix**: Make sure environment variables are set in Vercel dashboard

#### **4. 404 API Errors**
```
GET https://your-app.vercel.app/api/auth/login 404
```
**Fix**: Check that `VITE_API_URL` points to Railway, not Vercel

---

## 📋 **Deployment Checklist**

### **Backend (Railway):**
- [ ] Repository connected to Railway
- [ ] Environment variables configured
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Health endpoint responding
- [ ] CORS configured for Vercel domain

### **Frontend (Vercel):**
- [ ] `VITE_API_URL` pointing to Railway
- [ ] Build completing successfully
- [ ] API calls working in production
- [ ] Authentication flow working

### **Database (MongoDB Atlas):**
- [ ] IP whitelist includes Railway IPs (`0.0.0.0/0`)
- [ ] Connection string working
- [ ] Data accessible from Railway

---

## 🎉 **Expected URLs**

After successful deployment:

- **Frontend**: `https://trade-pro-username.vercel.app`
- **Backend**: `https://tradepro-backend.railway.app`
- **API Health**: `https://tradepro-backend.railway.app/api/health`
- **Database**: MongoDB Atlas (cloud)

---

## 🚀 **Quick Commands**

```bash
# Commit your API fixes
git add .
git commit -m "fix: Update API calls to use dynamic configuration for production"
git push origin main

# This will trigger auto-deployment on both Vercel and Railway
```

---

## 💡 **Pro Tips**

1. **Always test locally first**: `npm run dev` + `npm run server`
2. **Check browser console**: Look for API errors
3. **Monitor Railway logs**: Check for server errors
4. **Use health endpoint**: Quick way to verify backend is running
5. **Environment-specific configs**: Different URLs for dev/prod

---

**Your TradePro app should now work perfectly on Vercel! 🎯**
