'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Sparkles } from 'lucide-react';
const REJECTION_TEMPLATES = [
    {
        category: 'explicit',
        label: 'Explicit Content',
        icon: '🔞',
        reason: 'This photo contains explicit or inappropriate sexual content that violates our community guidelines.',
        color: 'bg-red-100 border-red-300 hover:bg-red-200'
    },
    {
        category: 'violence',
        label: 'Violence',
        icon: '⚠️',
        reason: 'This photo contains violent or disturbing content including animal abuse or cruelty.',
        color: 'bg-orange-100 border-orange-300 hover:bg-orange-200'
    },
    {
        category: 'self-harm',
        label: 'Self-Harm',
        icon: '🚨',
        reason: 'This photo contains self-harm content or imagery that could be harmful to viewers.',
        color: 'bg-red-100 border-red-300 hover:bg-red-200'
    },
    {
        category: 'drugs',
        label: 'Drugs',
        icon: '💊',
        reason: 'This photo contains drug paraphernalia or illegal substances.',
        color: 'bg-purple-100 border-purple-300 hover:bg-purple-200'
    },
    {
        category: 'hate-speech',
        label: 'Hate Speech',
        icon: '🚫',
        reason: 'This photo contains hate symbols, offensive gestures, or discriminatory content.',
        color: 'bg-red-100 border-red-300 hover:bg-red-200'
    },
    {
        category: 'spam',
        label: 'Spam / Irrelevant',
        icon: '📧',
        reason: 'This photo is spam, not pet-related, or does not meet content requirements.',
        color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
    },
    {
        category: 'other',
        label: 'Other Violation',
        icon: '⚡',
        reason: 'This photo violates our community guidelines.',
        color: 'bg-gray-100 border-gray-300 hover:bg-gray-200'
    }
];
export default function RejectModal({ isOpen, onClose, onConfirm }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [customReason, setCustomReason] = useState('');
    const [useCustomReason, setUseCustomReason] = useState(false);
    const modalRef = useRef(null);
    const firstButtonRef = useRef(null);
    useEffect(() => {
        if (!isOpen)
            return;
        // Focus first button when modal opens
        setTimeout(() => firstButtonRef.current?.focus(), 100);
        // Trap focus within modal
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
            if (e.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElements && focusableElements.length > 0) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                    else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => { document.removeEventListener('keydown', handleKeyDown); };
    }, [isOpen, onClose]);
    useEffect(() => {
        // Reset state when modal closes
        if (!isOpen) {
            setSelectedCategory(null);
            setCustomReason('');
            setUseCustomReason(false);
        }
    }, [isOpen]);
    const handleConfirm = () => {
        if (!selectedCategory)
            return;
        const template = REJECTION_TEMPLATES.find(t => t.category === selectedCategory);
        const reason = useCustomReason && customReason.trim()
            ? customReason.trim()
            : template?.reason || 'Violates community guidelines';
        onConfirm(reason, selectedCategory);
        onClose();
    };
    const handleTemplateSelect = (category) => {
        setSelectedCategory(category);
        setUseCustomReason(false);
        const template = REJECTION_TEMPLATES.find(t => t.category === category);
        if (template) {
            setCustomReason(template.reason);
        }
    };
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      {isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
          <motion.div ref={modalRef} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-3">
            <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 400 }} className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600"/>
            </motion.div>
            <div>
              <h2 id="reject-modal-title" className="text-xl font-bold text-gray-900">
                Reject Photo
              </h2>
              <p className="text-xs text-gray-600">Select a category and provide feedback</p>
            </div>
          </div>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} className="p-2 hover:bg-red-100 rounded-lg transition-colors" aria-label="Close modal">
            <X className="w-5 h-5 text-gray-600"/>
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-600 mb-4">
            Select a rejection reason. You can customize the message that will be sent to the user.
          </p>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {REJECTION_TEMPLATES.map((template, index) => (<motion.button key={template.category} ref={index === 0 ? firstButtonRef : null} onClick={() => { handleTemplateSelect(template.category); }} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className={`
                  p-4 rounded-xl border-2 text-left transition-all shadow-sm
                  ${selectedCategory === template.category
                    ? 'ring-2 ring-red-500 border-red-500 bg-red-50 shadow-lg'
                    : template.color + ' hover:shadow-md'}
                `} aria-pressed={selectedCategory === template.category}>
                <div className="flex items-center gap-2 mb-2">
                  <motion.span className="text-2xl" role="img" aria-label={template.label} animate={selectedCategory === template.category ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                    {template.icon}
                  </motion.span>
                  <span className="font-semibold text-gray-900">{template.label}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{template.reason}</p>
              </motion.button>))}
          </div>

          {/* Custom Reason Toggle */}
          {selectedCategory && (<div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useCustomReason} onChange={(e) => { setUseCustomReason(e.target.checked); }} className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"/>
                <span className="text-sm font-medium text-gray-700">
                  Customize rejection message
                </span>
              </label>
            </div>)}

          {/* Custom Reason Input */}
          {selectedCategory && useCustomReason && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <label htmlFor="custom-reason" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Sparkles className="h-4 w-4 text-yellow-500"/>
                Custom Message (shown to user)
              </label>
              <textarea id="custom-reason" value={customReason} onChange={(e) => { setCustomReason(e.target.value); }} rows={4} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all" placeholder="Enter a custom rejection reason..."/>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3"/>
                Be specific and constructive. This message will help the user understand what went wrong.
              </p>
            </motion.div>)}

          {/* Preview */}
          {selectedCategory && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 shadow-inner">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                User will see:
              </p>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {useCustomReason && customReason.trim()
                    ? customReason
                    : REJECTION_TEMPLATES.find(t => t.category === selectedCategory)?.reason}
                </p>
              </div>
            </motion.div>)}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between gap-3">
          <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors">
            Cancel
          </motion.button>
          <motion.button onClick={handleConfirm} disabled={!selectedCategory} whileHover={{ scale: selectedCategory ? 1.05 : 1 }} whileTap={{ scale: selectedCategory ? 0.95 : 1 }} className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none">
            Confirm Rejection
          </motion.button>
        </div>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
//# sourceMappingURL=RejectModal.jsx.map