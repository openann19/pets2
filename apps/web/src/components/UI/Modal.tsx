'use client';
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
};
export function Modal({ isOpen, onClose, title, description, children, size = 'md', showCloseButton = true, closeOnOverlayClick = true, closeOnEscape = true, className = '', overlayClassName = '', }) {
    return (<Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeOnOverlayClick ? onClose : () => { }} static={!closeOnEscape}>
        {/* Overlay */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className={`
              fixed inset-0 bg-black/50 backdrop-blur-sm
              ${overlayClassName}
            `} aria-hidden="true"/>
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className={`
                  w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl
                  bg-white dark:bg-neutral-900
                  text-left align-middle shadow-xl
                  border border-neutral-200 dark:border-neutral-700
                  ${className}
                `}>
                {/* Header */}
                {(title || showCloseButton) && (<div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex-1">
                      {title && (<Dialog.Title as="h3" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {title}
                        </Dialog.Title>)}
                      {description && (<Dialog.Description className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          {description}
                        </Dialog.Description>)}
                    </div>
                    
                    {showCloseButton && (<button type="button" className="
                          rounded-full p-2 text-neutral-400 hover:text-neutral-600
                          hover:bg-neutral-100 dark:hover:bg-neutral-800
                          focus:outline-none focus:ring-2 focus:ring-primary-500
                          transition-colors duration-200
                        " onClick={onClose} aria-label="Close modal">
                        <XMarkIcon className="h-5 w-5"/>
                      </button>)}
                  </div>)}

                {/* Content */}
                <div className="p-6">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>);
}
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'info', isLoading = false, }) {
    const variantClasses = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        info: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    };
    return (<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-neutral-600 dark:text-neutral-400">
          {message}
        </p>
        
        <div className="flex space-x-3 justify-end">
          <button type="button" className="
              px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300
              bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600
              rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700
              focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-colors duration-200
            " onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button>
          
          <button type="button" className={`
              px-4 py-2 text-sm font-medium text-white
              rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2
              transition-colors duration-200
              ${variantClasses[variant]}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>);
}
export function AlertModal({ isOpen, onClose, title, message, variant = 'info', buttonText = 'OK', }) {
    const variantClasses = {
        success: 'text-green-600 dark:text-green-400',
        error: 'text-red-600 dark:text-red-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        info: 'text-primary-600 dark:text-primary-400',
    };
    return (<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className={`font-medium ${variantClasses[variant]}`}>
          {message}
        </p>
        
        <div className="flex justify-end">
          <button type="button" className="
              px-4 py-2 text-sm font-medium text-white
              bg-primary-600 hover:bg-primary-700
              rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-colors duration-200
            " onClick={onClose}>
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>);
}
//# sourceMappingURL=Modal.jsx.map