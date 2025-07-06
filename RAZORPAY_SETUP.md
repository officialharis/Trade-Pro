# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment gateway integration for the TradePro trading platform.

## 🚀 Quick Start (Mock Mode)

The application is currently configured to work in **mock mode** without requiring real Razorpay credentials. This allows you to test the payment flow immediately.

### Mock Mode Features:
- ✅ Simulates payment processing
- ✅ Updates wallet balance
- ✅ Creates transaction records
- ✅ No real money involved
- ✅ Works without Razorpay account

## 🔧 Setting Up Real Razorpay Integration

To use real Razorpay payments, follow these steps:

### Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account or log in
3. Complete the KYC verification process
4. Navigate to **Settings** → **API Keys**

### Step 2: Get Test Credentials

1. In the Razorpay Dashboard, switch to **Test Mode**
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key**
4. Copy the **Key ID** and **Key Secret**

### Step 3: Update Environment Variables

Replace the placeholder values in your `.env` file:

```env
# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

### Step 4: Test Payment Methods

Once configured with real credentials, you can test with:

#### Test UPI IDs:
- `success@razorpay` - Always succeeds
- `failure@razorpay` - Always fails

#### Test Cards:
- **Visa**: `4111 1111 1111 1111`
- **Mastercard**: `5555 5555 5555 4444`
- **Rupay**: `6521 1111 1111 1111`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

#### Test Net Banking:
- Select any bank from the list
- Use the test credentials provided by Razorpay

## 🛡️ Security Best Practices

### Environment Variables
- Never commit real API keys to version control
- Use different keys for test and production
- Rotate keys regularly

### Webhook Security
- Always verify payment signatures
- Use HTTPS for webhook endpoints
- Implement proper error handling

## 🔄 Payment Flow

### Current Implementation:

1. **Order Creation**: `/api/payment/create-order`
   - Creates Razorpay order
   - Returns order details to frontend

2. **Payment Processing**: Frontend
   - Opens Razorpay checkout
   - User completes payment
   - Razorpay returns payment details

3. **Payment Verification**: `/api/payment/verify`
   - Verifies payment signature
   - Updates wallet balance
   - Creates transaction record

## 🧪 Testing the Integration

### Mock Mode Testing:
1. Start the application
2. Go to Wallet page
3. Click "Add Funds"
4. Select "Razorpay" payment method
5. Enter amount and click "Pay with Razorpay"
6. Mock payment will process automatically

### Real Razorpay Testing:
1. Configure real test credentials
2. Follow the same steps as mock mode
3. Use test payment methods listed above
4. Verify payments in Razorpay Dashboard

## 🚨 Troubleshooting

### Common Issues:

#### "Failed to create payment order"
- Check if RAZORPAY_KEY_ID is set correctly
- Verify RAZORPAY_KEY_SECRET is valid
- Ensure you're using test keys for test mode

#### "Invalid payment signature"
- Check if RAZORPAY_KEY_SECRET matches the key used for order creation
- Verify the signature verification logic

#### "Payment gateway not configured"
- Environment variables are not loaded
- Restart the server after updating .env file

### Debug Mode:
The server logs detailed information about payment processing. Check the console for:
- Order creation attempts
- Payment verification steps
- Error messages and stack traces

## 📱 Production Deployment

### Before Going Live:

1. **Get Live Credentials**:
   - Complete Razorpay KYC verification
   - Generate live API keys
   - Update environment variables

2. **Security Checklist**:
   - Enable webhook signature verification
   - Use HTTPS for all endpoints
   - Implement rate limiting
   - Add proper error handling

3. **Testing**:
   - Test with small amounts first
   - Verify webhook handling
   - Check transaction reconciliation

## 🔗 Useful Links

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Test Credentials](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Webhook Setup](https://razorpay.com/docs/webhooks/)
- [API Reference](https://razorpay.com/docs/api/)

## 💡 Tips

- Always test in test mode before going live
- Keep test and live credentials separate
- Monitor payment success rates
- Implement proper error handling for failed payments
- Use webhooks for reliable payment status updates

---

**Note**: The current implementation uses mock mode by default, allowing you to test the payment flow without real Razorpay credentials. This is perfect for development and demonstration purposes.
