/**
 * Simple integration tests for UX Pack components
 * Tests that components render without errors
 */

import { render } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SkeletonCard } from '../components/ui/Skeleton'
import { InteractiveButton } from '../components/ui/Interactive'
import { ThemeSwitch } from '../components/ThemeSwitch'

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
}))

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

describe('UX Pack Integration Tests', () => {
  test('SkeletonCard renders without errors', () => {
    expect(() => {
      render(
        <TestWrapper>
          <SkeletonCard />
        </TestWrapper>
      )
    }).not.toThrow()
  })

  test('InteractiveButton renders without errors', () => {
    expect(() => {
      render(
        <TestWrapper>
          <InteractiveButton variant="primary">
            Test Button
          </InteractiveButton>
        </TestWrapper>
      )
    }).not.toThrow()
  })

  test('ThemeSwitch renders without errors', () => {
    expect(() => {
      render(
        <TestWrapper>
          <ThemeSwitch />
        </TestWrapper>
      )
    }).not.toThrow()
  })

  test('Multiple components render together', () => {
    expect(() => {
      render(
        <TestWrapper>
          <div>
            <SkeletonCard />
            <InteractiveButton variant="primary">Button 1</InteractiveButton>
            <InteractiveButton variant="secondary">Button 2</InteractiveButton>
            <ThemeSwitch />
          </div>
        </TestWrapper>
      )
    }).not.toThrow()
  })

  test('Components handle props correctly', () => {
    expect(() => {
      render(
        <TestWrapper>
          <InteractiveButton 
            variant="outline" 
            size="lg"
            disabled={false}
            onClick={() => {}}
          >
            Large Outline Button
          </InteractiveButton>
        </TestWrapper>
      )
    }).not.toThrow()
  })
})
