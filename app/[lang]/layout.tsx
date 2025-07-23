import { Navigation } from "@/components/navigation";
import { PWAInstallPrompt } from "@/components/pwa-install";
import { AuthProvider } from "@/lib/auth-context";
import { Geist, Geist_Mono } from "next/font/google";
import '../globals.css';
import { getDictionary } from './dictionaries';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Generate static params for supported locales
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bn' }];
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Navigation lang={lang} translations={dict.nav} />
          <PWAInstallPrompt />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
