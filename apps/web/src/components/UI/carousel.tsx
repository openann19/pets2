import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
/**
 * Carousel - Main container component for the carousel system
 * Provides structure and context for carousel items and navigation
 */
export const Carousel = React.forwardRef(({ children, className, ...props }, ref) => {
    return (<div ref={ref} className={cn('relative w-full', className)} {...props}>
        {children}
      </div>);
});
Carousel.displayName = 'Carousel';
/**
 * CarouselContent - Scrollable container for carousel items
 * Handles overflow and item layout with smooth scrolling
 */
export const CarouselContent = React.forwardRef(({ children, className, ...props }, ref) => {
    return (<div ref={ref} className={cn('flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide', className)} {...props}>
        {children}
      </div>);
});
CarouselContent.displayName = 'CarouselContent';
/**
 * CarouselItem - Individual item within the carousel
 * Provides snap points and flexible sizing
 */
export const CarouselItem = React.forwardRef(({ children, className, ...props }, ref) => {
    return (<div ref={ref} className={cn('min-w-full snap-center flex-shrink-0', className)} {...props}>
        {children}
      </div>);
});
CarouselItem.displayName = 'CarouselItem';
/**
 * CarouselPrevious - Navigation button to scroll to previous item
 * Positioned absolutely on the left side of the carousel
 */
export const CarouselPrevious = React.forwardRef(({ className, ...props }, ref) => {
    return (<button ref={ref} type="button" className={cn('absolute left-4 top-1/2 -translate-y-1/2 z-10', 'rounded-full bg-white/90 dark:bg-gray-800/90 p-2', 'shadow-lg hover:bg-white dark:hover:bg-gray-800', 'transition-all hover:scale-110', 'disabled:opacity-50 disabled:cursor-not-allowed', className)} aria-label="Previous slide" {...props}>
        <ChevronLeftIcon className="h-5 w-5 text-gray-900 dark:text-white"/>
      </button>);
});
CarouselPrevious.displayName = 'CarouselPrevious';
/**
 * CarouselNext - Navigation button to scroll to next item
 * Positioned absolutely on the right side of the carousel
 */
export const CarouselNext = React.forwardRef(({ className, ...props }, ref) => {
    return (<button ref={ref} type="button" className={cn('absolute right-4 top-1/2 -translate-y-1/2 z-10', 'rounded-full bg-white/90 dark:bg-gray-800/90 p-2', 'shadow-lg hover:bg-white dark:hover:bg-gray-800', 'transition-all hover:scale-110', 'disabled:opacity-50 disabled:cursor-not-allowed', className)} aria-label="Next slide" {...props}>
        <ChevronRightIcon className="h-5 w-5 text-gray-900 dark:text-white"/>
      </button>);
});
CarouselNext.displayName = 'CarouselNext';
// React 19 JSX compatibility aliases (typed, no any)
export const CarouselComponent = Carousel;
export const CarouselContentComponent = CarouselContent;
export const CarouselItemComponent = CarouselItem;
export const CarouselPreviousComponent = CarouselPrevious;
export const CarouselNextComponent = CarouselNext;
export {};
//# sourceMappingURL=carousel.jsx.map
//# sourceMappingURL=carousel.jsx.map