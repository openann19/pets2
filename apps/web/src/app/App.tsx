import React, { Suspense, lazy } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { 
  SharedOverlayProvider, 
  CommandPaletteWrapper, 
  AnimationBudgetDisplay,
  AnimationBudgetManager,
  SoundToggle 
} from '../components/Animations';
import { globalCommands } from '../config/commands';
import { createLazyComponent } from '../utils/performanceAdvanced';
import { WebErrorBoundary } from '../lib/errors/WebErrorBoundary';
import './App.css';

// Lazy load the landing page
const LazyLandingPage = createLazyComponent(
  () => import('../components/Landing/LandingPage'),
  'LandingPage'
);

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
      <WebErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SharedOverlayProvider>
            <AuthProvider>
              <SocketProvider>
                {/* Global Command Palette - Cmd/Ctrl+K */}
                <CommandPaletteWrapper commands={globalCommands} />
                
                {/* Animation Performance Monitor */}
                <AnimationBudgetDisplay />
                
                {/* Sound Toggle */}
                <SoundToggle />
                
                {/* Animation Budget Manager */}
                <AnimationBudgetManager maxAnimations={16}>
                  {/* Main App Content */}
                  <main className="min-h-screen">
                    <LazyLandingPage />
                  </main>
                </AnimationBudgetManager>
              </SocketProvider>
            </AuthProvider>
          </SharedOverlayProvider>
          <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
      </WebErrorBoundary>
    );
}
export default App;
//# sourceMappingURL=App.jsx.map
//# sourceMappingURL=App.jsx.map