/**
 * 💎 Premium Modal Component - Ultra Elite UI
 * Advanced modal with glass morphism, 3D effects, and premium animations
 */
'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import PremiumButton from './PremiumButton';
import { SPRING_CONFIG, MODAL_VARIANTS } from '@/constants/animations';
export default function PremiumModal({ isOpen, onClose, title, children, size = 'md', variant = 'glass', showCloseButton = true, closeOnOverlayClick = true, closeOnEscape = true, className = '', }) {
    const modalRef = useRef(null);
    // Handle escape key
    useEffect(() => {
        if (!closeOnEscape)
            return;
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, closeOnEscape]);
    // Handle overlay click
    const handleOverlayClick = (event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
            onClose();
        }
    };
    // Get size classes
    const getSizeClasses = () => {
        const sizes = {
            sm: 'max-w-md',
            md: 'max-w-lg',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl',
            full: 'max-w-full mx-4',
        };
        return sizes[size];
    };
    // Get variant styles
    const getVariantStyles = () => {
        const variants = {
            default: {
                background: 'bg-white/95 backdrop-blur-md',
                border: 'border border-white/20',
                text: 'text-gray-900',
            },
            glass: {
                background: 'bg-white/10 backdrop-blur-xl',
                border: 'border border-white/20',
                text: 'text-white',
            },
            gradient: {
                background: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl',
                border: 'border border-white/30',
                text: 'text-white',
            },
            holographic: {
                background: 'bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-blue-500/30 backdrop-blur-xl',
                border: 'border border-white/40',
                text: 'text-white',
            },
        };
        return variants[variant];
    };
    const sizeClasses = getSizeClasses();
    const variantStyles = getVariantStyles();
    return (<AnimatePresence>
      {isOpen && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial="hidden" animate="visible" exit="hidden" variants={MODAL_VARIANTS.overlay} onClick={handleOverlayClick}>
          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}/>

          {/* Modal Content */}
          <motion.div ref={modalRef} className={`
              relative w-full ${sizeClasses} max-h-[90vh] overflow-hidden
              ${variantStyles.background} ${variantStyles.border}
              rounded-2xl shadow-2xl transform-gpu
              ${className}
            `} variants={MODAL_VARIANTS.content} initial="hidden" animate="visible" exit="hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            {(title || showCloseButton) && (<div className="flex items-center justify-between p-6 border-b border-white/10">
                {title && (<h2 className={`text-xl font-bold ${variantStyles.text}`}>
                    {title}
                  </h2>)}
                {showCloseButton && (<PremiumButton variant="ghost" size="sm" onClick={onClose} className="p-2" aria-label="Close modal">
                    <XMarkIcon className="w-5 h-5"/>
                  </PremiumButton>)}
              </div>)}

            {/* Content */}
            <div className={`p-6 overflow-y-auto max-h-[calc(90vh-120px)] ${variantStyles.text}`}>
              {children}
            </div>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
// Hook for managing modal state
export function usePremiumModal() {
    const [isOpen, setIsOpen] = React.useState(false);
    const openModal = () => { setIsOpen(true); };
    const closeModal = () => { setIsOpen(false); };
    const toggleModal = () => { setIsOpen(!isOpen); };
    return {
        isOpen,
        openModal,
        closeModal,
        toggleModal,
    };
}
//# sourceMappingURL=PremiumModal.jsx.map