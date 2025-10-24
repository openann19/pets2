/**
 * ⬆️ BACK TO TOP BUTTON
 * Smooth scroll to top with elegant animation
 */
'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { useBackToTop } from '@/hooks/useScrollDirection';
export default function BackToTopButton({ threshold = 400, className = '', variant = 'floating', size = 'md', showOnMobile = true }) {
    const { showButton, scrollToTop, scrollY } = useBackToTop({ threshold });
    // Size variants
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-12 h-12',
        lg: 'w-14 h-14'
    };
    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };
    // Variant styles
    const variantClasses = {
        floating: 'fixed bottom-6 right-6 z-50',
        fixed: 'fixed bottom-4 right-4 z-50',
        inline: 'relative'
    };
    const buttonClasses = {
        floating: `
      ${sizeClasses[size]}
      bg-white dark:bg-neutral-800
      shadow-lg hover:shadow-xl
      border border-neutral-200 dark:border-neutral-700
      text-neutral-600 dark:text-neutral-400
      hover:text-primary-500 hover:border-primary-300
      dark:hover:text-primary-400 dark:hover:border-primary-600
    `,
        fixed: `
      ${sizeClasses[size]}
      bg-primary-500 hover:bg-primary-600
      text-white shadow-lg hover:shadow-xl
      border border-primary-500
    `,
        inline: `
      ${sizeClasses[size]}
      bg-neutral-100 dark:bg-neutral-800
      hover:bg-neutral-200 dark:hover:bg-neutral-700
      text-neutral-600 dark:text-neutral-400
      hover:text-primary-500
      border border-neutral-200 dark:border-neutral-700
    `
    };
    return (<AnimatePresence>
      {showButton && (<motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
            }} className={`
            ${variantClasses[variant]}
            ${!showOnMobile ? 'hidden md:block' : ''}
            ${className}
          `}>
          <motion.button onClick={scrollToTop} className={`
              ${buttonClasses[variant]}
              rounded-full
              flex items-center justify-center
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              dark:focus:ring-offset-neutral-900
              group
            `} whileHover={{
                scale: 1.1,
                y: -2
            }} whileTap={{
                scale: 0.95,
                y: 0
            }} transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
            }} aria-label="Back to top">
            <motion.div animate={{
                y: [0, -2, 0]
            }} transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}>
              <ArrowUpIcon className={iconSizeClasses[size]}/>
            </motion.div>

            {/* Progress indicator */}
            <motion.div className="absolute inset-0 rounded-full border-2 border-primary-500/20" style={{
                background: `conic-gradient(from 0deg, #ec4899 ${(scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%, transparent 0%)`
            }} initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
            }}/>
          </motion.button>

          {/* Tooltip */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="
              absolute bottom-full right-0 mb-2
              bg-neutral-900 dark:bg-neutral-100
              text-white dark:text-neutral-900
              text-xs px-2 py-1 rounded
              whitespace-nowrap
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              pointer-events-none
            ">
            Back to top
            <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"/>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
// Hook for back-to-top functionality
export function useBackToTopButton(options = {}) {
    const { threshold = 400 } = options;
    const { showButton, scrollToTop, scrollY } = useBackToTop({ threshold });
    const scrollToElement = (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };
    const scrollToPosition = (position) => {
        window.scrollTo({
            top: position,
            behavior: 'smooth'
        });
    };
    return {
        showButton,
        scrollToTop,
        scrollToElement,
        scrollToPosition,
        scrollY,
        scrollProgress: scrollY / (document.documentElement.scrollHeight - window.innerHeight)
    };
}
//# sourceMappingURL=BackToTopButton.jsx.map