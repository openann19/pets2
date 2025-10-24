'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
const REJECTION_TEMPLATES = [
    {
        category: 'explicit',
        label: 'Explicit Content',
        icon: '🔞',
        reason: 'This photo contains explicit or inappropriate sexual content that violates our community guidelines.',
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-500/20',
    },
    {
        category: 'violence',
        label: 'Violence',
        icon: '⚠️',
        reason: 'This photo contains violent or disturbing content including animal abuse or cruelty.',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-500/20',
    },
    {
        category: 'self-harm',
        label: 'Self-Harm',
        icon: '🚨',
        reason: 'This photo contains self-harm content or imagery that could be harmful to viewers.',
        color: 'from-red-500 to-pink-600',
        bgColor: 'bg-red-500/20',
    },
    {
        category: 'drugs',
        label: 'Drugs',
        icon: '💊',
        reason: 'This photo contains drug paraphernalia or illegal substances.',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-500/20',
    },
    {
        category: 'hate-speech',
        label: 'Hate Speech',
        icon: '🚫',
        reason: 'This photo contains hate symbols, offensive gestures, or discriminatory content.',
        color: 'from-red-600 to-red-700',
        bgColor: 'bg-red-600/20',
    },
    {
        category: 'spam',
        label: 'Spam / Irrelevant',
        icon: '📧',
        reason: 'This photo is spam, not pet-related, or does not meet content requirements.',
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-500/20',
    },
    {
        category: 'quality',
        label: 'Poor Quality',
        icon: '📸',
        reason: 'This photo does not meet our quality standards (blurry, dark, or unclear).',
        color: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-500/20',
    },
    {
        category: 'other',
        label: 'Other Violation',
        icon: '⚡',
        reason: 'This photo violates our community guidelines.',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-500/20',
    },
];
export default function EnhancedRejectModal({ isOpen, onClose, onConfirm }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [customReason, setCustomReason] = useState('');
    // Not using this state variable yet, but keeping for future enhancements
    // const [useCustomReason, setUseCustomReason] = useState(false);
    const [step, setStep] = useState('select');
    const modalRef = useRef(null);
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory(null);
            setCustomReason('');
            // setUseCustomReason(false);
            setStep('select');
        }
    }, [isOpen]);
    const handleTemplateSelect = (category) => {
        setSelectedCategory(category);
        const template = REJECTION_TEMPLATES.find((t) => t.category === category);
        if (template) {
            setCustomReason(template.reason);
        }
        setStep('customize');
    };
    const handleConfirm = () => {
        if (!selectedCategory)
            return;
        const reason = customReason.trim() || 'Violates community guidelines';
        onConfirm(reason, selectedCategory);
        onClose();
    };
    if (!isOpen)
        return null;
    const selectedTemplate = REJECTION_TEMPLATES.find((t) => t.category === selectedCategory);
    return (<AnimatePresence>
      {isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div ref={modalRef} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="w-full max-w-3xl">
            <GlassCard variant="heavy" blur="xl" className="overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-red-500/20 to-orange-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-400"/>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Reject Photo</h2>
                      <p className="text-sm text-white/70">
                        {step === 'select' && 'Select a rejection category'}
                        {step === 'customize' && 'Customize the rejection message'}
                        {step === 'confirm' && 'Confirm rejection'}
                      </p>
                    </div>
                  </div>
                  <AnimatedButton variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-5 h-5"/>
                  </AnimatedButton>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Step 1: Select Category */}
                  {step === 'select' && (<motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <div className="grid grid-cols-2 gap-3">
                        {REJECTION_TEMPLATES.map((template) => (<motion.button key={template.category} onClick={() => handleTemplateSelect(template.category)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`p-4 rounded-xl border-2 border-white/10 text-left transition-all ${template.bgColor} hover:border-white/30`}>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">{template.icon}</span>
                              <span className="font-bold text-white">{template.label}</span>
                            </div>
                            <p className="text-xs text-white/70 line-clamp-2">{template.reason}</p>
                          </motion.button>))}
                      </div>
                    </motion.div>)}

                  {/* Step 2: Customize Message */}
                  {step === 'customize' && selectedTemplate && (<motion.div key="customize" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                      {/* Selected Category */}
                      <GlassCard variant="light" className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${selectedTemplate.color}`}>
                            <span className="text-2xl">{selectedTemplate.icon}</span>
                          </div>
                          <div>
                            <div className="font-bold text-white">{selectedTemplate.label}</div>
                            <div className="text-sm text-white/60">Selected category</div>
                          </div>
                          <AnimatedButton variant="ghost" size="sm" onClick={() => setStep('select')} className="ml-auto">
                            Change
                          </AnimatedButton>
                        </div>
                      </GlassCard>

                      {/* Message Editor */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Rejection Message
                        </label>
                        <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} rows={5} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none" placeholder="Enter a custom rejection reason..."/>
                        <p className="text-xs text-white/60 mt-2 flex items-center gap-2">
                          <Sparkles className="h-3 w-3"/>
                          Be specific and constructive. This helps users understand what went wrong.
                        </p>
                      </div>

                      {/* Preview */}
                      <GlassCard variant="light" className="p-4">
                        <div className="text-xs font-semibold text-white/60 uppercase mb-2">
                          User will see:
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <p className="text-sm text-white/90">{customReason || 'No message provided'}</p>
                        </div>
                      </GlassCard>
                    </motion.div>)}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <AnimatedButton variant="ghost" onClick={onClose}>
                  Cancel
                </AnimatedButton>

                <div className="flex gap-2">
                  {step === 'customize' && (<AnimatedButton variant="ghost" onClick={() => setStep('select')}>
                      Back
                    </AnimatedButton>)}
                  {step === 'customize' && (<AnimatedButton variant="primary" onClick={handleConfirm} disabled={!customReason.trim()} className="bg-red-500 hover:bg-red-600">
                      <CheckCircle2 className="h-4 w-4 mr-2"/>
                      Confirm Rejection
                    </AnimatedButton>)}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
//# sourceMappingURL=EnhancedRejectModal.jsx.map