import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, Minus, DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';

// Custom Razorpay Payment Form Component
const RazorpayPaymentForm = ({ onPayment, processing, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const banks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda'
  ];

  const fillTestCard = () => {
    setCardDetails({
      number: '4111 1111 1111 1111',
      expiry: '12/25',
      cvv: '123',
      name: 'Test User'
    });
  };

  const fillTestUPI = () => {
    setUpiId('success@razorpay');
  };

  const handleCardInputChange = (field, value) => {
    if (field === 'number') {
      // Format card number with spaces
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    } else if (field === 'expiry') {
      // Format expiry as MM/YY
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) return;
    } else if (field === 'cvv') {
      // Only allow 3-4 digits
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }

    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let paymentDetails = { method: paymentMethod };

    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        alert('Please fill all card details');
        return;
      }
      paymentDetails.card = cardDetails;
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        alert('Please enter UPI ID');
        return;
      }
      paymentDetails.upi = upiId;
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        alert('Please select a bank');
        return;
      }
      paymentDetails.bank = selectedBank;
    }

    onPayment(paymentDetails);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Select Payment Method</h4>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <span className="text-xs font-medium text-gray-900 dark:text-white">Card</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'upi'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <Smartphone className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <span className="text-xs font-medium text-gray-900 dark:text-white">UPI</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('netbanking')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'netbanking'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <Building2 className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <span className="text-xs font-medium text-gray-900 dark:text-white">Net Banking</span>
          </button>
        </div>
      </div>

      {/* Payment Method Forms */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="font-medium text-gray-900 dark:text-white">Card Details</h5>
            <button
              type="button"
              onClick={fillTestCard}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              Use Test Card
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.number}
              onChange={(e) => handleCardInputChange('number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardDetails.name}
              onChange={(e) => handleCardInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              UPI ID
            </label>
            <button
              type="button"
              onClick={fillTestUPI}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              Use Test UPI
            </button>
          </div>
          <input
            type="text"
            placeholder="yourname@paytm"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your UPI ID (e.g., 9876543210@paytm, name@googlepay)
          </p>
        </div>
      )}

      {paymentMethod === 'netbanking' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Bank
          </label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose your bank</option>
            {banks.map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
};

const Wallet = () => {
  const { user } = useAuth();
  const { wallet, loading, deposit, withdraw, formatCurrency, refreshWallet, createRazorpayOrder, verifyRazorpayPayment } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalType, setModalType] = useState('deposit'); // 'deposit' or 'withdraw'
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'manual'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRazorpayPayment = async (amount) => {
    try {
      setProcessing(true);
      setError('');

      // Create Razorpay order
      const orderData = await createRazorpayOrder(amount);

      // Handle mock mode - show custom payment modal
      if (orderData.isMockMode) {
        console.log('Mock payment mode detected');
        setPaymentData(orderData);
        setShowPaymentModal(true);
        setProcessing(false);
        return;
      }

      // Real Razorpay payment
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TradePro',
        description: 'Add funds to wallet',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderData.amount
            };

            await verifyRazorpayPayment(verificationData);

            setShowModal(false);
            setAmount('');
            setDescription('');
            alert('Payment successful! Funds added to your wallet.');
          } catch (error) {
            setError('Payment verification failed: ' + error.message);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#00b386'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setProcessing(false);
    } catch (error) {
      setError('Failed to initiate payment: ' + error.message);
      setProcessing(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const transactionAmount = parseFloat(amount);
      if (isNaN(transactionAmount) || transactionAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (modalType === 'deposit') {
        if (paymentMethod === 'razorpay') {
          await handleRazorpayPayment(transactionAmount);
          return; // Don't set processing to false here as it's handled in Razorpay callback
        } else {
          await deposit(transactionAmount, description || 'Wallet deposit');
        }
      } else {
        await withdraw(transactionAmount, description || 'Wallet withdrawal');
      }

      setShowModal(false);
      setAmount('');
      setDescription('');
    } catch (error) {
      setError(error.message);
    } finally {
      if (modalType !== 'deposit' || paymentMethod !== 'razorpay') {
        setProcessing(false);
      }
    }
  };

  const handleCustomPayment = async (paymentDetails) => {
    try {
      setProcessing(true);
      setError('');

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const verificationData = {
        razorpay_order_id: paymentData.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
        amount: paymentData.amount,
        isMockPayment: true
      };

      await verifyRazorpayPayment(verificationData);

      setShowModal(false);
      setShowPaymentModal(false);
      setAmount('');
      setDescription('');
      setPaymentData(null);
      setProcessing(false);
      alert('Payment successful! Funds added to your wallet.');
    } catch (error) {
      setError('Payment verification failed: ' + error.message);
      setProcessing(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setError('');
    setAmount('');
    setDescription('');
    setPaymentMethod('razorpay'); // Default to Razorpay for deposits
  };

  const initializeWallet = async () => {
    try {
      const token = localStorage.getItem('groww_token');
      const response = await fetch('http://localhost:5000/api/wallet/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await refreshWallet();
        alert('Wallet initialized successfully!');
      } else {
        const error = await response.json();
        alert('Error initializing wallet: ' + error.message);
      }
    } catch (error) {
      console.error('Error initializing wallet:', error);
      alert('Error initializing wallet: ' + error.message);
    }
  };

  const debugWallet = async () => {
    try {
      const token = localStorage.getItem('groww_token');
      const response = await fetch('http://localhost:5000/api/wallet/debug', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const debugData = await response.json();
        console.log('Wallet Debug Data:', debugData);
        alert(`Debug Info:
Balance: ${debugData.wallet?.balance || 'undefined'}
Transactions: ${debugData.transactionCount}
Wallet Exists: ${debugData.walletExists}
Check console for full details`);
      }
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'WITHDRAWAL':
        return <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'STOCK_PURCHASE':
        return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'STOCK_SALE':
        return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
      case 'STOCK_SALE':
        return 'text-green-600 dark:text-green-400';
      case 'WITHDRAWAL':
      case 'STOCK_PURCHASE':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <WalletIcon className="w-5 h-5 text-groww-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wallet</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => openModal('deposit')}
              className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
            >
              Add Funds
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            >
              Withdraw
            </button>
            <button
              onClick={initializeWallet}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
            >
              Initialize
            </button>
            <button
              onClick={debugWallet}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
            >
              Debug
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(wallet.balance)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Raw balance: {wallet.balance} | Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Transactions</h4>
          <p className="text-xs text-gray-500 mb-2">Debug: {wallet.transactions?.length || 0} transactions found</p>
          {wallet.transactions && wallet.transactions.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {wallet.transactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No transactions yet
            </p>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {modalType === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
            </h3>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ({wallet.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              {modalType === 'deposit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-groww-primary focus:ring-groww-primary"
                      />
                      <CreditCard className="w-5 h-5 text-groww-primary" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Razorpay</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Pay with UPI, Cards, Net Banking (Mock mode for testing)
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="manual"
                        checked={paymentMethod === 'manual'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-groww-primary focus:ring-groww-primary"
                      />
                      <Plus className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Manual Add</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add funds directly (Test mode)</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                    modalType === 'deposit'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processing
                    ? 'Processing...'
                    : modalType === 'deposit'
                      ? (paymentMethod === 'razorpay' ? 'Pay with Razorpay' : 'Add Funds')
                      : 'Withdraw'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Razorpay Payment Modal */}
      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Razorpay Checkout</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Secure Payment Gateway</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentData(null);
                  setProcessing(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Amount to Pay:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{(paymentData.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{paymentData.orderId}</span>
                </div>
              </div>
            </div>

            {/* Test Credentials Helper */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Test Credentials (Demo Mode)</h5>
              <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <p><strong>Card:</strong> 4111 1111 1111 1111, Exp: 12/25, CVV: 123</p>
                <p><strong>UPI:</strong> success@razorpay or test@paytm</p>
                <p><strong>Net Banking:</strong> Select any bank</p>
              </div>
            </div>

            <RazorpayPaymentForm
              onPayment={handleCustomPayment}
              processing={processing}
              onCancel={() => {
                setShowPaymentModal(false);
                setPaymentData(null);
                setProcessing(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Wallet;
