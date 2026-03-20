'use client';

import { useAuth } from './AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/escalations', label: 'Escalations', icon: '📋' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            🔔
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Plum</h1>
            <p className="text-xs text-gray-600 font-medium">Escalation Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div className="text-left flex-1">
              <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
            </div>
            <span className="text-gray-400">▼</span>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium text-sm rounded-lg transition"
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>

        {/* User Email */}
        <div className="text-xs text-gray-500 px-3 py-2 bg-gray-50 rounded">
          <p className="font-medium text-gray-700">Email:</p>
          <p className="break-all">{user?.email}</p>
        </div>
      </div>
    </nav>
  );
}
