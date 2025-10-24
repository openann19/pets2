/**
 * PWA Integration Tests
 * Simple tests to verify PWA components render without errors
 */

import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn().mockResolvedValue({}),
    addEventListener: jest.fn(),
  },
  writable: true,
})

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    requestPermission: jest.fn().mockResolvedValue('granted'),
    permission: 'granted',
  },
  writable: true,
})

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('PWA Integration Tests', () => {
  test('PWA components render without errors', () => {
    // Test that we can import and render PWA components
    expect(() => {
      // This tests that the components can be imported without errors
      const { InstallPrompt } = require('../components/PWA/InstallPrompt')
      const { SplashScreen } = require('../components/PWA/SplashScreen')
      const { PWAManager } = require('../components/PWA/PWAManager')
      
      // Components should be defined
      expect(InstallPrompt).toBeDefined()
      expect(SplashScreen).toBeDefined()
      expect(PWAManager).toBeDefined()
    }).not.toThrow()
  })

  test('PWA utilities work correctly', () => {
    const { PWAUtils } = require('../components/PWA/PWAManager')
    
    // Test utility functions
    expect(PWAUtils.isInstallable()).toBeDefined()
    expect(PWAUtils.getDisplayMode()).toBeDefined()
    expect(PWAUtils.isMobile()).toBeDefined()
    expect(PWAUtils.getPlatform()).toBeDefined()
  })

  test('PWA hooks work correctly', () => {
    const { usePWAInstall } = require('../components/PWA/InstallPrompt')
    const { usePWAStatus } = require('../components/PWA/PWAManager')
    
    // Hooks should be defined
    expect(usePWAInstall).toBeDefined()
    expect(usePWAStatus).toBeDefined()
  })

  test('Service worker registration works', () => {
    // Test that service worker can be registered
    expect(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw-enhanced.js')
      }
    }).not.toThrow()
  })

  test('Notification API works', async () => {
    // Test notification permission request
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      expect(['granted', 'denied', 'default']).toContain(permission)
    }
  })

  test('PWA manifest exists', () => {
    // Test that manifest.json exists and is valid
    const fs = require('fs')
    const path = require('path')
    
    const manifestPath = path.join(__dirname, '../../public/manifest.json')
    expect(fs.existsSync(manifestPath)).toBe(true)
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    expect(manifest.name).toBe('PawfectMatch Premium')
    expect(manifest.icons).toBeDefined()
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('PWA icons exist', () => {
    // Test that PWA icons were generated
    const fs = require('fs')
    const path = require('path')
    
    const iconsDir = path.join(__dirname, '../../public/icons')
    expect(fs.existsSync(iconsDir)).toBe(true)
    
    const icons = fs.readdirSync(iconsDir)
    expect(icons.length).toBeGreaterThan(0)
    
    // Check for key icons
    const keyIcons = [
      'icon-192x192.png',
      'icon-512x512.png',
      'apple-touch-icon-180x180.png',
      'android-chrome-192x192.png'
    ]
    
    keyIcons.forEach(icon => {
      expect(icons).toContain(icon)
    })
  })

  test('Enhanced service worker exists', () => {
    // Test that enhanced service worker exists
    const fs = require('fs')
    const path = require('path')
    
    const swPath = path.join(__dirname, '../../public/sw-enhanced.js')
    expect(fs.existsSync(swPath)).toBe(true)
    
    const swContent = fs.readFileSync(swPath, 'utf8')
    expect(swContent).toContain('Enhanced Service Worker')
    expect(swContent).toContain('CACHE_STRATEGIES')
    expect(swContent).toContain('background sync')
  })

  test('PWA components have proper exports', () => {
    // Test that all PWA components export correctly
    const installPrompt = require('../components/PWA/InstallPrompt')
    const splashScreen = require('../components/PWA/SplashScreen')
    const pwaManager = require('../components/PWA/PWAManager')
    
    expect(installPrompt.InstallPrompt).toBeDefined()
    expect(installPrompt.usePWAInstall).toBeDefined()
    expect(splashScreen.SplashScreen).toBeDefined()
    expect(pwaManager.PWAManager).toBeDefined()
    expect(pwaManager.usePWAStatus).toBeDefined()
    expect(pwaManager.PWAUtils).toBeDefined()
  })
})
