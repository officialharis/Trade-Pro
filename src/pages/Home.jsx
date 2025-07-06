import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  TrendingUp,
  Shield,
  Smartphone,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-groww-primary" />,
      title: "Smart Trading",
      description: "Execute trades with real-time market data and advanced analytics"
    },
    {
      icon: <Shield className="w-8 h-8 text-groww-primary" />,
      title: "Secure & Safe",
      description: "Bank-grade security with encrypted transactions and data protection"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-groww-primary" />,
      title: "Mobile First",
      description: "Trade on the go with our responsive design and mobile-optimized interface"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-groww-primary" />,
      title: "Advanced Analytics",
      description: "Make informed decisions with comprehensive charts and market insights"
    },
    {
      icon: <Users className="w-8 h-8 text-groww-primary" />,
      title: "Community Driven",
      description: "Join thousands of traders and learn from market experts"
    },
    {
      icon: <Zap className="w-8 h-8 text-groww-primary" />,
      title: "Lightning Fast",
      description: "Execute trades in milliseconds with our high-performance platform"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Traders" },
    { number: "$2B+", label: "Trading Volume" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/')}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-groww-primary to-groww-secondary rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-groww-primary to-groww-secondary bg-clip-text text-transparent">
                    TradePro
                  </h1>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-groww-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-groww-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-groww-secondary transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-groww-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium bg-groww-primary text-white hover:bg-groww-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-groww-primary to-groww-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trade Smarter, <br />
              <span className="text-groww-light">Grow Faster</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-groww-light max-w-3xl mx-auto">
              Join thousands of traders who trust TradePro for their investment journey. 
              Start with $1000 free virtual money and experience professional trading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-groww-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Start Trading Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-groww-primary transition-colors"
              >
                Login to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-groww-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose TradePro?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the future of trading with our cutting-edge platform designed for both beginners and professionals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join TradePro today and get $1000 virtual money to start your trading journey risk-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-groww-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-groww-secondary transition-colors inline-flex items-center justify-center"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-groww-primary text-groww-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-groww-primary hover:text-white transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-groww-primary mb-4">TradePro</h3>
            <p className="text-gray-400 mb-6">
              Your trusted partner in the world of trading and investments.
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/signup" className="text-gray-400 hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
              © 2024 TradePro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
