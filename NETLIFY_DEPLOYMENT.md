# 🚀 TradePro Netlify Deployment Guide

## Quick Netlify Deployment (GitHub Import Method)

### **🎯 Step 1: Deploy Backend to Railway First**

Before deploying to Netlify, you need a backend. Follow these steps:

#### **1. Deploy to Railway**
- Go to [railway.app](https://railway.app)
- Sign up/Login with GitHub
- Click **"New Project"** → **"Deploy from GitHub repo"**
- Select your **`Trade-Pro`** repository
- Railway will auto-detect Node.js

#### **2. Add Environment Variables in Railway**
```env
MONGODB_URI=mongodb+srv://h10dewangan:groww@cluster0.jezzunf.mongodb.net/tradepro?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-here-tradepro-2024
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-netlify-app.netlify.app
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thisissecretkey
```

#### **3. Get Your Railway URL**
- After deployment, copy your Railway URL (e.g., `https://tradepro-backend.railway.app`)

---

### **🌐 Step 2: Deploy Frontend to Netlify**

#### **Method A: GitHub Import (Recommended)**

1. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub

2. **Import Repository**
   - Click **"New site from Git"**
   - Choose **"GitHub"**
   - Select your **`Trade-Pro`** repository
   - Click **"Deploy site"**

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (leave empty)

4. **Add Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add these variables:
   ```env
   VITE_API_URL=https://your-railway-url.railway.app
   NODE_ENV=production
   VITE_APP_NAME=TradePro
   VITE_APP_VERSION=1.0.0
   ```

5. **Deploy**
   - Click **"Deploy site"**
   - Wait for build to complete
   - Your site will be live at: `https://random-name.netlify.app`

#### **Method B: Netlify CLI (Alternative)**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build Your Project**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

---

### **🔧 Step 3: Configure Custom Domain (Optional)**

1. **In Netlify Dashboard**
   - Go to **Domain settings**
   - Click **"Add custom domain"**
   - Enter your domain (e.g., `tradepro.com`)

2. **Update DNS**
   - Point your domain to Netlify's servers
   - Add CNAME record: `your-site.netlify.app`

3. **Enable HTTPS**
   - Netlify automatically provides SSL certificates
   - Force HTTPS redirect in settings

---

### **🎯 Step 4: Update CORS in Railway**

After getting your Netlify URL:

1. **Go to Railway Dashboard**
2. **Update Environment Variables**
   ```env
   CORS_ORIGIN=https://your-actual-netlify-url.netlify.app
   ```
3. **Redeploy Backend**

---

### **✅ Step 5: Test Your Application**

#### **1. Check Backend Health**
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

#### **2. Test Frontend Features**
- ✅ Home page loads
- ✅ Sign up works
- ✅ Login works
- ✅ Dashboard displays
- ✅ Stock trading works
- ✅ Portfolio updates
- ✅ Wallet functions

---

### **🔍 Troubleshooting**

#### **Common Issues:**

1. **Build Fails**
   ```
   Error: Command failed with exit code 1
   ```
   **Fix**: Check build logs, ensure all dependencies are in `package.json`

2. **API Calls Fail**
   ```
   TypeError: Failed to fetch
   ```
   **Fix**: Check `VITE_API_URL` environment variable in Netlify

3. **CORS Errors**
   ```
   Access blocked by CORS policy
   ```
   **Fix**: Update `CORS_ORIGIN` in Railway to match Netlify URL

4. **404 on Refresh**
   ```
   Page not found when refreshing /dashboard
   ```
   **Fix**: `netlify.toml` file handles this with redirects

5. **Environment Variables Not Working**
   ```
   Cannot read property 'VITE_API_URL' of undefined
   ```
   **Fix**: Ensure variables start with `VITE_` and are set in Netlify dashboard

---

### **📋 Deployment Checklist**

#### **Backend (Railway):**
- [ ] Repository deployed to Railway
- [ ] Environment variables configured
- [ ] Health endpoint responding (`/api/health`)
- [ ] CORS configured for Netlify domain
- [ ] MongoDB Atlas connection working

#### **Frontend (Netlify):**
- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] `netlify.toml` file in repository
- [ ] Build completing successfully
- [ ] Site accessible via Netlify URL

#### **Integration:**
- [ ] API calls working from Netlify to Railway
- [ ] Authentication flow working
- [ ] Trading functionality working
- [ ] Payment integration working

---

### **🎉 Expected URLs**

After successful deployment:

- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://tradepro-backend.railway.app`
- **API Health**: `https://tradepro-backend.railway.app/api/health`
- **Database**: MongoDB Atlas (cloud)

---

### **🚀 Quick Commands**

```bash
# Commit your changes
git add .
git commit -m "feat: Add Netlify deployment configuration"
git push origin main

# This will trigger auto-deployment on Netlify

# Manual deployment (if using CLI)
npm run build
netlify deploy --prod --dir=dist
```

---

### **💡 Pro Tips**

1. **Use Branch Deploys**: Netlify can deploy different branches for testing
2. **Enable Form Handling**: Netlify has built-in form processing
3. **Use Functions**: Netlify Functions for serverless backend features
4. **Monitor Performance**: Use Netlify Analytics
5. **Set up Notifications**: Get alerts for failed deployments

---

### **🔐 Security Best Practices**

1. **Environment Variables**: Never commit sensitive data
2. **HTTPS Only**: Force HTTPS redirects
3. **Security Headers**: Already configured in `netlify.toml`
4. **Content Security Policy**: Configured for Razorpay integration
5. **Regular Updates**: Keep dependencies updated

---

**Your TradePro app will be live on Netlify with professional hosting! 🎯**
