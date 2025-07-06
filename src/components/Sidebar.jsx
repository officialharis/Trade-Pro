import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Heart,
  Wallet,
  PieChart,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stocks', icon: TrendingUp, label: 'Stocks' },
    { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { to: '/watchlist', icon: Heart, label: 'Watchlist' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
  ];

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-groww-light dark:bg-groww-primary/20 text-groww-primary dark:text-groww-secondary border border-groww-primary/20 dark:border-groww-primary/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;