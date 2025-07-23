'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Bell, Heart, Home, LogOut, Menu, Search, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavTranslations {
  appName: string;
  shortName: string;
  requests: string;
  findDonors: string;
  dashboard: string;
  profile: string;
  logout: string;
}

interface NavigationProps {
  lang: string;
  translations: NavTranslations;
}

export function Navigation({ lang, translations }: NavigationProps) {
  const { user, firebaseUser, logout } = useAuth();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${lang}`);
      setShowMobileMenu(false);
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900">Blood for Bangladesh</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/requests" className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
              <Heart className="w-4 h-4" />
              <span>Active Requests</span>
            </Link>
            
            <Link href="/search" className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
              <Search className="w-4 h-4" />
              <span>Find Donors</span>
            </Link>
            
            {user && (
              <>
                <Link href="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/request" className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
                  <Bell className="w-4 h-4" />
                  <span>Request Blood</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && firebaseUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
}
