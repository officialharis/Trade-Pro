export const stocksData = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2456.75,
    change: 45.30,
    changePercent: 1.88,
    marketCap: "16,65,432",
    sector: "Oil & Gas",
    pe: 24.5,
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/1181288/pexels-photo-1181288.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
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
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  }
];

export const generateChartData = (basePrice, days = 30) => {
  const data = [];
  let price = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some randomness to price movement
    const change = (Math.random() - 0.5) * basePrice * 0.05;
    price = Math.max(price + change, basePrice * 0.8);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  
  return data;
};

export const marketIndices = [
  {
    name: "NIFTY 50",
    value: 19865.20,
    change: 245.30,
    changePercent: 1.25
  },
  {
    name: "SENSEX",
    value: 66589.93,
    change: 503.27,
    changePercent: 0.76
  },
  {
    name: "NIFTY BANK",
    value: 44732.85,
    change: -123.45,
    changePercent: -0.28
  },
  {
    name: "NIFTY IT",
    value: 30456.70,
    change: 892.15,
    changePercent: 3.02
  }
];