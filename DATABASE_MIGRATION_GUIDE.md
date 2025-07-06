# 🔄 Database Migration Guide

## MongoDB Local → MongoDB Atlas Migration

This guide will help you migrate your TradePro data from local MongoDB to MongoDB Atlas.

---

## 🎯 **Quick Migration (Recommended)**

### **Option 1: Automated Setup**
```bash
# Run complete setup (updates config + migrates data)
npm run setup-atlas
```

### **Option 2: Step by Step**
```bash
# Step 1: Update database configuration
npm run update-db-config

# Step 2: Migrate your data
npm run migrate-db

# Step 3: Start your server
npm run server
```

---

## 📋 **Manual Migration Steps**

### **Step 1: Update Configuration**
```bash
node update-database-config.js
```
This will:
- Update your `.env` file with the new MongoDB Atlas URL
- Create `.env` from `.env.example` if it doesn't exist

### **Step 2: Run Migration**
```bash
node migrate-database.js
```
This will:
- Connect to both local MongoDB and MongoDB Atlas
- Copy all your data (Users, Stocks, Portfolios, Transactions, Watchlists)
- Show migration progress and summary

### **Step 3: Verify Migration**
```bash
npm run server
```
Start your server and check that all data is available.

---

## 🗄️ **Database Details**

### **New MongoDB Atlas Configuration:**
- **Connection String**: `mongodb+srv://h10dewangan:groww@cluster0.jezzunf.mongodb.net/tradepro?retryWrites=true&w=majority&appName=Cluster0`
- **Database Name**: `tradepro`
- **Cluster**: `Cluster0`
- **Username**: `h10dewangan`

### **Collections to be Migrated:**
- ✅ **Users** - User accounts and authentication data
- ✅ **Stocks** - Stock information and pricing data
- ✅ **Portfolios** - User holdings and investments
- ✅ **Transactions** - Trading history and records
- ✅ **Watchlists** - User watchlist data

---

## ⚠️ **Important Notes**

### **Before Migration:**
1. **Backup your local data** (optional but recommended)
2. **Ensure local MongoDB is running** for data export
3. **Check internet connection** for Atlas access

### **During Migration:**
- The script will ask before overwriting existing data
- Migration preserves all data relationships and IDs
- Progress is shown for each collection

### **After Migration:**
- Your app will automatically use MongoDB Atlas
- Local database remains unchanged (backup)
- All features should work exactly the same

---

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Local MongoDB Not Running**
```bash
# Error: Failed to connect to local MongoDB
# Solution: Start MongoDB service
mongod
```

#### **2. Atlas Connection Failed**
```bash
# Error: Failed to connect to MongoDB Atlas
# Solution: Check internet connection and credentials
```

#### **3. No Data to Migrate**
```bash
# Warning: No data found in local database
# Solution: Make sure you're using the correct local database name
```

#### **4. Authentication Error**
```bash
# Error: Authentication failed
# Solution: Verify MongoDB Atlas credentials in the connection string
```

---

## 📊 **Migration Script Features**

### **Safety Features:**
- ✅ **Non-destructive** - Local data is never deleted
- ✅ **Confirmation prompts** - Asks before overwriting existing data
- ✅ **Error handling** - Graceful failure with clear error messages
- ✅ **Progress tracking** - Shows migration status for each collection

### **Migration Statistics:**
The script provides detailed statistics:
- Number of records migrated per collection
- Total migration time
- Success/failure status
- Summary report

---

## 🚀 **Post-Migration Steps**

### **1. Test Your Application**
```bash
npm run server
npm run dev
```

### **2. Verify Data Integrity**
- Login to your application
- Check portfolio data
- Verify transaction history
- Test trading functionality

### **3. Update Production Configuration**
- Update deployment environment variables
- Configure production MongoDB Atlas settings
- Test in staging environment

---

## 🔐 **Security Best Practices**

### **Environment Variables:**
- Never commit `.env` file to Git
- Use different databases for development/production
- Rotate database passwords regularly

### **MongoDB Atlas Security:**
- Enable IP whitelisting
- Use strong passwords
- Enable database auditing
- Regular security updates

---

## 📞 **Support**

If you encounter any issues during migration:

1. **Check the console output** for detailed error messages
2. **Verify database connections** are working
3. **Ensure all dependencies** are installed (`npm install`)
4. **Contact support** if problems persist

---

## ✅ **Migration Checklist**

- [ ] Local MongoDB is running
- [ ] Internet connection is stable
- [ ] Backup created (optional)
- [ ] Configuration updated (`npm run update-db-config`)
- [ ] Data migrated (`npm run migrate-db`)
- [ ] Server tested (`npm run server`)
- [ ] Application functionality verified
- [ ] Production environment updated

---

**🎉 Congratulations! Your TradePro application is now using MongoDB Atlas!**
