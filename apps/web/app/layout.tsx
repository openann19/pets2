import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../src/polyfills'; // Import polyfills first
import { Providers } from './providers';
import { SharedOverlayProvider, AnimationBudgetManager, AnimationBudgetDisplay, SoundToggle, CommandPaletteWrapper } from '../src/components/Animations';
import { globalCommands } from '../src/config/commands';
import ThemeToggle from '@/components/ThemeToggle';
import BackgroundProvider from '@/components/Background/BackgroundProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SafeAreaProvider } from '@/components/SafeAreaProvider';
import { MobileOptimizationInit } from '@/components/MobileOptimizationInit';

const inter = Inter({
  subsets: ['latin'], // Optimized subset for perf
  variable: '--font-inter', // Allow variable font usage in CSS
  display: 'swap', // Fallback during load
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Enable safe area handling for iOS
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ec4899' },
    { media: '(prefers-color-scheme: dark)', color: '#8b5cf6' },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: {
    default: 'PawfectMatch - Find Your Perfect Pet',
    template: '%s | PawfectMatch', // Dynamic page titles
  },
  description: 'Connect with your ideal pet companion through AI-powered matching',
  keywords: ['pet adoption', 'pet matching', 'dogs', 'cats', 'pets', 'adoption', 'AI pets'], // Expanded for better SEO
  authors: [{ name: 'PawfectMatch Team' }],
  creator: 'PawfectMatch',
  publisher: 'PawfectMatch',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PawfectMatch',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'PawfectMatch',
    'application-name': 'PawfectMatch',
    'msapplication-TileColor': '#ec4899',
    'msapplication-config': '/browserconfig.xml',
  },
  robots: 'index, follow', // SEO: Allow crawling
  openGraph: {
    title: 'PawfectMatch - Find Your Perfect Pet',
    description: 'Connect with your ideal pet companion through AI-powered matching',
    url: 'https://pawfectmatch.com',
    siteName: 'PawfectMatch',
    images: [
      {
        url: 'https://pawfectmatch.com/og-image.jpg', // Assume static asset; optimize for 1200x630
        width: 1200,
        height: 630,
        alt: 'PawfectMatch Logo with Pets',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PawfectMatch - Find Your Perfect Pet',
    description: 'Connect with your ideal pet companion through AI-powered matching',
    images: ['https://pawfectmatch.com/twitter-image.jpg'], // Separate for Twitter optimization
  },
  alternates: {
    canonical: 'https://pawfectmatch.com', // SEO: Canonical URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-inter min-h-screen bg-gray-50 text-gray-900`}
        role="document"
        suppressHydrationWarning
      >
        {/* Skip to content for keyboard and screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:shadow-lg"
        >
          Skip to content
        </a>
        <Providers>
          <SharedOverlayProvider>
            <AnimationBudgetDisplay />
            <CommandPaletteWrapper commands={globalCommands} />
            <AnimationBudgetManager maxAnimations={16}>
              <SafeAreaProvider>
                <BackgroundProvider>
                  <MobileOptimizationInit />
                  {/* Global floating theme toggle - always visible */}
                  <div className="fixed top-4 right-4 z-[1000] space-y-2">
                    <ThemeToggle />
                    <SoundToggle />
                  </div>
                  <main id="main-content" role="main">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </main>
                </BackgroundProvider>
              </SafeAreaProvider>
            </AnimationBudgetManager>
          </SharedOverlayProvider>
        </Providers>
      </body>
    </html>
  );
}