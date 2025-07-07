// Simple API test script for Vercel deployment
// Run this after deployment to verify all endpoints are working

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

const testEndpoints = [
  {
    name: 'Health Check',
    url: `${API_BASE}/health`,
    method: 'GET'
  },
  {
    name: 'Database Health',
    url: `${API_BASE}/health/db`,
    method: 'GET'
  },
  {
    name: 'Market Indices',
    url: `${API_BASE}/market?type=indices`,
    method: 'GET'
  },
  {
    name: 'Trending Stocks',
    url: `${API_BASE}/market?type=trending&category=gainers&limit=5`,
    method: 'GET'
  },
  {
    name: 'All Stocks',
    url: `${API_BASE}/stocks?limit=10`,
    method: 'GET'
  }
];

async function testAPI() {
  console.log('🧪 Testing TradePro API Endpoints...\n');
  
  for (const test of testEndpoints) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${test.name}: OK`);
        if (test.name === 'Health Check') {
          console.log(`   Status: ${data.status}`);
          console.log(`   Database: ${data.database}`);
        }
      } else {
        console.log(`❌ ${test.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🎉 API testing complete!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI();
}

export { testAPI };
