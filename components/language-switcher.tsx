'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const languages = [
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

interface LanguageSwitcherProps {
  currentLang: string;
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const switchLanguage = (newLocale: string) => {
    // Remove the current locale from the pathname if it exists
    const pathWithoutLocale = pathname.startsWith(`/${currentLang}`) 
      ? pathname.slice(`/${currentLang}`.length) 
      : pathname;
    
    // Add the new locale prefix
    const newPath = `/${newLocale}${pathWithoutLocale || ''}`;

    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
      >
        <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <span className="sm:hidden">{currentLanguage.flag}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] bg-white rounded-md border shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md flex items-center gap-2 ${
                currentLang === lang.code ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLang === lang.code && (
                <span className="ml-auto text-blue-600 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
