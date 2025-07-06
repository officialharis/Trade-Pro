const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stock');

// Stock Schema
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  change: { type: Number, required: true },
  changePercent: { type: Number, required: true },
  marketCap: { type: String, required: true },
  sector: { type: String, required: true },
  pe: { type: Number, required: true },
  logo: { type: String, required: true },
  volume: { type: Number, default: 0 },
  high52w: Number,
  low52w: Number,
  dividend: Number,
  eps: Number,
  bookValue: Number
}, { timestamps: true });

const Stock = mongoose.model('Stock', stockSchema);

// Market Data Schema
const marketDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  date: { type: Date, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true }
}, { timestamps: true });

const MarketData = mongoose.model('MarketData', marketDataSchema);

// Sample stock data
const stocksData = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2456.75,
    change: 45.30,
    changePercent: 1.88,
    marketCap: "16,65,432",
    sector: "Oil & Gas",
    pe: 24.5,
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 1250000,
    high52w: 2856.00,
    low52w: 2100.00,
    dividend: 8.0,
    eps: 98.5,
    bookValue: 1245.30
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd",
    price: 3678.90,
    change: -23.45,
    changePercent: -0.63,
    marketCap: "13,42,567",
    sector: "IT Services",
    pe: 28.3,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 890000,
    high52w: 4150.00,
    low52w: 3200.00,
    dividend: 22.0,
    eps: 130.2,
    bookValue: 456.78
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    price: 1543.20,
    change: 12.85,
    changePercent: 0.84,
    marketCap: "11,78,943",
    sector: "Banking",
    pe: 18.7,
    logo: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 2100000,
    high52w: 1725.00,
    low52w: 1350.00,
    dividend: 19.0,
    eps: 82.5,
    bookValue: 678.90
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1432.60,
    change: 34.50,
    changePercent: 2.47,
    marketCap: "5,93,876",
    sector: "IT Services",
    pe: 22.1,
    logo: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 1560000,
    high52w: 1650.00,
    low52w: 1200.00,
    dividend: 16.0,
    eps: 64.8,
    bookValue: 345.67
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    price: 987.45,
    change: -8.30,
    changePercent: -0.83,
    marketCap: "6,89,234",
    sector: "Banking",
    pe: 16.4,
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 1890000,
    high52w: 1150.00,
    low52w: 850.00,
    dividend: 5.0,
    eps: 60.2,
    bookValue: 456.78
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever Ltd",
    price: 2567.80,
    change: 67.20,
    changePercent: 2.69,
    marketCap: "6,02,345",
    sector: "FMCG",
    pe: 56.8,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 450000,
    high52w: 2850.00,
    low52w: 2200.00,
    dividend: 18.0,
    eps: 45.2,
    bookValue: 123.45
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    price: 456.30,
    change: 5.70,
    changePercent: 1.27,
    marketCap: "5,67,890",
    sector: "FMCG",
    pe: 29.3,
    logo: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 3200000,
    high52w: 485.00,
    low52w: 380.00,
    dividend: 10.75,
    eps: 15.6,
    bookValue: 234.56
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    price: 623.75,
    change: -15.40,
    changePercent: -2.41,
    marketCap: "5,56,123",
    sector: "Banking",
    pe: 14.2,
    logo: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 2800000,
    high52w: 720.00,
    low52w: 480.00,
    dividend: 4.1,
    eps: 43.9,
    bookValue: 345.67
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    price: 876.90,
    change: 23.45,
    changePercent: 2.75,
    marketCap: "4,98,765",
    sector: "Telecom",
    pe: 35.6,
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 1670000,
    high52w: 950.00,
    low52w: 650.00,
    dividend: 2.75,
    eps: 24.6,
    bookValue: 156.78
  },
  {
    symbol: "ASIANPAINT",
    name: "Asian Paints Ltd",
    price: 3234.50,
    change: -89.60,
    changePercent: -2.70,
    marketCap: "3,10,987",
    sector: "Paints",
    pe: 67.4,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 340000,
    high52w: 3650.00,
    low52w: 2800.00,
    dividend: 15.4,
    eps: 48.0,
    bookValue: 234.56
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    price: 445.60,
    change: 8.90,
    changePercent: 2.04,
    marketCap: "2,45,678",
    sector: "IT Services",
    pe: 19.8,
    logo: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 1890000,
    high52w: 520.00,
    low52w: 380.00,
    dividend: 4.0,
    eps: 22.5,
    bookValue: 178.90
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki India Ltd",
    price: 9876.45,
    change: 234.50,
    changePercent: 2.43,
    marketCap: "2,98,765",
    sector: "Automobile",
    pe: 32.1,
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 120000,
    high52w: 11200.00,
    low52w: 8500.00,
    dividend: 45.0,
    eps: 307.8,
    bookValue: 1234.56
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance Ltd",
    price: 6789.30,
    change: -156.70,
    changePercent: -2.26,
    marketCap: "4,12,345",
    sector: "Financial Services",
    pe: 28.9,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 890000,
    high52w: 7800.00,
    low52w: 5200.00,
    dividend: 10.0,
    eps: 234.7,
    bookValue: 567.89
  },
  {
    symbol: "KOTAKBANK",
    name: "Kotak Mahindra Bank Ltd",
    price: 1789.60,
    change: 45.80,
    changePercent: 2.63,
    marketCap: "3,56,789",
    sector: "Banking",
    pe: 21.4,
    logo: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 1450000,
    high52w: 2100.00,
    low52w: 1500.00,
    dividend: 0.5,
    eps: 83.6,
    bookValue: 456.78
  },
  {
    symbol: "LT",
    name: "Larsen & Toubro Ltd",
    price: 2345.80,
    change: 67.90,
    changePercent: 2.98,
    marketCap: "3,29,876",
    sector: "Construction",
    pe: 25.6,
    logo: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    volume: 780000,
    high52w: 2650.00,
    low52w: 1950.00,
    dividend: 18.0,
    eps: 91.6,
    bookValue: 678.90
  }
];

// Function to generate chart data
const generateChartData = (symbol, basePrice, days = 365) => {
  const data = [];
  let price = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some randomness to price movement
    const change = (Math.random() - 0.5) * basePrice * 0.03;
    price = Math.max(price + change, basePrice * 0.7);
    
    const open = price;
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    
    data.push({
      symbol,
      date,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
    
    price = close;
  }
  
  return data;
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Stock.deleteMany({});
    await MarketData.deleteMany({});
    console.log('Cleared existing data');

    // Insert stocks
    await Stock.insertMany(stocksData);
    console.log('Inserted stock data');

    // Generate and insert market data for each stock
    for (const stock of stocksData) {
      const chartData = generateChartData(stock.symbol, stock.price);
      await MarketData.insertMany(chartData);
      console.log(`Generated chart data for ${stock.symbol}`);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();