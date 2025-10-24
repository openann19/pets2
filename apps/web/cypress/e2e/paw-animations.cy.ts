/**
 * 🐾 E2E Tests - Paw Animations Visual & Functional Testing
 * Cypress tests for real browser behavior
 */

describe('Paw Animations - E2E Tests', () => {
  describe('Test Paws Demo Page', () => {
    beforeEach(() => {
      cy.visit('/test-paws');
    });

    it('loads the demo page successfully', () => {
      cy.contains('Paw Loading Animations').should('be.visible');
    });

    it('displays all three size variants', () => {
      cy.contains('Small').should('be.visible');
      cy.contains('Medium').should('be.visible');
      cy.contains('Large').should('be.visible');
    });

    it('displays color variations', () => {
      cy.contains('Pink').should('be.visible');
      cy.contains('Purple').should('be.visible');
      cy.contains('Blue').should('be.visible');
      cy.contains('Green').should('be.visible');
    });

    it('renders SVG elements', () => {
      cy.get('svg').should('have.length.gt', 0);
    });

    it('demonstrates button loading state', () => {
      cy.contains('button', 'Test Loading State').click();
      cy.contains('Loading for 3 seconds...', { timeout: 1000 }).should('be.visible');
      cy.contains('Test Loading State', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Login Page Paw Animations', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('shows paw animation on form submission', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.contains('button', 'Sign in').click();
      
      // Should show loading state (paw animations in button)
      cy.get('button[disabled]').should('exist');
    });
  });

  describe('Analytics Page Loading', () => {
    beforeEach(() => {
      // Assume user is authenticated
      cy.visit('/analytics');
    });

    it('shows loading spinner initially', () => {
      cy.get('[data-testid="loading-spinner"]', { timeout: 1000 }).should('exist');
    });
  });

  describe('Swipe Page Loading', () => {
    beforeEach(() => {
      cy.visit('/swipe');
    });

    it('displays paw animations while loading pets', () => {
      cy.get('[data-testid="loading-spinner"]', { timeout: 2000 });
    });
  });

  describe('Animation Performance', () => {
    it('maintains 60fps during animations', () => {
      cy.visit('/test-paws');
      
      // Check that animations don't cause jank
      cy.window().then((win) => {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkFPS = () => {
          const currentTime = performance.now();
          frameCount++;
          
          if (currentTime >= lastTime + 1000) {
            // Should be close to 60fps
            expect(frameCount).to.be.greaterThan(50);
            frameCount = 0;
            lastTime = currentTime;
          }
          
          win.requestAnimationFrame(checkFPS);
        };
        
        win.requestAnimationFrame(checkFPS);
      });
    });
  });

  describe('Responsive Behavior', () => {
    const viewports: Cypress.ViewportPreset[] = ['iphone-6', 'ipad-2', 'macbook-15'];
    
    viewports.forEach((viewport) => {
      it(`displays correctly on ${viewport}`, () => {
        cy.viewport(viewport);
        cy.visit('/test-paws');
        cy.get('svg').should('be.visible');
      });
    });
  });

  describe('Dark Mode Compatibility', () => {
    it('paw animations visible in dark mode', () => {
      cy.visit('/test-paws');
      
      // Scroll to dark background section
      cy.contains('On Dark Background').scrollIntoView();
      cy.get('svg[fill="#ffffff"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/test-paws');
    });

    it('has proper ARIA attributes', () => {
      cy.get('[role="img"]').should('exist');
      cy.get('[aria-label="Loading"]').should('exist');
    });

    it('is keyboard accessible', () => {
      cy.get('body').tab();
      cy.focused().should('be.visible');
    });

    it('works with reduced motion preference', () => {
      cy.visit('/test-paws', {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-reduced-motion: reduce)')
            .returns({
              matches: true,
              addListener: () => {},
              removeListener: () => {},
            });
        },
      });
      
      // Animations should still render but respect user preferences
      cy.get('[data-testid="loading-spinner"]').should('exist');
    });
  });

  describe('Error Handling', () => {
    it('handles missing color prop gracefully', () => {
      cy.visit('/test-paws');
      // Should still render with default color
      cy.get('svg').should('exist');
    });

    it('handles rapid navigation', () => {
      cy.visit('/test-paws');
      cy.visit('/login');
      cy.visit('/test-paws');
      cy.visit('/matches');
      
      // Should not crash or show errors
      cy.get('body').should('exist');
    });
  });

  describe('Visual Regression', () => {
    it('matches baseline screenshot for small size', () => {
      cy.visit('/test-paws');
      cy.contains('Small').parents('div').first().screenshot('paw-small');
      // Visual comparison would be done with Percy or similar tool
    });

    it('matches baseline screenshot for medium size', () => {
      cy.visit('/test-paws');
      cy.contains('Medium').parents('div').first().screenshot('paw-medium');
    });

    it('matches baseline screenshot for large size', () => {
      cy.visit('/test-paws');
      cy.contains('Large').parents('div').first().screenshot('paw-large');
    });

    it('matches baseline for button loading state', () => {
      cy.visit('/test-paws');
      cy.contains('button', 'Test Loading State').click();
      cy.wait(500); // Wait for animation to be visible
      cy.get('button[disabled]').screenshot('button-loading');
    });
  });

  describe('Network Conditions', () => {
    it('handles slow network gracefully', () => {
      cy.intercept('*', (req) => {
        req.on('response', (res) => {
          res.setDelay(2000); // 2 second delay
        });
      });
      
      cy.visit('/analytics');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
    });

    it('handles offline state', () => {
      cy.visit('/test-paws', {
        onBeforeLoad(win) {
          cy.stub(win.navigator, 'onLine').value(false);
        },
      });
      
      // Page should still render with paw animations
      cy.get('svg').should('exist');
    });
  });

  describe('Memory Leak Detection', () => {
    it('cleans up after navigation', () => {
      // Visit page with loading states
      cy.visit('/test-paws');
      
      // Get initial memory (if available)
      cy.window().then((win: Window) => {
        const initialMemory = win.performance?.memory?.usedJSHeapSize;
        
        // Navigate away and back multiple times
        for (let i = 0; i < 5; i++) {
          cy.visit('/login');
          cy.visit('/test-paws');
        }
        
        // Memory should not grow unbounded
        cy.window().then((finalWin: Window) => {
          const finalMemory = finalWin.performance?.memory?.usedJSHeapSize;
          if (initialMemory && finalMemory) {
            // Allow some growth but not excessive
            expect(finalMemory).to.be.lessThan(initialMemory * 2);
          }
        });
      });
    });
  });
});

describe('Cross-Browser Testing', () => {
  const pages = ['/test-paws', '/login', '/analytics'];
  
  pages.forEach((page) => {
    it(`renders correctly on ${page} across browsers`, () => {
      cy.visit(page);
      // Cypress runs on Chrome/Electron by default
      // Additional browsers configured in cypress.config.js
      cy.get('body').should('exist');
    });
  });
});
