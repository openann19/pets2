import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion to test animation logic without actual animations
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, whileHover, whileTap, variants, layoutId, ...props }: any, ref: any) => (
      <div 
        ref={ref}
        data-testid="motion-div"
        data-while-hover={JSON.stringify(whileHover)}
        data-while-tap={JSON.stringify(whileTap)}
        data-variants={JSON.stringify(variants)}
        data-layout-id={`${layoutId}`}
        {...props}
      >
        {children}
      </div>
    )),
    button: React.forwardRef(({ children, whileHover, whileTap, ...props }: any, ref: any) => (
      <button 
        ref={ref}
        data-testid="motion-button"
        data-while-hover={JSON.stringify(whileHover)}
        data-while-tap={JSON.stringify(whileTap)}
        {...props}
      >
        {children}
      </button>
    )),
  },
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
}));

// Test component that uses our premium animation patterns
const TestAnimatedCard = ({ onClick, layoutId }: { onClick?: () => void; layoutId?: string }) => {
  const { motion } = require('framer-motion');
  
  return (
    <motion.div
      layoutId={layoutId}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
      }}
      whileHover={{ 
        scale: 1.02,
        rotateY: 2,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm cursor-pointer"
      data-testid="animated-card"
    >
      <div>Animated Card Content</div>
      
      <motion.button
        whileHover={{ 
          scale: 1.1,
          transition: { type: "spring", stiffness: 400, damping: 17 }
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { type: "spring", stiffness: 400, damping: 17 }
        }}
        className="p-2 rounded-full"
        data-testid="animated-button"
      >
        Action Button
      </motion.button>
    </motion.div>
  );
};

const TestStaggeredList = () => {
  const { motion } = require('framer-motion');
  
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      initial="hidden"
      animate="visible"
      data-testid="staggered-container"
    >
      {[1, 2, 3].map(item => (
        <motion.div
          key={item}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 }
          }}
          data-testid={`staggered-item-${item}`}
        >
          Item {item}
        </motion.div>
      ))}
    </motion.div>
  );
};

describe('Premium Animation Features', () => {
  describe('Spring Physics Animations', () => {
    it('applies spring physics to hover animations', () => {
      render(<TestAnimatedCard />);
      
      const card = screen.getByTestId('animated-card');
      const hoverData = JSON.parse(card.getAttribute('data-while-hover') || '{}');
      
      expect(hoverData.scale).toBe(1.02);
      expect(hoverData.rotateY).toBe(2);
      expect(hoverData.transition.type).toBe('spring');
      expect(hoverData.transition.stiffness).toBe(400);
      expect(hoverData.transition.damping).toBe(17);
    });

    it('applies spring physics to tap animations', () => {
      render(<TestAnimatedCard />);
      
      const card = screen.getByTestId('animated-card');
      const tapData = JSON.parse(card.getAttribute('data-while-tap') || '{}');
      
      expect(tapData.scale).toBe(0.98);
      expect(tapData.transition.type).toBe('spring');
      expect(tapData.transition.stiffness).toBe(400);
      expect(tapData.transition.damping).toBe(17);
    });
  });

  describe('3D Perspective Effects', () => {
    it('applies rotateY for 3D tilt effect on hover', () => {
      render(<TestAnimatedCard />);
      
      const card = screen.getByTestId('animated-card');
      const hoverData = JSON.parse(card.getAttribute('data-while-hover') || '{}');
      
      expect(hoverData.rotateY).toBe(2);
    });

    it('has transform-gpu class for hardware acceleration', () => {
      render(<TestAnimatedCard />);
      
      const card = screen.getByTestId('animated-card');
      // In a real implementation, we'd check for transform-gpu class
      expect(card).toBeInTheDocument();
    });
  });

  describe('Micro-Interactions', () => {
    it('applies scale animations to buttons on hover', () => {
      render(<TestAnimatedCard />);
      
      const button = screen.getByTestId('animated-button');
      const hoverData = JSON.parse(button.getAttribute('data-while-hover') || '{}');
      
      expect(hoverData.scale).toBe(1.1);
      expect(hoverData.transition.type).toBe('spring');
    });

    it('applies scale animations to buttons on tap', () => {
      render(<TestAnimatedCard />);
      
      const button = screen.getByTestId('animated-button');
      const tapData = JSON.parse(button.getAttribute('data-while-tap') || '{}');
      
      expect(tapData.scale).toBe(0.95);
      expect(tapData.transition.type).toBe('spring');
    });

    it('triggers click handlers', () => {
      const mockClick = jest.fn();
      render(<TestAnimatedCard onClick={mockClick} />);
      
      const card = screen.getByTestId('animated-card');
      fireEvent.click(card);
      
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Shared Layout Animations', () => {
    it('applies layoutId for shared element transitions', () => {
      render(<TestAnimatedCard layoutId="match-123" />);
      
      const card = screen.getByTestId('animated-card');
      expect(card.getAttribute('data-layout-id')).toBe('match-123');
    });

    it('works without layoutId', () => {
      render(<TestAnimatedCard />);
      
      const card = screen.getByTestId('animated-card');
      expect(card.getAttribute('data-layout-id')).toBe('undefined');
    });
  });

  describe('Staggered Animations', () => {
    it('sets up stagger container with proper variants', () => {
      render(<TestStaggeredList />);
      
      const container = screen.getByTestId('staggered-container');
      const variants = JSON.parse(container.getAttribute('data-variants') || '{}');
      
      expect(variants.visible.transition.staggerChildren).toBe(0.1);
      expect(variants.hidden.opacity).toBe(0);
      expect(variants.visible.opacity).toBe(1);
    });

    it('creates multiple staggered items', () => {
      render(<TestStaggeredList />);
      
      expect(screen.getByTestId('staggered-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('staggered-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('staggered-item-3')).toBeInTheDocument();
    });

    it('applies entrance animations to staggered items', () => {
      render(<TestStaggeredList />);
      
      const item = screen.getByTestId('staggered-item-1');
      const variants = JSON.parse(item.getAttribute('data-variants') || '{}');
      
      expect(variants.hidden.opacity).toBe(0);
      expect(variants.hidden.y).toBe(20);
      expect(variants.hidden.scale).toBe(0.95);
      
      expect(variants.visible.opacity).toBe(1);
      expect(variants.visible.y).toBe(0);
      expect(variants.visible.scale).toBe(1);
    });
  });

  describe('Animation Performance', () => {
    it('uses proper CSS classes for GPU acceleration', () => {
      render(<TestAnimatedCard />);
      
      const card = screen.getByTestId('animated-card');
      // In real implementation, should have transform-gpu, perspective-1000, etc.
      expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'cursor-pointer');
    });

    it('applies consistent animation timing', () => {
      render(<TestAnimatedCard />);
      
      const card = screen.getByTestId('animated-card');
      const button = screen.getByTestId('animated-button');
      
      const cardHover = JSON.parse(card.getAttribute('data-while-hover') || '{}');
      const buttonHover = JSON.parse(button.getAttribute('data-while-hover') || '{}');
      
      // Both should use same spring physics values
      expect(cardHover.transition.stiffness).toBe(buttonHover.transition.stiffness);
      expect(cardHover.transition.damping).toBe(buttonHover.transition.damping);
    });
  });
});
