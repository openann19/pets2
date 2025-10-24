'use client';

import React from 'react';
import Link from 'next/link';
// import { motion } from 'framer-motion';
import {
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumButton from '@/components/UI/PremiumButton';
// import { SPRING_CONFIG } from '@/constants/animations';

export default function DemoWorkflowPage() {
  const steps = [
    {
      number: 1,
      title: 'Browse Pets Freely',
      description:
        'No signup required! Browse through adorable pets and see their photos, details, and owner information.',
      icon: EyeIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      action: 'Browse Now',
      href: '/browse',
    },
    {
      number: 2,
      title: 'Like or Chat',
      description:
        "When you find a pet you love, click Like or Chat. We'll ask you to sign up at this point.",
      icon: HeartIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      action: 'Try It',
      href: '/browse',
    },
    {
      number: 3,
      title: 'Quick Signup',
      description:
        'Simple signup process. Just email and password. No lengthy forms or verification required.',
      icon: UserIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      action: 'Sign Up',
      href: '/register',
    },
    {
      number: 4,
      title: 'Start Connecting',
      description: 'Once signed up, you can like pets, chat with owners, and arrange meetups!',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      action: 'Get Started',
      href: '/browse',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            🎯 New User-Friendly Workflow
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Browse pets without any barriers. Only sign up when you&apos;re ready to connect!
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, _index) => (
            <div key={step.number}>
              <PremiumCard
                className="h-full p-6 text-center"
                variant="glass"
              >
                <div
                  className={`w-16 h-16 bg-white/10 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <step.icon className={`w-8 h-8 text-white`} />
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-white mb-2">Step {step.number}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-white/70 text-sm">{step.description}</p>
                </div>

                <Link href={step.href}>
                  <PremiumButton
                    size="sm"
                    variant={step.number === 1 ? 'primary' : 'secondary'}
                    className="w-full"
                    icon={<ArrowRightIcon className="w-4 h-4" />}
                  >
                    {step.action}
                  </PremiumButton>
                </Link>
              </PremiumCard>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <PremiumCard
            className="p-8"
            variant="glass"
          >
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              ✨ Why This Workflow is Better
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">No Barriers</h3>
                <p className="text-white/70 text-sm">
                  Users can explore immediately without any signup friction
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Higher Conversion</h3>
                <p className="text-white/70 text-sm">
                  Users are more likely to sign up after seeing value
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Better UX</h3>
                <p className="text-white/70 text-sm">
                  Natural flow that feels intuitive and user-friendly
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Demo Actions */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">🚀 Try the New Workflow</h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <PremiumButton
                size="lg"
                variant="primary"
                icon={<EyeIcon className="w-5 h-5" />}
              >
                Browse Pets Now
              </PremiumButton>
            </Link>

            <Link href="/dev/demo-chat-video">
              <PremiumButton
                size="lg"
                variant="secondary"
                icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
              >
                Test Chat & Video
              </PremiumButton>
            </Link>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12">
          <PremiumCard
            className="p-6"
            variant="glass"
          >
            <h3 className="text-xl font-bold text-white mb-4">🔧 Technical Implementation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
              <div>
                <strong>Public Browse Page:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• No authentication required</li>
                  <li>• Mock data for demo</li>
                  <li>• Photo carousel</li>
                  <li>• Like/Chat buttons trigger login modal</li>
                </ul>
              </div>
              <div>
                <strong>Login Modal:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Context-aware messaging</li>
                  <li>• Different for Like vs Chat</li>
                  <li>• Quick signup/login options</li>
                  <li>• Continue browsing option</li>
                </ul>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
