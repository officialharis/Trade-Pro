# 📈 TradePro - Modern Trading Platform

A full-stack trading platform built with React and Node.js, inspired by Groww. This application provides a comprehensive stock trading experience with real-time data, portfolio management, and secure transactions.

![TradePro Dashboard](https://img.shields.io/badge/Status-Active-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-Latest-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## 🌟 **Live Demo**
- **Frontend**: [Your Deployed URL Here]
- **Backend API**: [Your API URL Here]

## 📸 **Screenshots**
*Add screenshots of your application here*

## 🚀 Features

### Core Trading Features
- **Real-time Stock Data**: Live stock prices and market indices
- **Buy/Sell Stocks**: Execute trades with real-time balance updates
- **Portfolio Management**: Track holdings, P&L, and performance
- **Watchlist**: Monitor favorite stocks
- **Transaction History**: Complete trading history with detailed records

### User Experience
- **Advanced Search**: Real-time stock search with keyboard navigation
- **Interactive Charts**: Dynamic price charts with multiple timeframes
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Responsive Design**: Optimized for desktop and mobile devices
- **Wallet Management**: Deposit/withdraw funds with Razorpay integration

### Security & Authentication
- **JWT Authentication**: Secure user sessions
- **Password Encryption**: bcrypt hashing for user passwords
- **Protected Routes**: Authenticated access to trading features
- **Input Validation**: Comprehensive data validation

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1**: Modern React with hooks and context
- **React Router DOM 6.22.0**: Client-side routing
- **Vite 5.4.2**: Fast build tool and development server
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Recharts 2.12.1**: Interactive charts and data visualization

### Backend
- **Node.js**: JavaScript runtime
- **Express.js 4.18.2**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Razorpay 2.9.2**: Payment gateway integration

### Development Tools
- **TypeScript 5.5.3**: Type safety and better development experience
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 📁 Project Structure

```
TradePro/
├── src/                          # Frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Navbar.jsx           # Navigation bar with search
│   │   ├── Sidebar.jsx          # Side navigation
│   │   ├── StockCard.jsx        # Stock display component
│   │   ├── StockChart.jsx       # Interactive price charts
│   │   └── Wallet.jsx           # Wallet management component
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.jsx      # Authentication state
│   │   ├── PortfolioContext.jsx # Portfolio and trading state
│   │   ├── ThemeContext.jsx     # Dark/light mode
│   │   └── WalletContext.jsx    # Wallet and balance state
│   ├── pages/                   # Main application pages
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── Login.jsx           # User authentication
│   │   ├── Signup.jsx          # User registration
│   │   ├── Stocks.jsx          # Stock listing page
│   │   ├── StockDetail.jsx     # Individual stock details
│   │   ├── Portfolio.jsx       # Portfolio management
│   │   ├── Watchlist.jsx       # Watchlist management
│   │   └── WalletPage.jsx      # Wallet operations
│   ├── data/                   # Static data and mock data
│   └── App.jsx                 # Main application component
├── server/                     # Backend source code
│   ├── models/                 # MongoDB data models
│   │   ├── User.js            # User schema with wallet
│   │   ├── Stock.js           # Stock data schema
│   │   ├── Portfolio.js       # User holdings schema
│   │   ├── Transaction.js     # Trading transactions
│   │   └── Watchlist.js       # User watchlists
│   ├── middleware/            # Express middleware
│   ├── routes/               # API route handlers
│   └── index.js              # Main server file
├── package.json              # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── .env                     # Environment variables
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/tradepro.git
cd tradepro
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/stock

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-tradepro-2024

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thisissecretkey
```

4. **Start MongoDB**
Make sure MongoDB is running on your system or configure MongoDB Atlas connection.

5. **Seed the database (optional)**
```bash
npm run seed
```

6. **Start the development servers**

In one terminal (Backend):
```bash
npm run server
```

In another terminal (Frontend):
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📊 Database Schema

### User Model
- Personal information and authentication
- Wallet with balance and transaction history
- Account settings and preferences

### Stock Model
- Company information and financial data
- Real-time pricing and market data
- Historical performance metrics

### Portfolio Model
- User stock holdings
- Average purchase price and quantities
- Performance tracking

### Transaction Model
- Complete trading history
- Buy/sell records with fees
- Timestamps and order details

## 🔧 Available Scripts

```bash
npm run dev          # Start frontend development server
npm run server       # Start backend server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

## 🎯 Key Features Explained

### 1. Authentication System
- **Secure Registration**: Email validation and password encryption
- **JWT-based Login**: Stateless authentication with 7-day token expiry
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Session Management**: Persistent login state across browser sessions

### 2. Trading Engine
- **Real-time Transactions**: Instant buy/sell execution with balance updates
- **Portfolio Tracking**: Automatic calculation of P&L and performance metrics
- **Fee Calculation**: Realistic brokerage fees, STT, and GST calculations
- **Order Management**: Support for market orders with future limit order capability

### 3. Wallet System
- **Digital Wallet**: Secure fund management with $1000 default balance
- **Razorpay Integration**: Real payment gateway with UPI, Cards, Net Banking
- **Transaction History**: Complete audit trail of all financial activities
- **Instant Updates**: Real-time balance updates across all components
- **Multiple Payment Methods**: Razorpay and manual deposit options

### 4. Search & Navigation
- **Intelligent Search**: Real-time stock search with fuzzy matching
- **Keyboard Navigation**: Arrow keys and Enter for power users
- **Quick Access**: Clickable dashboard cards for rapid navigation
- **Breadcrumb Navigation**: Clear path indication throughout the app

### 5. Data Visualization
- **Interactive Charts**: Responsive price charts with multiple timeframes
- **Market Indices**: Real-time display of major market indicators
- **Performance Metrics**: Visual P&L representation with color coding
- **Responsive Tables**: Sortable and filterable data displays

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **JWT Tokens**: Signed tokens with expiration for session management
- **Input Validation**: Server-side validation for all user inputs
- **CORS Protection**: Configured cross-origin resource sharing
- **Environment Variables**: Sensitive data stored in environment files
- **Error Handling**: Comprehensive error handling without data exposure

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Trading
- `POST /api/portfolio/buy` - Execute buy order
- `POST /api/portfolio/sell` - Execute sell order
- `GET /api/portfolio/holdings` - Get user holdings
- `GET /api/transactions` - Get transaction history

### Wallet
- `GET /api/wallet` - Get wallet balance and transactions
- `POST /api/wallet/deposit` - Add funds to wallet (manual)
- `POST /api/wallet/withdraw` - Withdraw funds from wallet

### Payment (Razorpay)
- `POST /api/payment/create-order` - Create Razorpay payment order
- `POST /api/payment/verify` - Verify payment and add funds to wallet

### Stocks
- `GET /api/stocks` - Get all available stocks
- `GET /api/stocks/:symbol` - Get specific stock details
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🎨 UI/UX Features

### Design System
- **Consistent Branding**: Custom color palette with Groww-inspired theme
- **Typography**: Inter font family for modern, readable text
- **Spacing**: Systematic spacing using Tailwind's spacing scale
- **Animations**: Smooth transitions and hover effects

### Responsive Design
- **Mobile-First**: Optimized for mobile devices with progressive enhancement
- **Flexible Layouts**: CSS Grid and Flexbox for adaptive layouts
- **Touch-Friendly**: Appropriate touch targets for mobile interaction
- **Cross-Browser**: Compatible with modern browsers

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility for all features
- **Color Contrast**: WCAG-compliant color combinations
- **Screen Reader**: Semantic HTML and ARIA labels
- **Focus Management**: Clear focus indicators and logical tab order

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Bundle Optimization**: Vite's efficient bundling and tree shaking
- **Image Optimization**: Optimized stock logos and icons
- **Caching**: Browser caching for static assets
- **Database Indexing**: Optimized MongoDB queries with proper indexing

## 🧪 Testing Strategy

### Frontend Testing
- Component unit tests with React Testing Library
- Integration tests for user workflows
- E2E tests for critical trading paths

### Backend Testing
- API endpoint testing with Jest/Supertest
- Database integration tests
- Authentication and authorization tests

## 📱 Mobile Experience

- **Progressive Web App**: PWA capabilities for mobile installation
- **Touch Gestures**: Swipe navigation and touch-friendly interactions
- **Offline Support**: Basic offline functionality for viewing portfolio
- **Push Notifications**: Real-time trading alerts (future feature)

## 🔄 State Management

### Context Architecture
- **AuthContext**: User authentication and session state
- **PortfolioContext**: Holdings, transactions, and trading operations
- **WalletContext**: Balance management and wallet transactions
- **ThemeContext**: Dark/light mode preferences

### Data Flow
1. User actions trigger context methods
2. Context methods make API calls to backend
3. Backend processes requests and updates database
4. Response updates context state
5. UI components re-render with new state

## 🛡️ Error Handling

- **Frontend**: User-friendly error messages with retry options
- **Backend**: Structured error responses with appropriate HTTP codes
- **Database**: Connection error handling and retry logic
- **Network**: Offline detection and graceful degradation

## 📈 Future Enhancements

### Planned Features
- **Real Market Data**: Integration with live stock market APIs
- **Advanced Charts**: Technical indicators and drawing tools
- **Options Trading**: Support for options and derivatives
- **Social Features**: Community discussions and stock recommendations
- **Mobile App**: Native iOS and Android applications
- **AI Insights**: Machine learning-powered stock recommendations

### Technical Improvements
- **Microservices**: Split backend into specialized services
- **Redis Caching**: Implement caching for frequently accessed data
- **WebSocket**: Real-time price updates without polling
- **Docker**: Containerization for easier deployment
- **CI/CD**: Automated testing and deployment pipelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Inspired by Groww's clean and intuitive design
- React and Node.js communities for excellent documentation
- MongoDB for flexible data modeling
- Tailwind CSS for rapid UI development
- Lucide React for beautiful icons

## 📞 Support

For support, email support@tradepro.com or join our Slack channel.

---

**Happy Trading! 📈**
