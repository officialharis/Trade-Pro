import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import WalletPage from './pages/WalletPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WalletProvider>
          <PortfolioProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
              </Route>
              <Route path="/stocks" element={<Layout />}>
                <Route index element={<Stocks />} />
                <Route path=":symbol" element={<StockDetail />} />
              </Route>
              <Route path="/portfolio" element={<Layout />}>
                <Route index element={<Portfolio />} />
              </Route>
              <Route path="/watchlist" element={<Layout />}>
                <Route index element={<Watchlist />} />
              </Route>
              <Route path="/wallet" element={<Layout />}>
                <Route index element={<WalletPage />} />
              </Route>
            </Routes>
          </PortfolioProvider>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;