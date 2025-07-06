#!/usr/bin/env node

/**
 * Database Configuration Update Script
 * Updates .env file to use MongoDB Atlas
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const NEW_MONGODB_URI = 'mongodb+srv://h10dewangan:groww@cluster0.jezzunf.mongodb.net/tradepro?retryWrites=true&w=majority&appName=Cluster0';

function updateEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  try {
    log('🔧 Updating .env file...', 'yellow');
    
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      log('📄 .env file not found, creating from .env.example...', 'blue');
      
      // Copy from .env.example if it exists
      const examplePath = path.join(__dirname, '.env.example');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        log('✅ Created .env file from .env.example', 'green');
      } else {
        // Create basic .env file
        const basicEnv = `# Database Configuration
MONGODB_URI=${NEW_MONGODB_URI}

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-tradepro-2024

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thisissecretkey
`;
        fs.writeFileSync(envPath, basicEnv);
        log('✅ Created basic .env file', 'green');
        return;
      }
    }
    
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update MONGODB_URI
    const mongoUriRegex = /^MONGODB_URI=.*$/m;
    if (mongoUriRegex.test(envContent)) {
      envContent = envContent.replace(mongoUriRegex, `MONGODB_URI=${NEW_MONGODB_URI}`);
      log('🔄 Updated existing MONGODB_URI', 'blue');
    } else {
      // Add MONGODB_URI if it doesn't exist
      envContent = `MONGODB_URI=${NEW_MONGODB_URI}\n${envContent}`;
      log('➕ Added MONGODB_URI to .env file', 'blue');
    }
    
    // Write updated content back to file
    fs.writeFileSync(envPath, envContent);
    log('✅ Successfully updated .env file', 'green');
    
    // Display the new configuration
    log('\n📋 New Database Configuration:', 'bright');
    log('═'.repeat(80), 'blue');
    log(`🌐 Database: MongoDB Atlas`, 'cyan');
    log(`📍 Cluster: Cluster0`, 'cyan');
    log(`🗄️  Database Name: tradepro`, 'cyan');
    log(`👤 Username: h10dewangan`, 'cyan');
    log('═'.repeat(80), 'blue');
    
  } catch (error) {
    log(`❌ Error updating .env file: ${error.message}`, 'red');
  }
}

function displayInstructions() {
  log('\n📝 Next Steps:', 'bright');
  log('1. 🔄 Run migration: npm run migrate-db', 'yellow');
  log('2. 🚀 Start your server: npm run server', 'yellow');
  log('3. 🌐 Your app will now use MongoDB Atlas!', 'green');
  
  log('\n💡 Important Notes:', 'bright');
  log('• Make sure your local MongoDB is running for migration', 'yellow');
  log('• The migration script will preserve all your existing data', 'yellow');
  log('• Your app will automatically use the new database after migration', 'yellow');
  
  log('\n🔐 Security Reminder:', 'bright');
  log('• Never commit your .env file to Git', 'red');
  log('• Keep your database credentials secure', 'red');
  log('• Consider using environment-specific configurations', 'yellow');
}

// Run the update
if (require.main === module) {
  log('🚀 TradePro Database Configuration Update', 'bright');
  log('═'.repeat(50), 'blue');
  
  updateEnvFile();
  displayInstructions();
  
  log('\n🎉 Configuration update completed!', 'green');
}

module.exports = { updateEnvFile };
