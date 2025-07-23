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
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href={`/${lang}`} className="flex items-center space-x-2">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              <span className="hidden sm:inline">{translations.appName}</span>
              <span className="sm:hidden">{translations.shortName}</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href={`/${lang}/requests`} className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
              <Heart className="w-4 h-4" />
              <span>{translations.requests}</span>
            </Link>
            
            <Link href={`/${lang}/search`} className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
              <Search className="w-4 h-4" />
              <span>{translations.findDonors}</span>
            </Link>
            
            {user && (
              <>
                <Link href={`/${lang}/dashboard`} className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
                  <Home className="w-4 h-4" />
                  <span>{translations.dashboard}</span>
                </Link>
                <Link href={`/${lang}/request`} className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
                  <Bell className="w-4 h-4" />
                  <span>Request Blood</span>
                </Link>
              </>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher currentLang={lang} />
            
            {user && firebaseUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 max-w-24 truncate">{user.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href={`/${lang}/profile`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{translations.profile}</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="w-4 h-4" />
                          <span>{translations.logout}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/${lang}/auth/login`}>
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher currentLang={lang} />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
              {showMobileMenu ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                href={`/${lang}/requests`}
                className="text-gray-600 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>{translations.requests}</span>
                </div>
              </Link>
              
              <Link
                href={`/${lang}/search`}
                className="text-gray-600 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>{translations.findDonors}</span>
                </div>
              </Link>

              {user && (
                <>
                  <Link
                    href={`/${lang}/dashboard`}
                    className="text-gray-600 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    <div className="flex items-center space-x-2">
                      <Home className="w-5 h-5" />
                      <span>{translations.dashboard}</span>
                    </div>
                  </Link>
                  <Link
                    href={`/${lang}/request`}
                    className="text-gray-600 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Request Blood</span>
                    </div>
                  </Link>
                  <Link
                    href={`/${lang}/profile`}
                    className="text-gray-600 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>{translations.profile}</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-gray-600 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      <LogOut className="w-5 h-5" />
                      <span>{translations.logout}</span>
                    </div>
                  </button>
                </>
              )}

              {!user && (
                <Link
                  href={`/${lang}/auth/login`}
                  className="text-gray-600 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
