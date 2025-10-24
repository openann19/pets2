'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Added for optimized image loading
import { motion, Variants } from 'framer-motion'; // Enhanced with variants for reusable animations
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  SparklesIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// Define animation variants for consistency and perf (reusable across components)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HomePage() {
  const features = [
    {
      icon: HeartIcon,
      title: 'Smart Matching',
      description: 'AI-powered algorithm finds the perfect matches for your pet based on personality, location, and preferences.',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-Time Chat',
      description: 'Connect instantly with other pet owners through our secure messaging system.',
    },
    {
      icon: MapPinIcon,
      title: 'Location-Based',
      description: 'Find pets nearby for easy meetups and playdates in your local area.',
    },
    {
      icon: SparklesIcon,
      title: 'Premium Features',
      description: 'Unlock advanced AI filters, unlimited likes, and priority matching with Premium.',
    },
    {
      icon: UserGroupIcon,
      title: 'Safe Community',
      description: 'Verified profiles and secure platform ensure a safe environment for all pets and owners.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trusted Platform',
      description: 'Join thousands of happy pet owners who have found their perfect matches.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'San Francisco, CA',
      text: 'Luna found her best friend through PawfectMatch! They play together every weekend now.',
      petName: 'Luna',
      petType: 'Golden Retriever',
    },
    {
      name: 'Mike Chen',
      location: 'Austin, TX',
      text: 'The AI matching is incredible. Max was matched with a dog that has the exact same energy level!',
      petName: 'Max',
      petType: 'Border Collie',
    },
    {
      name: 'Emily Rodriguez',
      location: 'Miami, FL',
      text: 'We adopted Bella through PawfectMatch. The process was smooth and the owner was amazing.',
      petName: 'Bella',
      petType: 'Rescue Mix',
    },
  ];

  return (
    <>
      {/* Navigation - Enhanced with ARIA for accessibility */}
      <nav
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl" aria-hidden="true">
                🐾
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                PawfectMatch
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Optimized image with next/image, integrated CSS vars */}
      <section className="pt-20 pb-32 px-4 bg-[var(--background-gradient)]"> {/* Use enhanced CSS var */}
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Pet Match
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect your furry friends with their perfect companions. PawfectMatch uses AI-powered matching to help pets find their ideal playmates, adoption families, or breeding partners.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/about"
                className="bg-white text-gray-800 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-purple-300 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-2">
              <Image
                src="/images/hero-pets.jpg"
                alt="Happy pets together"
                width={1200} // Optimized dimensions
                height={500}
                className="w-full h-[500px] object-cover rounded-xl"
                loading="lazy" // Perf: Lazy load
                placeholder="blur" // Optional blur-up if blurDataURL added
                quality={85} // Balance size/quality
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Added viewport once for perf */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose PawfectMatch?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're dedicated to creating meaningful connections between pets and their humans.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300 pet-card-shadow" // Use enhanced CSS utility
              >
                <div className="w-12 h-12 bg-[rgb(var(--primary-rgb))] rounded-lg flex items-center justify-center mb-4"> {/* Integrate CSS var */}
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced with ARIA */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of pets who have found their perfect match.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                role="article" // ARIA for testimonial
              >
                <div className="mb-4">
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                    <p className="text-xs text-[rgb(var(--accent-rgb))]">{testimonial.petName} • {testimonial.petType}</p> {/* Use CSS var */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Added hover effects */}
      <section className="py-20 bg-[rgb(var(--primary-rgb))]"> {/* Use CSS var for dynamic theming */}
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Pet's Perfect Match?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join PawfectMatch today and start connecting with compatible pets in your area.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-[rgb(var(--accent-rgb))] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl premium-glow" // Use enhanced utility
          >
            Start Matching Now
          </Link>
        </div>
      </section>

      {/* Footer - Enhanced links with ARIA */}
      <footer className="bg-gray-900 text-white py-12" aria-label="Footer">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl" aria-hidden="true">
                  🐾
                </div>
                <span className="text-xl font-bold">PawfectMatch</span>
              </div>
              <p className="text-gray-400">Connecting pets with their perfect companions since 2024.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="hover:text-white">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-white">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PawfectMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}