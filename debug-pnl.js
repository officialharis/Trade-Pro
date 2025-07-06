// Debug script to check P&L calculation issues
// Run this with: node debug-pnl.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 TradePro P&L Debug Helper\n');

async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:5000/api/stocks');
    if (response.ok) {
      const stocks = await response.json();
      console.log('✅ Server is running');
      console.log(`📊 ${stocks.length} stocks available\n`);
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running');
    console.log('💡 Start server with: npm run server\n');
    return false;
  }
}

async function checkPortfolioData(token) {
  try {
    console.log('🔍 Checking portfolio data...');
    
    // Check regular portfolio endpoint
    const portfolioResponse = await fetch('http://localhost:5000/api/portfolio', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (portfolioResponse.ok) {
      const holdings = await portfolioResponse.json();
      console.log(`📈 Holdings found: ${holdings.length}`);
      
      if (holdings.length > 0) {
        console.log('Holdings details:');
        holdings.forEach((holding, index) => {
          console.log(`  ${index + 1}. ${holding.symbol} - Qty: ${holding.quantity}, Avg Price: $${holding.avgPrice}`);
        });
      } else {
        console.log('❌ No holdings found - this is why P&L is $0');
        console.log('💡 Try buying some stocks first!');
      }
    } else {
      console.log('❌ Failed to fetch portfolio data');
    }
    
    // Check debug endpoint
    const debugResponse = await fetch('http://localhost:5000/api/portfolio/debug', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('\n🔧 Debug Data:');
      console.log(`  User ID: ${debugData.userId}`);
      console.log(`  Total Portfolio Entries: ${debugData.totalPortfolioEntries}`);
      console.log(`  Active Holdings: ${debugData.activeHoldings}`);
      console.log(`  Recent Transactions: ${debugData.recentTransactions}`);
    }
    
  } catch (error) {
    console.log('❌ Error checking portfolio:', error.message);
  }
}

async function main() {
  console.log('Step 1: Checking server status...');
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    console.log('Please start the server first and try again.');
    rl.close();
    return;
  }
  
  rl.question('Enter your JWT token (from browser localStorage): ', async (token) => {
    if (!token) {
      console.log('❌ No token provided');
      console.log('💡 Get token from browser DevTools > Application > Local Storage > authToken');
      rl.close();
      return;
    }
    
    await checkPortfolioData(token);
    
    console.log('\n📋 P&L Troubleshooting Checklist:');
    console.log('1. ✅ Server is running');
    console.log('2. ❓ Do you have any stock holdings?');
    console.log('3. ❓ Have you made any buy transactions?');
    console.log('4. ❓ Are stock prices different from your purchase prices?');
    console.log('\n💡 If you have no holdings, buy some stocks to see P&L changes!');
    
    rl.close();
  });
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or install node-fetch');
  console.log('💡 Alternative: Check the data manually in your browser');
  process.exit(1);
}

main().catch(console.error);
