/**
 * In-App Feedback Widget
 * Tiny "🐾 Feedback" tab that posts to Slack or Linear
 */
'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, ExclamationTriangleIcon, CheckCircleIcon, StarIcon, BugAntIcon, LightBulbIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth-store';
import { InteractiveButton } from '@/components/ui/Interactive';
export function FeedbackWidget({ className = '', position = 'bottom-right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        type: 'general',
        message: '',
        rating: 5,
        email: '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString()
    });
    const { user } = useAuthStore();
    const textareaRef = useRef(null);
    // Pre-fill email if user is logged in
    useEffect(() => {
        if (user?.email && !formData.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user, formData.email]);
    // Auto-focus textarea when opened
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userId: user?.id,
                    userName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous'
                })
            });
            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }
            setIsSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitted(false);
                setFormData({
                    type: 'general',
                    message: '',
                    rating: 5,
                    email: user?.email || '',
                    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
                    url: typeof window !== 'undefined' ? window.location.href : '',
                    timestamp: new Date().toISOString()
                });
            }, 2000);
        }
        catch (error) {
            setError(error.message);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    };
    const feedbackTypes = [
        { id: 'bug', label: 'Bug Report', icon: BugAntIcon, color: 'text-red-600' },
        { id: 'feature', label: 'Feature Request', icon: LightBulbIcon, color: 'text-blue-600' },
        { id: 'general', label: 'General Feedback', icon: ChatBubbleLeftRightIcon, color: 'text-gray-600' },
        { id: 'love', label: 'Love & Appreciation', icon: HeartIcon, color: 'text-pink-600' }
    ];
    return (<>
      {/* Feedback Tab */}
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className={`fixed ${positionClasses[position]} z-50 ${className}`}>
        <button onClick={() => { setIsOpen(true); }} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group" aria-label="Send feedback">
          <ChatBubbleLeftRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"/>
        </button>
      </motion.div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmitting && setIsOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 mr-3"/>
                    <h2 className="text-xl font-bold">Share Your Feedback</h2>
                  </div>
                  <button onClick={() => { setIsOpen(false); }} disabled={isSubmitting} className="text-white/80 hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6"/>
                  </button>
                </div>
                <p className="text-pink-100 mt-2 text-sm">
                  Help us make PawfectMatch even better!
                </p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {isSubmitted ? (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Thank you! 🐾
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Your feedback has been sent to our team. We appreciate your input!
                    </p>
                  </motion.div>) : (<form onSubmit={handleSubmit} className="space-y-6">
                    {/* Feedback Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        What type of feedback is this?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    return (<button key={type.id} type="button" onClick={() => { handleInputChange('type', type.id); }} className={`
                                p-3 rounded-lg border-2 transition-all duration-200 text-left
                                ${formData.type === type.id
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}
                              `}>
                              <Icon className={`w-5 h-5 mb-2 ${type.color}`}/>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {type.label}
                              </div>
                            </button>);
                })}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        How would you rate your experience?
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (<button key={rating} type="button" onClick={() => { handleInputChange('rating', rating); }} className={`
                              p-2 rounded-lg transition-all duration-200
                              ${formData.rating && formData.rating >= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'}
                            `}>
                            <StarIcon className="w-6 h-6"/>
                          </button>))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your feedback
                      </label>
                      <textarea ref={textareaRef} value={formData.message} onChange={(e) => { handleInputChange('message', e.target.value); }} placeholder="Tell us what's on your mind..." className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white" rows={4} required/>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email (optional)
                      </label>
                      <input type="email" value={formData.email} onChange={(e) => { handleInputChange('email', e.target.value); }} placeholder="your@email.com" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"/>
                    </div>

                    {/* Error */}
                    {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mr-2"/>
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </motion.div>)}

                    {/* Submit Button */}
                    <InteractiveButton type="submit" disabled={isSubmitting || !formData.message} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200" icon={isSubmitting ? (<div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"/>) : (<PaperAirplaneIcon className="w-5 h-5"/>)}>
                      {isSubmitting ? 'Sending...' : 'Send Feedback'}
                    </InteractiveButton>
                  </form>)}
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </>);
}
// Compact feedback button for specific pages
export function CompactFeedbackButton({ type = 'general', className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    return (<>
      <InteractiveButton onClick={() => { setIsOpen(true); }} variant="outline" size="sm" className={`text-gray-600 hover:text-gray-800 ${className}`} icon={<ChatBubbleLeftRightIcon className="w-4 h-4"/>}>
        Feedback
      </InteractiveButton>

      <AnimatePresence>
        {isOpen && (<FeedbackWidget />)}
      </AnimatePresence>
    </>);
}
//# sourceMappingURL=FeedbackWidget.jsx.map