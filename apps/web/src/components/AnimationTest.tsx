'use client';
// Animation Test Component
// Tests the new micro-interactions and animations
import React from 'react';
import { motion } from 'framer-motion';
import PremiumCard from './UI/PremiumCard';
import PremiumInput from './UI/PremiumInput';
import PremiumSkeleton, { SkeletonCard, SkeletonProfile, SkeletonList } from './UI/PremiumSkeleton';
const AnimationTest = () => {
    return (<div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Animation Test Suite</h1>
      
      {/* Hover Lift Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Hover Lift Effect</h2>
        <div className="flex gap-4">
          <div className="hover-lift bg-white p-6 rounded-xl shadow-lg cursor-pointer">
            <p>Hover me to lift!</p>
          </div>
          <div className="hover-scale bg-blue-100 p-6 rounded-xl shadow-lg cursor-pointer">
            <p>Hover me to scale!</p>
          </div>
          <div className="hover-glow bg-green-100 p-6 rounded-xl shadow-lg cursor-pointer">
            <p>Hover me to glow!</p>
          </div>
        </div>
      </div>

      {/* Pulse Animation Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pulse Animation</h2>
        <div className="flex gap-4 items-center">
          <div className="pulse-soft bg-yellow-100 p-6 rounded-xl shadow-lg">
            <p>I pulse softly!</p>
          </div>
          <div className="bg-red-100 p-6 rounded-xl shadow-lg">
            <p>I don't pulse</p>
          </div>
          <button className="fab pulse-soft" type="button">
            <span className="fab-tooltip">Get the App</span>
            Install
          </button>
        </div>
      </div>

      {/* Button Micro-interactions Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button Micro-interactions</h2>
        <div className="flex gap-4">
          <button className="btn-micro bg-blue-500 text-white px-6 py-3 rounded-lg">
            Micro Button
          </button>
          <button className="bg-gray-500 text-white px-6 py-3 rounded-lg">
            Regular Button
          </button>
        </div>
      </div>

      {/* Card Entrance + 3D Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Card Entrance + 3D Tilt</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (<div key={i} className="card-entrance card-3d bg-white p-6 rounded-xl shadow-lg" style={{ animationDelay: `${i * 0.1}s` }}>
              <p>Card {i}</p>
            </div>))}
        </div>
      </div>

      {/* Shimmer + Skeleton Loading Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Shimmer + Skeleton Loading</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (<div key={i} className="bg-white p-4 rounded-xl shadow-md">
              <div className="skeleton h-40 rounded-lg mb-4"></div>
              <div className="skeleton h-4 rounded mb-2"></div>
              <div className="skeleton h-4 w-1/2 rounded"></div>
            </div>))}
        </div>
      </div>

      {/* Typography + Tags + Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Typography + Tags + Steps</h2>
        <div className="space-y-2">
          <div className="display-large gradient-text">Premium Display Large</div>
          <div className="display-small">Display Small</div>
          <div className="pet-tags">
            <span className="pet-tag playful">🎾 Playful</span>
            <span className="pet-tag friendly">❤️ Friendly</span>
            <span className="pet-tag energetic">⚡ Energetic</span>
          </div>
          <div className="progress-steps">
            <div className="step active">
              <div className="step-number">1</div>
              <span>Profile</span>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <span>Preferences</span>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <span>Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bounce Animation Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Bounce Animation</h2>
        <div className="flex gap-4">
          <div className="bounce-in bg-purple-100 p-6 rounded-xl shadow-lg">
            <p>I bounce in!</p>
          </div>
        </div>
      </div>

      {/* Swipe Animation Test + Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Swipe Animations</h2>
        <div className="flex gap-4">
          <div className="swipe-right bg-green-100 p-6 rounded-xl shadow-lg">
            <p>Swipe Right</p>
          </div>
          <div className="swipe-left bg-red-100 p-6 rounded-xl shadow-lg">
            <p>Swipe Left</p>
          </div>
        </div>
        <div className="swipe-demo-container">
          <div className="swipe-instruction">
            <span>Swipe to see how it works!</span>
          </div>
          <motion.div className="pet-card-swipeable" drag dragConstraints={{ left: -120, right: 120, top: 0, bottom: 0 }} dragElastic={0.2} onDrag={(event, info) => {
            const el = event.currentTarget;
            if (!el)
                return;
            const dir = info.point.x - info.offset.x > 0 ? 'right' : 'left';
            el.classList.toggle('is-right', dir === 'right' && info.offset.x > 20);
            el.classList.toggle('is-left', dir === 'left' && info.offset.x < -20);
        }} onDragEnd={(event) => {
            const el = event.currentTarget;
            if (!el)
                return;
            el.classList.remove('is-left');
            el.classList.remove('is-right');
        }}>
            <div className="swipe-overlay left">
              <span>Nope</span>
            </div>
            <div className="swipe-overlay right">
              <span>Like</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Premium Components Showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Premium Components</h2>
        
        {/* Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PremiumCard variant="glass" hover tilt>
            <h3 className="font-semibold mb-2">Glass Card</h3>
            <p className="text-gray-600">Beautiful glassmorphism effect with 3D tilt</p>
          </PremiumCard>
          
          <PremiumCard variant="gradient" shimmer magnetic>
            <h3 className="font-semibold mb-2">Gradient Card</h3>
            <p className="text-white/90">Shimmer effect with magnetic hover</p>
          </PremiumCard>
          
          <PremiumCard variant="neon" glow>
            <h3 className="font-semibold mb-2">Neon Card</h3>
            <p className="text-pink-400">Glowing neon border effect</p>
          </PremiumCard>
        </div>

        {/* Premium Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Premium Inputs</h3>
            <PremiumInput variant="floating" label="Floating Label" placeholder="Enter your name" leftIcon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>}/>
            <PremiumInput variant="outlined" label="Outlined Input" placeholder="Enter your email" type="email" rightIcon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>}/>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Input States</h3>
            <PremiumInput variant="default" label="Filled Input" placeholder="With helper text" helperText="This is helpful information"/>
            <PremiumInput variant="default" label="Error State" placeholder="This has an error" error="This field is required" value="invalid@"/>
          </div>
        </div>

        {/* Premium Skeletons */}
        <div className="space-y-6">
          <h3 className="font-semibold">Premium Skeleton Loaders</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Card Skeleton</h4>
              <SkeletonCard />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Profile Skeleton</h4>
              <SkeletonProfile />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">List Skeleton</h4>
            <SkeletonList count={3}/>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PremiumSkeleton variant="rectangular" height={100} animation="shimmer"/>
            <PremiumSkeleton variant="circular" width={80} height={80} animation="wave"/>
            <PremiumSkeleton variant="text" width="80%" animation="glow"/>
            <PremiumSkeleton variant="button" width={120} animation="pulse"/>
          </div>
        </div>
      </div>
    </div>);
};
export default AnimationTest;
//# sourceMappingURL=AnimationTest.jsx.map