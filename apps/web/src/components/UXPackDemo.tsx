'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeSwitch, ThemeSelector } from './ThemeSwitch';
import SafeImage from './UI/SafeImage';
import { triggerCommandPalette } from '@/providers/CommandPalette';

// Simple stub components for demo
const InteractiveCard = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`} {...props}>
    {children}
  </div>
);

const InteractiveButton = ({ children, onClick, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button onClick={onClick} className={`px-4 py-2 rounded transition ${className}`} {...props}>
    {children}
  </button>
);

const SkeletonCard = () => (
  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse" />
);

const SkeletonMessage = () => (
  <div className="bg-gray-200 dark:bg-gray-700 rounded h-16 animate-pulse" />
);

const SkeletonGrid = ({ columns = 3, rows = 2 }: { columns?: number; rows?: number }) => (
  <div className={`grid grid-cols-${columns} gap-4`}>
    {Array.from({ length: columns * rows }).map((_, i) => (
      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded h-32 animate-pulse" />
    ))}
  </div>
);

export function UXPackDemo(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeletons, setShowSkeletons] = useState(true);
  
  const toggleLoading = (): void => {
    setIsLoading(!isLoading);
    setShowSkeletons(!showSkeletons);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            🎨 UX Pack Demo
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Showcasing premium UX features
          </p>
          
          {/* Theme Controls */}
          <div className="flex items-center justify-center gap-4">
            <ThemeSwitch />
            <ThemeSelector />
            <button onClick={toggleLoading} className="px-4 py-2 border rounded">
              {isLoading ? 'Show Content' : 'Show Skeletons'}
            </button>
            <button onClick={triggerCommandPalette} className="px-4 py-2 bg-blue-600 text-white rounded">
              Open Command Palette (⌘K)
            </button>
          </div>
        </div>

        {/* Dark Mode Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            🌙 Dark Mode & Theme Switcher
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InteractiveCard className="p-6">
              <h3 className="text-lg font-medium mb-2">System Aware</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Automatically detects system preference
              </p>
            </InteractiveCard>
            <InteractiveCard className="p-6">
              <h3 className="text-lg font-medium mb-2">Smooth Transitions</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Seamless color transitions between modes
              </p>
            </InteractiveCard>
            <InteractiveCard className="p-6">
              <h3 className="text-lg font-medium mb-2">Persistent Storage</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Remembers your preference across sessions
              </p>
            </InteractiveCard>
          </div>
        </section>

        {/* Skeleton Loaders Section */}
        {showSkeletons && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              🦴 Skeleton Loaders
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Pet Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Chat Messages</h3>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonMessage key={i} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Grid Layout</h3>
                <SkeletonGrid columns={3} rows={2} />
              </div>
            </div>
          </section>
        )}

        {/* Progressive Images Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            🖼️ Progressive Image Loading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">With Blur Placeholder</h3>
              <SafeImage
                src="https://picsum.photos/600/400?random=10"
                alt="Progressive loading demo"
                width={600}
                height={400}
                className="w-full h-64 object-cover rounded-xl"
                enableBlurPlaceholder
                showLoadingSpinner
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fallback Handling</h3>
              <SafeImage
                src="https://invalid-url-that-will-fail.com/image.jpg"
                alt="Fallback demo"
                width={600}
                height={400}
                className="w-full h-64 object-cover rounded-xl"
                fallbackType="pet"
                showLoadingSpinner
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UXPackDemo;
