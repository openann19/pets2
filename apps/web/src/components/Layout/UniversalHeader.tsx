/**
 * Universal Elite Header Component
 *
 * Consistent, premium header across all authenticated pages
 * Features: Logo, Navigation, Notifications, Profile
 */
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, HeartIcon, ChatBubbleLeftRightIcon, MapPinIcon, SparklesIcon, BellIcon, Cog6ToothIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, UserGroupIcon, } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth-store';
import HoloLogo from '@/components/Brand/HoloLogo';
import SafeImage from '@/components/UI/SafeImage';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
const navigation = [
    { name: 'Dashboard', href: './dashboard', icon: HomeIcon },
    { name: 'Pawfiles', href: './pawfiles', icon: UserGroupIcon },
    { name: 'Swipe', href: './swipe', icon: HeartIcon },
    { name: 'Matches', href: './matches', icon: ChatBubbleLeftRightIcon },
    { name: 'Map', href: './map', icon: MapPinIcon },
    { name: 'Premium', href: './premium', icon: SparklesIcon },
];
export default function UniversalHeader({ showNav = true }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    const profileButtonRef = useRef(null);
    const notificationsButtonRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);
    // Click outside to close menus (reusable hook)
    useClickOutside(profileMenuRef, () => {
        if (profileMenuOpen) {
            setProfileMenuOpen(false);
            requestAnimationFrame(() => profileButtonRef.current?.focus());
        }
    }, profileMenuOpen);
    useClickOutside(notificationsRef, () => {
        if (notificationsOpen) {
            setNotificationsOpen(false);
            requestAnimationFrame(() => notificationsButtonRef.current?.focus());
        }
    }, notificationsOpen);
    useClickOutside(mobileMenuRef, (e) => {
        const target = e.target;
        if (mobileMenuOpen && mobileMenuButtonRef.current && !mobileMenuButtonRef.current.contains(target)) {
            setMobileMenuOpen(false);
            requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
        }
    }, mobileMenuOpen);
    // Escape key to close menus (reusable hook)
    useEscapeKey(() => {
        if (profileMenuOpen) {
            setProfileMenuOpen(false);
            requestAnimationFrame(() => profileButtonRef.current?.focus());
        }
        if (notificationsOpen) {
            setNotificationsOpen(false);
            requestAnimationFrame(() => notificationsButtonRef.current?.focus());
        }
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
            requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
        }
    }, profileMenuOpen || notificationsOpen || mobileMenuOpen);
    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };
    const isActive = (href) => pathname === href || pathname?.startsWith(href + '/');
    return (<>
      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <HoloLogo size={36} withText={false} monochrome/>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-purple-500 transition-all">
                PawfectMatch
              </span>
            </Link>

            {/* Desktop Navigation */}
            {showNav && (<nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (<Link key={item.name} href={item.href}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`relative px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${active
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                        <Icon className="w-5 h-5"/>
                        <span className="font-medium">{item.name}</span>
                        
                        {active && (<motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600" transition={{ type: "spring", stiffness: 500, damping: 30 }}/>)}
                      </motion.div>
                    </Link>);
            })}
              </nav>)}

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div ref={notificationsRef} className="relative">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setNotificationsOpen(!notificationsOpen); }} className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all" ref={notificationsButtonRef}>
                  <BellIcon className="w-6 h-6"/>
                  {/* Notification Badge */}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (<motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                      <div className="p-4 border-b border-white/10">
                        <h3 className="font-bold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-8 text-center text-white/60">
                          <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                          <p className="text-sm">No new notifications</p>
                        </div>
                      </div>
                    </motion.div>)}
                </AnimatePresence>
              </div>

              {/* Profile Menu */}
              <div ref={profileMenuRef} className="relative">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setProfileMenuOpen(!profileMenuOpen); }} className="flex items-center gap-2 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all" ref={profileButtonRef}>
                  <SafeImage src={user?.avatar} alt={user?.name || 'User'} fallbackType="user" className="w-8 h-8 rounded-full object-cover"/>
                  <span className="hidden sm:block text-white font-medium text-sm pr-2">
                    {user?.firstName || user?.name || 'User'}
                  </span>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileMenuOpen && (<motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                      <div className="p-4 border-b border-white/10">
                        <p className="font-bold text-white">{user?.name || 'User'}</p>
                        <p className="text-sm text-white/60">{user?.email}</p>
                      </div>
                      
                      <div className="p-2">
                        <Link href="/profile">
                          <button onClick={() => { setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white transition-all">
                            <UserCircleIcon className="w-5 h-5"/>
                            <span className="font-medium">Profile</span>
                          </button>
                        </Link>
                        
                        <Link href="/settings">
                          <button onClick={() => { setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white transition-all">
                            <Cog6ToothIcon className="w-5 h-5"/>
                            <span className="font-medium">Settings</span>
                          </button>
                        </Link>
                        
                        <div className="my-2 h-px bg-white/10"/>
                        
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all">
                          <ArrowRightOnRectangleIcon className="w-5 h-5"/>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>)}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              {showNav && (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setMobileMenuOpen(!mobileMenuOpen); }} className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all" ref={mobileMenuButtonRef}>
                  {mobileMenuOpen ? (<XMarkIcon className="w-6 h-6"/>) : (<Bars3Icon className="w-6 h-6"/>)}
                </motion.button>)}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && showNav && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-xl" ref={mobileMenuRef}>
              <nav className="px-4 py-4 space-y-2">
                {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (<Link key={item.name} href={item.href}>
                      <motion.div whileTap={{ scale: 0.98 }} onClick={() => { setMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'}`} tabIndex={0}>
                        <Icon className="w-5 h-5"/>
                        <span className="font-medium">{item.name}</span>
                      </motion.div>
                    </Link>);
            })}
              </nav>
            </motion.div>)}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16"/>
    </>);
}
//# sourceMappingURL=UniversalHeader.jsx.map