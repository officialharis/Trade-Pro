import React from 'react';
import Wallet from '../components/Wallet';

const WalletPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your funds and view transaction history</p>
      </div>

      {/* Wallet Component */}
      <Wallet />
    </div>
  );
};

export default WalletPage;
