#!/usr/bin/env node

/**
 * Database Migration Script
 * Migrates data from local MongoDB to MongoDB Atlas
 * 
 * Usage: node migrate-database.cjs
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection strings
const LOCAL_DB = 'mongodb://localhost:27017/stock';
const ATLAS_DB = 'mongodb+srv://h10dewangan:groww@cluster0.jezzunf.mongodb.net/tradepro?retryWrites=true&w=majority&appName=Cluster0';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

class DatabaseMigrator {
  constructor() {
    this.localConnection = null;
    this.atlasConnection = null;
    this.migrationStats = {
      users: 0,
      stocks: 0,
      portfolios: 0,
      transactions: 0,
      watchlists: 0
    };
  }

  async connectToLocalDB() {
    try {
      log('🔌 Connecting to local MongoDB...', 'yellow');
      this.localConnection = await mongoose.createConnection(LOCAL_DB);
      log('✅ Connected to local MongoDB', 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to connect to local MongoDB: ${error.message}`, 'red');
      log('💡 Make sure MongoDB is running: mongod', 'yellow');
      return false;
    }
  }

  async connectToAtlasDB() {
    try {
      log('🌐 Connecting to MongoDB Atlas...', 'yellow');
      this.atlasConnection = await mongoose.createConnection(ATLAS_DB);
      log('✅ Connected to MongoDB Atlas', 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to connect to MongoDB Atlas: ${error.message}`, 'red');
      log('💡 Check your internet connection and Atlas credentials', 'yellow');
      return false;
    }
  }

  async migrateCollection(modelName, schemaDefinition) {
    try {
      log(`\n📦 Migrating ${modelName}...`, 'cyan');
      
      // Create schema for both connections
      const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
      
      // Get models for both connections
      const LocalModel = this.localConnection.model(modelName, schema);
      const AtlasModel = this.atlasConnection.model(modelName, schema);
      
      // Fetch data from local database
      const localData = await LocalModel.find({});
      log(`📊 Found ${localData.length} ${modelName} records in local database`, 'blue');
      
      if (localData.length === 0) {
        log(`⚠️  No ${modelName} data to migrate`, 'yellow');
        return 0;
      }
      
      // Check if data already exists in Atlas
      const existingCount = await AtlasModel.countDocuments({});
      if (existingCount > 0) {
        log(`⚠️  ${existingCount} ${modelName} records already exist in Atlas`, 'yellow');
        log(`⏭️  Skipping ${modelName} migration to avoid duplicates`, 'yellow');
        return 0;
      }
      
      // Insert data into Atlas database
      if (localData.length > 0) {
        await AtlasModel.insertMany(localData, { ordered: false });
        log(`✅ Successfully migrated ${localData.length} ${modelName} records`, 'green');
      }
      
      return localData.length;
    } catch (error) {
      log(`❌ Error migrating ${modelName}: ${error.message}`, 'red');
      return 0;
    }
  }

  async runMigration() {
    try {
      log('🚀 Starting database migration...', 'bright');
      log('📍 From: Local MongoDB (mongodb://localhost:27017/stock)', 'blue');
      log('📍 To: MongoDB Atlas (Cluster0)', 'blue');
      
      // Connect to both databases
      const localConnected = await this.connectToLocalDB();
      if (!localConnected) {
        log('❌ Cannot proceed without local database connection', 'red');
        return;
      }
      
      const atlasConnected = await this.connectToAtlasDB();
      if (!atlasConnected) {
        log('❌ Cannot proceed without Atlas database connection', 'red');
        return;
      }
      
      log('\n🔄 Starting data migration...', 'bright');
      
      // Define basic schemas for migration
      const userSchema = {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        wallet: {
          balance: { type: Number, default: 1000 },
          currency: { type: String, default: 'USD' },
          transactions: [{ type: mongoose.Schema.Types.Mixed }]
        }
      };

      const stockSchema = {
        symbol: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        changePercent: { type: Number, default: 0 },
        sector: String,
        marketCap: Number
      };

      const portfolioSchema = {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        symbol: { type: String, required: true },
        name: String,
        quantity: { type: Number, required: true },
        avgPrice: { type: Number, required: true },
        totalInvested: Number
      };

      const transactionSchema = {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        symbol: { type: String, required: true },
        type: { type: String, enum: ['buy', 'sell'], required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalAmount: Number,
        fees: Number
      };

      const watchlistSchema = {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        symbol: { type: String, required: true },
        name: String,
        addedAt: { type: Date, default: Date.now }
      };
      
      // Migrate each collection
      this.migrationStats.users = await this.migrateCollection('User', userSchema);
      this.migrationStats.stocks = await this.migrateCollection('Stock', stockSchema);
      this.migrationStats.portfolios = await this.migrateCollection('Portfolio', portfolioSchema);
      this.migrationStats.transactions = await this.migrateCollection('Transaction', transactionSchema);
      this.migrationStats.watchlists = await this.migrateCollection('Watchlist', watchlistSchema);
      
      // Display migration summary
      this.displayMigrationSummary();
      
    } catch (error) {
      log(`❌ Migration failed: ${error.message}`, 'red');
    } finally {
      // Close connections
      if (this.localConnection) {
        await this.localConnection.close();
        log('🔌 Closed local database connection', 'yellow');
      }
      if (this.atlasConnection) {
        await this.atlasConnection.close();
        log('🔌 Closed Atlas database connection', 'yellow');
      }
    }
  }

  displayMigrationSummary() {
    log('\n📊 Migration Summary:', 'bright');
    log('═'.repeat(50), 'blue');
    log(`👥 Users:        ${this.migrationStats.users}`, 'cyan');
    log(`📈 Stocks:       ${this.migrationStats.stocks}`, 'cyan');
    log(`💼 Portfolios:   ${this.migrationStats.portfolios}`, 'cyan');
    log(`💰 Transactions: ${this.migrationStats.transactions}`, 'cyan');
    log(`⭐ Watchlists:   ${this.migrationStats.watchlists}`, 'cyan');
    log('═'.repeat(50), 'blue');
    
    const totalRecords = Object.values(this.migrationStats).reduce((sum, count) => sum + count, 0);
    log(`🎉 Total records migrated: ${totalRecords}`, 'green');
    
    if (totalRecords > 0) {
      log('\n✅ Migration completed successfully!', 'green');
      log('🌐 Your data is now available in MongoDB Atlas', 'green');
      log('💡 Your app will now use the new database automatically', 'yellow');
    } else {
      log('\n⚠️  No data was migrated', 'yellow');
      log('💡 This could mean:', 'yellow');
      log('  • No data exists in local database', 'yellow');
      log('  • Data already exists in Atlas', 'yellow');
      log('  • Connection issues occurred', 'yellow');
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  migrator.runMigration().then(() => {
    log('\n🏁 Migration process completed', 'bright');
    process.exit(0);
  }).catch((error) => {
    log(`💥 Migration process failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = DatabaseMigrator;
