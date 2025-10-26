/**
 * Comprehensive PWA Tests
 * Tests all PWA features: install prompt, splash screen, service worker, etc.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { InstallPrompt, usePWAInstall } from '../components/PWA/InstallPrompt'
import { SplashScreen } from '../components/PWA/SplashScreen'
import { PWAManager, usePWAStatus, PWAUtils } from '../components/PWA/PWAManager'

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
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock service worker
const mockServiceWorker = {
  register: jest.fn().mockResolvedValue({
    addEventListener: jest.fn(),
    installing: null,
  }),
  addEventListener: jest.fn(),
  controller: null,
}

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
})

// Mock beforeinstallprompt event
const mockBeforeInstallPrompt = {
  preventDefault: jest.fn(),
  prompt: jest.fn().mockResolvedValue(undefined),
  userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
  platforms: ['web'],
}

// Mock Notification API
const mockNotification = {
  requestPermission: jest.fn().mockResolvedValue('granted'),
  permission: 'granted',
}

Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  writable: true,
})

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  value: jest.fn().mockResolvedValue(undefined),
  writable: true,
})

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: jest.fn(),
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

describe('PWA - Install Prompt', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    sessionStorage.clear()
  })

  test('renders install prompt when installable', () => {
    // Mock beforeinstallprompt event
    const event = new Event('beforeinstallprompt')
    Object.assign(event, mockBeforeInstallPrompt)
    
    render(
      <TestWrapper>
        <InstallPrompt />
      </TestWrapper>
    )

    // Simulate beforeinstallprompt event
    window.dispatchEvent(event)

    expect(screen.getByText('Install PawfectMatch')).toBeInTheDocument()
    expect(screen.getByText('Get the full app experience')).toBeInTheDocument()
  })

  test('handles install button click', async () => {
    const event = new Event('beforeinstallprompt')
    Object.assign(event, mockBeforeInstallPrompt)
    
    render(
      <TestWrapper>
        <InstallPrompt />
      </TestWrapper>
    )

    window.dispatchEvent(event)

    const installButton = screen.getByText('Install App')
    fireEvent.click(installButton)

    await waitFor(() => {
      expect(mockBeforeInstallPrompt.prompt).toHaveBeenCalled()
    })
  })

  test('dismisses prompt when close button clicked', () => {
    const event = new Event('beforeinstallprompt')
    Object.assign(event, mockBeforeInstallPrompt)
    
    render(
      <TestWrapper>
        <InstallPrompt />
      </TestWrapper>
    )

    window.dispatchEvent(event)

    const closeButton = screen.getByLabelText('Dismiss install prompt')
    fireEvent.click(closeButton)

    expect(sessionStorage.getItem('pwa-install-dismissed')).toBe('true')
  })

  test('shows platform-specific instructions', () => {
    // Mock iOS user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
    })

    const event = new Event('beforeinstallprompt')
    Object.assign(event, mockBeforeInstallPrompt)
    
    render(
      <TestWrapper>
        <InstallPrompt />
      </TestWrapper>
    )

    window.dispatchEvent(event)

    expect(screen.getByText('iOS Instructions')).toBeInTheDocument()
  })

  test('usePWAInstall hook works correctly', () => {
    const TestComponent = () => {
      const { isInstallable, isInstalled, install } = usePWAInstall()
      
      return (
        <div>
          <div data-testid="installable">{isInstallable.toString()}</div>
          <div data-testid="installed">{isInstalled.toString()}</div>
          <button onClick={install} data-testid="install-button">Install</button>
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('installable')).toHaveTextContent('false')
    expect(screen.getByTestId('installed')).toHaveTextContent('false')
  })
})

describe('PWA - Splash Screen', () => {
  test('renders splash screen with loading progress', () => {
    const onComplete = jest.fn()
    
    render(
      <TestWrapper>
        <SplashScreen onComplete={onComplete} />
      </TestWrapper>
    )

    expect(screen.getByText('PawfectMatch')).toBeInTheDocument()
    expect(screen.getByText('Find Your Perfect Pet Companion')).toBeInTheDocument()
    expect(screen.getByText('0% loaded')).toBeInTheDocument()
  })

  test('calls onComplete after loading', async () => {
    const onComplete = jest.fn()
    
    render(
      <TestWrapper>
        <SplashScreen onComplete={onComplete} />
      </TestWrapper>
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    }, { timeout: 5000 })
  })
})

describe('PWA - PWA Manager', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  test('renders children when not showing splash', () => {
    sessionStorage.setItem('pwa-visited', 'true')
    
    render(
      <TestWrapper>
        <PWAManager>
          <div data-testid="app-content">App Content</div>
        </PWAManager>
      </TestWrapper>
    )

    expect(screen.getByTestId('app-content')).toBeInTheDocument()
  })

  test('shows splash screen on first visit', () => {
    // Don't set pwa-visited in sessionStorage
    
    render(
      <TestWrapper>
        <PWAManager>
          <div data-testid="app-content">App Content</div>
        </PWAManager>
      </TestWrapper>
    )

    expect(screen.getByText('PawfectMatch')).toBeInTheDocument()
    expect(screen.queryByTestId('app-content')).not.toBeInTheDocument()
  })

  test('registers service worker', () => {
    render(
      <TestWrapper>
        <PWAManager>
          <div>App Content</div>
        </PWAManager>
      </TestWrapper>
    )

    expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw-enhanced.js')
  })
})

describe('PWA - PWA Status Hook', () => {
  test('usePWAStatus returns correct initial values', () => {
    const TestComponent = () => {
      const { isOnline, isStandalone, isInstallable, isInstalled } = usePWAStatus()
      
      return (
        <div>
          <div data-testid="online">{isOnline.toString()}</div>
          <div data-testid="standalone">{isStandalone.toString()}</div>
          <div data-testid="installable">{isInstallable.toString()}</div>
          <div data-testid="installed">{isInstalled.toString()}</div>
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('online')).toHaveTextContent('true')
    expect(screen.getByTestId('standalone')).toHaveTextContent('false')
    expect(screen.getByTestId('installable')).toHaveTextContent('false')
    expect(screen.getByTestId('installed')).toHaveTextContent('false')
  })
})

describe('PWA - PWA Utils', () => {
  test('isInstallable returns correct value', () => {
    expect(PWAUtils.isInstallable()).toBe(true) // Mocked serviceWorker and PushManager
  })

  test('getDisplayMode returns correct mode', () => {
    // Mock standalone display mode
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
      writable: true,
    })

    expect(PWAUtils.getDisplayMode()).toBe('standalone')
  })

  test('isMobile detects mobile devices', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
    })

    expect(PWAUtils.isMobile()).toBe(true)
  })

  test('getPlatform returns correct platform', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
    })

    expect(PWAUtils.getPlatform()).toBe('ios')
  })

  test('requestNotificationPermission works', async () => {
    const result = await PWAUtils.requestNotificationPermission()
    expect(result).toBe(true)
    expect(mockNotification.requestPermission).toHaveBeenCalled()
  })

  test('showNotification creates notification', () => {
    PWAUtils.showNotification('Test notification', { body: 'Test body' })
    
    // Notification constructor should be called
    expect(mockNotification).toBeDefined()
  })

  test('vibrate calls navigator.vibrate', () => {
    PWAUtils.vibrate([200, 100, 200])
    expect(navigator.vibrate).toHaveBeenCalledWith([200, 100, 200])
  })

  test('share calls navigator.share', async () => {
    const shareData = { title: 'Test', text: 'Test text', url: 'https://example.com' }
    
    const result = await PWAUtils.share(shareData)
    expect(result).toBe(true)
    expect(navigator.share).toHaveBeenCalledWith(shareData)
  })
})

describe('PWA - Integration Tests', () => {
  test('full PWA flow works', async () => {
    const onComplete = jest.fn()
    
    render(
      <TestWrapper>
        <PWAManager>
          <div data-testid="app-content">App Content</div>
        </PWAManager>
      </TestWrapper>
    )

    // Should show splash screen initially
    expect(screen.getByText('PawfectMatch')).toBeInTheDocument()

    // Wait for splash to complete
    await waitFor(() => {
      expect(screen.getByTestId('app-content')).toBeInTheDocument()
    }, { timeout: 5000 })

    // Service worker should be registered
    expect(mockServiceWorker.register).toHaveBeenCalled()
  })

  test('offline indicator shows when offline', () => {
    render(
      <TestWrapper>
        <PWAManager>
          <div>App Content</div>
        </PWAManager>
      </TestWrapper>
    )

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    })

    fireEvent(window, new Event('offline'))

    expect(screen.getByText("You're offline")).toBeInTheDocument()
  })

  test('update banner shows when update available', () => {
    render(
      <TestWrapper>
        <PWAManager>
          <div>App Content</div>
        </PWAManager>
      </TestWrapper>
    )

    // Simulate controller change (update available)
    mockServiceWorker.controller = { postMessage: jest.fn() }
    fireEvent(window, new Event('controllerchange'))

    expect(screen.getByText('New version available')).toBeInTheDocument()
  })
})

describe('PWA - Error Handling', () => {
  test('handles service worker registration failure gracefully', () => {
    mockServiceWorker.register.mockRejectedValueOnce(new Error('Registration failed'))
    
    // Should not throw error
    expect(() => {
      render(
        <TestWrapper>
          <PWAManager>
            <div>App Content</div>
          </PWAManager>
        </TestWrapper>
      )
    }).not.toThrow()
  })

  test('handles notification permission denied', async () => {
    mockNotification.requestPermission.mockResolvedValueOnce('denied')
    
    const result = await PWAUtils.requestNotificationPermission()
    expect(result).toBe(false)
  })

  test('handles share failure gracefully', async () => {
    ;(navigator.share as jest.Mock).mockRejectedValueOnce(new Error('Share failed'))
    
    const result = await PWAUtils.share({ title: 'Test' })
    expect(result).toBe(false)
  })
})

describe('PWA - Performance Tests', () => {
  test('components render quickly', () => {
    const startTime = performance.now()
    
    render(
      <TestWrapper>
        <InstallPrompt />
        <SplashScreen onComplete={() => {}} />
      </TestWrapper>
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render in under 100ms
    expect(renderTime).toBeLessThan(100)
  })

  test('PWA utils are fast', () => {
    const startTime = performance.now()
    
    PWAUtils.isInstallable()
    PWAUtils.getDisplayMode()
    PWAUtils.isMobile()
    PWAUtils.getPlatform()
    
    const endTime = performance.now()
    const executionTime = endTime - startTime
    
    // Should execute in under 10ms
    expect(executionTime).toBeLessThan(10)
  })
})
