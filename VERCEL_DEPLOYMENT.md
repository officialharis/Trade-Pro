# TradePro - Vercel Deployment Guide

This guide will help you deploy the TradePro trading platform to Vercel using GitHub integration.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas**: Database should be set up and accessible
4. **Razorpay Account** (Optional): For payment functionality

## Project Structure

The project has been restructured for Vercel deployment:

```
project/
├── api/                    # Serverless API functions
│   ├── index.js           # Main API routes (auth, health)
│   ├── stocks.js          # Stock-related endpoints
│   ├── portfolio.js       # Portfolio management
│   ├── wallet.js          # Wallet operations
│   ├── payment.js         # Razorpay payment integration
│   ├── market.js          # Market data
│   ├── transactions.js    # Transaction history
│   ├── watchlist.js       # Watchlist management
│   └── dashboard.js       # Dashboard statistics
├── src/                   # Frontend React application
├── server/                # Original server code (models, etc.)
├── dist/                  # Built frontend files
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies and scripts
```

## Deployment Steps

### 1. Push Code to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it as a Vite project

### 3. Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

**Required Variables:**
```
MONGODB_URI=mongodb+srv://h10dewangan:groww@cluster0.jezzunf.mongodb.net/tradepro?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-here-groww-2024
NODE_ENV=production
```

**Optional Variables:**
```
CORS_ORIGIN=https://your-app-name.vercel.app
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
VITE_API_URL=https://your-app-name.vercel.app/api
```

### 4. Deploy

1. Click "Deploy" in Vercel
2. Vercel will build and deploy your application
3. You'll get a URL like `https://your-app-name.vercel.app`

## API Endpoints

After deployment, your API will be available at:

- **Base URL**: `https://your-app-name.vercel.app/api`
- **Health Check**: `/api/health`
- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Stocks**: `/api/stocks`
- **Portfolio**: `/api/portfolio`
- **Wallet**: `/api/wallet`
- **Payments**: `/api/payment`
- **Market Data**: `/api/market`
- **Transactions**: `/api/transactions`
- **Watchlist**: `/api/watchlist`
- **Dashboard**: `/api/dashboard`

## Environment Variables Explained

### Database
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT token generation

### Payment Gateway
- `RAZORPAY_KEY_ID`: Your Razorpay test key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay test key secret

### CORS & API
- `CORS_ORIGIN`: Your Vercel app URL for CORS configuration
- `VITE_API_URL`: Frontend API base URL (optional, defaults to same domain)

## Troubleshooting

### Common Issues

1. **API Routes Not Working**
   - Check that all environment variables are set
   - Verify MongoDB connection string is correct
   - Check Vercel function logs in the dashboard

2. **CORS Errors**
   - Set `CORS_ORIGIN` to your Vercel app URL
   - Make sure the frontend is making requests to the correct API URL

3. **Database Connection Issues**
   - Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Check that the connection string includes the database name
   - Ensure the MongoDB user has read/write permissions

4. **Payment Issues**
   - Razorpay keys should be test keys (starting with `rzp_test_`)
   - If Razorpay keys are not set, the app will use mock payment mode

### Checking Logs

1. Go to your Vercel project dashboard
2. Click on "Functions" tab
3. Click on any API function to see logs
4. Check for errors in the function execution

## Testing the Deployment

1. **Frontend**: Visit your Vercel app URL
2. **API Health**: Visit `https://your-app-name.vercel.app/api/health`
3. **Database**: Try registering a new user
4. **Payments**: Test the add funds functionality

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `CORS_ORIGIN` environment variable to your custom domain

## Updating the Application

To update your deployed application:

1. Push changes to your GitHub repository
2. Vercel will automatically redeploy
3. Check the deployment status in your Vercel dashboard

## Performance Optimization

- Vercel automatically optimizes your static assets
- API functions are serverless and scale automatically
- Database queries are optimized for performance
- Consider adding Redis for caching (optional)

## Security Notes

- All environment variables are encrypted in Vercel
- JWT tokens expire after 7 days
- API endpoints require authentication where appropriate
- CORS is configured to only allow requests from your domain

## Support

If you encounter issues:

1. Check Vercel function logs
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check MongoDB Atlas connection and permissions

Your TradePro application should now be successfully deployed on Vercel! 🚀
