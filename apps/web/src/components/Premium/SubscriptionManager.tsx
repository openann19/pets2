'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon, SparklesIcon, BoltIcon, ShieldCheckIcon, HeartIcon, StarIcon, ArrowRightIcon, CurrencyDollarIcon, FireIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '../../services/api';
import { logger } from '../../services/logger';
export function SubscriptionManager() {
    const { user } = useAuthStore();
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingInterval, setBillingInterval] = useState('monthly');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [usageStats, setUsageStats] = useState(null);
    const premiumPlans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 0,
            currency: 'USD',
            interval: 'monthly',
            stripePriceId: '',
            features: [
                '5 daily swipes',
                'Basic matching',
                'Standard chat',
                'Weather updates',
                'Community support'
            ]
        },
        {
            id: 'premium',
            name: 'Premium',
            price: billingInterval === 'monthly' ? 9.99 : 89.99,
            currency: 'USD',
            interval: billingInterval,
            popular: true,
            savings: billingInterval === 'yearly' ? 'Save 25%' : undefined,
            stripePriceId: billingInterval === 'monthly' ? 'price_premium_monthly' : 'price_premium_yearly',
            features: [
                '✨ Unlimited swipes',
                '🎯 AI-powered matching',
                '💬 Priority chat features',
                '📸 Advanced photo analysis',
                '🧬 AI bio generation',
                '❤️ Compatibility scoring',
                '🌟 See who liked you',
                '⚡ Boost your profile',
                '🎁 5 Super Likes per day',
                '🔄 Unlimited rewinds',
                '📊 Advanced analytics',
                '💎 Premium badge',
                '🎧 Priority support'
            ]
        },
        {
            id: 'ultimate',
            name: 'Ultimate',
            price: billingInterval === 'monthly' ? 19.99 : 179.99,
            currency: 'USD',
            interval: billingInterval,
            savings: billingInterval === 'yearly' ? 'Save 25%' : undefined,
            stripePriceId: billingInterval === 'monthly' ? 'price_ultimate_monthly' : 'price_ultimate_yearly',
            features: [
                '🚀 Everything in Premium',
                '👑 VIP status',
                '🔥 Unlimited Super Likes',
                '🌍 Global passport',
                '🎯 Priority AI matching',
                '📱 Early feature access',
                '🤖 Custom AI training',
                '📹 Video chat features',
                '🏆 Exclusive events',
                '🎁 Monthly surprises',
                '🛡️ Identity verification',
                '🏅 Concierge support',
                '💫 Profile verification',
                '🎨 Custom themes'
            ]
        }
    ];
    useEffect(() => {
        loadSubscription();
        loadUsageStats();
        setPlans(premiumPlans);
    }, [billingInterval]);
    const loadSubscription = async () => {
        try {
            const subscription = await api.subscription.getCurrentSubscription();
            setCurrentSubscription(subscription);
            logger.info('Subscription loaded', { status: subscription?.status });
        }
        catch (error) {
            logger.error('Failed to load subscription', error);
        }
    };
    const loadUsageStats = async () => {
        try {
            const stats = await api.subscription.getUsageStats();
            setUsageStats(stats);
        }
        catch (error) {
            logger.error('Failed to load usage stats', error);
        }
    };
    const handleSubscribe = async (plan) => {
        if (plan.id === 'basic')
            return;
        setIsProcessing(true);
        setSelectedPlan(plan);
        try {
            // Create checkout session
            const result = await api.subscription.createCheckoutSession({
                plan: plan.id,
                interval: billingInterval === 'monthly' ? 'month' : 'year'
            });
            // Redirect to Stripe Checkout
            if (result.url) {
                window.location.href = result.url;
            }
            else if (result.sessionId) {
                // Fallback to Stripe.js if URL not provided
                const stripe = await loadStripe();
                if (stripe) {
                    await stripe.redirectToCheckout({ sessionId: result.sessionId });
                }
            }
            logger.info('Checkout session created', { planId: plan.id });
        }
        catch (error) {
            logger.error('Subscription failed', error);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleCancelSubscription = async () => {
        if (!currentSubscription)
            return;
        setIsProcessing(true);
        try {
            await api.subscription.cancelSubscription();
            setCurrentSubscription({
                ...currentSubscription,
                cancelAtPeriodEnd: true
            });
            logger.info('Subscription cancelled');
        }
        catch (error) {
            logger.error('Failed to cancel subscription', error);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleReactivateSubscription = async () => {
        if (!currentSubscription)
            return;
        setIsProcessing(true);
        try {
            await api.subscription.reactivateSubscription(currentSubscription.id);
            setCurrentSubscription({
                ...currentSubscription,
                cancelAtPeriodEnd: false
            });
            logger.info('Subscription reactivated');
        }
        catch (error) {
            logger.error('Failed to reactivate subscription', error);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const loadStripe = async () => {
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!stripeKey) {
            logger.error('Stripe key not configured');
            return null;
        }
        // Dynamically load Stripe.js
        const { loadStripe } = await import('@stripe/stripe-js');
        return loadStripe(stripeKey);
    };
    return (<div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4">
          <SparklesIcon className="h-10 w-10 text-white"/>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Unlock Premium Features
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find your pet's perfect match faster with AI-powered features and unlimited possibilities
        </p>
      </motion.div>

      {/* Current Subscription */}
      {currentSubscription && currentSubscription.status === 'active' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="h-6 w-6 mr-2"/>
                <h2 className="text-2xl font-bold">
                  {currentSubscription.plan.name} Member
                </h2>
              </div>
              <p className="opacity-90">
                {currentSubscription.cancelAtPeriodEnd
                ? `Subscription ends on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                : `Next billing date: ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            </div>
            
            <div className="flex gap-3">
              {currentSubscription.cancelAtPeriodEnd ? (<button onClick={handleReactivateSubscription} disabled={isProcessing} className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50">
                  Reactivate
                </button>) : (<>
                  <button onClick={() => window.location.href = '/account/billing'} className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">
                    Manage Billing
                  </button>
                  <button onClick={handleCancelSubscription} disabled={isProcessing} className="px-6 py-3 bg-white/10 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/20 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                </>)}
            </div>
          </div>
        </motion.div>)}

      {/* Usage Stats */}
      {usageStats && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <HeartIcon className="h-8 w-8 text-pink-500"/>
              <span className="text-2xl font-bold">{usageStats.swipesUsed || 0}</span>
            </div>
            <p className="text-gray-600">Daily Swipes</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${(usageStats.swipesUsed / usageStats.swipesLimit) * 100}%` }}/>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <StarIcon className="h-8 w-8 text-yellow-500"/>
              <span className="text-2xl font-bold">{usageStats.superLikesUsed || 0}</span>
            </div>
            <p className="text-gray-600">Super Likes</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${(usageStats.superLikesUsed / usageStats.superLikesLimit) * 100}%` }}/>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BoltIcon className="h-8 w-8 text-blue-500"/>
              <span className="text-2xl font-bold">{usageStats.boostsUsed || 0}</span>
            </div>
            <p className="text-gray-600">Profile Boosts</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${(usageStats.boostsUsed / usageStats.boostsLimit) * 100}%` }}/>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FireIcon className="h-8 w-8 text-orange-500"/>
              <span className="text-2xl font-bold">{usageStats.matchRate || 0}%</span>
            </div>
            <p className="text-gray-600">Match Rate</p>
            <p className="text-xs text-gray-500 mt-2">
              {currentSubscription?.plan.id === 'premium' || currentSubscription?.plan.id === 'ultimate'
                ? '+35% with Premium'
                : 'Upgrade for better rates'}
            </p>
          </div>
        </motion.div>)}

      {/* Billing Interval Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-full p-1 flex">
          <button onClick={() => setBillingInterval('monthly')} className={`px-6 py-2 rounded-full font-semibold transition-all ${billingInterval === 'monthly'
            ? 'bg-white text-gray-900 shadow-md'
            : 'text-gray-600'}`}>
            Monthly
          </button>
          <button onClick={() => setBillingInterval('yearly')} className={`px-6 py-2 rounded-full font-semibold transition-all ${billingInterval === 'yearly'
            ? 'bg-white text-gray-900 shadow-md'
            : 'text-gray-600'}`}>
            Yearly
            <span className="ml-2 text-xs text-green-600 font-bold">Save 25%</span>
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (<motion.div key={`${plan.id}-${plan.interval}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} className={`relative bg-white rounded-3xl shadow-xl overflow-hidden ${plan.popular ? 'ring-4 ring-purple-500' : ''}`}>
            {plan.popular && (<div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                MOST POPULAR
              </div>)}
            
            {plan.savings && (<div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 rounded-br-xl text-sm font-semibold">
                {plan.savings}
              </div>)}
            
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="ml-2 text-gray-600">/{plan.interval}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (<li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"/>
                    <span className="text-gray-700">{feature}</span>
                  </li>))}
              </ul>
              
              <button onClick={() => handleSubscribe(plan)} disabled={isProcessing || currentSubscription?.plan.id === plan.id} className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center ${currentSubscription?.plan.id === plan.id
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    : plan.id === 'basic'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                {currentSubscription?.plan.id === plan.id ? (<>
                    <CheckCircleIcon className="h-5 w-5 mr-2"/>
                    Current Plan
                  </>) : isProcessing && selectedPlan?.id === plan.id ? (<>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <ArrowRightIcon className="h-5 w-5 mr-2"/>
                    </motion.div>
                    Processing...
                  </>) : plan.id === 'basic' ? ('Current Plan') : (<>
                    Get {plan.name}
                    <ArrowRightIcon className="h-5 w-5 ml-2"/>
                  </>)}
              </button>
            </div>
          </motion.div>))}
      </div>

      {/* Features Comparison */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Upgrade?</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <SparklesIcon className="h-8 w-8 text-purple-600"/>
            </div>
            <h3 className="font-semibold text-lg mb-2">AI-Powered Matching</h3>
            <p className="text-gray-600">
              Our AI analyzes thousands of data points to find your pet's perfect match
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <HeartIcon className="h-8 w-8 text-pink-600"/>
            </div>
            <h3 className="font-semibold text-lg mb-2">3x More Matches</h3>
            <p className="text-gray-600">
              Premium members get 3x more matches on average than free users
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <BoltIcon className="h-8 w-8 text-blue-600"/>
            </div>
            <h3 className="font-semibold text-lg mb-2">Priority Support</h3>
            <p className="text-gray-600">
              Get help from our expert team within minutes, not hours
            </p>
          </div>
        </div>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setShowSuccess(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircleIcon className="h-10 w-10 text-green-600"/>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Premium!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Your subscription is now active. Enjoy unlimited features!
                </p>
                
                <button onClick={() => setShowSuccess(false)} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  Start Exploring
                </button>
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
//# sourceMappingURL=SubscriptionManager.jsx.map