import { Bars3Icon, ChatBubbleLeftRightIcon, HeartIcon, MapPinIcon, PlusIcon, SparklesIcon, UserIcon, XMarkIcon, } from '@heroicons/react/24/outline'
import { logger } from '@pawfectmatch/core';
;
import { ChatBubbleLeftRightIcon as ChatSolid, HeartIcon as HeartSolid, MapPinIcon as MapPinSolid, UserIcon as UserSolid, } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';
import { EnhancedButton, InteractionProvider } from '../UI/AdvancedInteractionSystem';
import LanguageSelect from '@/components/UI/LanguageSelect';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
const Header = () => {
    const { user, logout } = useAuth();
    const typedUser = user;
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuButtonRef = useRef(null);
    const mobileMenuRef = useRef(null);
    // Close mobile menu on outside click and Escape, with focus restore
    useClickOutside(mobileMenuRef, (e) => {
        const target = e.target;
        if (isMobileMenuOpen && menuButtonRef.current && !menuButtonRef.current.contains(target)) {
            setIsMobileMenuOpen(false);
            requestAnimationFrame(() => menuButtonRef.current?.focus());
        }
    }, isMobileMenuOpen);
    useEscapeKey(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
            requestAnimationFrame(() => menuButtonRef.current?.focus());
        }
    }, isMobileMenuOpen);
    // Initial focus to first item when menu opens
    useEffect(() => {
        if (!isMobileMenuOpen)
            return;
        requestAnimationFrame(() => {
            const firstFocusable = mobileMenuRef.current?.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
            firstFocusable?.focus();
        });
    }, [isMobileMenuOpen]);
    const handleLogout = () => {
        logout().then(() => {
            router.push('/');
        }).catch((error) => {
            logger.error('Logout failed:', { error });
        });
    };
    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    const handleMobileMenuClose = () => {
        setIsMobileMenuOpen(false);
    };
    const isActive = (path) => pathname === path;
    const navigationItems = [
        {
            name: 'Discover',
            path: '/swipe',
            icon: HeartIcon,
            iconSolid: HeartSolid,
        },
        {
            name: 'Map',
            path: '/map',
            icon: MapPinIcon,
            iconSolid: MapPinSolid,
        },
        {
            name: 'Matches',
            path: '/matches',
            icon: ChatBubbleLeftRightIcon,
            iconSolid: ChatSolid,
        },
        {
            name: 'Profile',
            path: '/profile',
            icon: UserIcon,
            iconSolid: UserSolid,
        },
    ];
    return (<InteractionProvider>
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-1 sm:space-x-2">
            <div className="text-2xl">🐾</div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              PawfectMatch
            </span>
            {typedUser?.premium?.isActive === true && (<SparklesIcon className="w-5 h-5 text-yellow-500"/>)}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            {navigationItems.map((item) => {
            const Icon = isActive(item.path) ? item.iconSolid : item.icon;
            return (<Link key={item.path} href={item.path} className="block">
                  <EnhancedButton id={`nav-${item.path}`} variant="ghost" size="sm" effects={{
                    hover: true,
                    magnetic: true,
                    glow: isActive(item.path),
                    ripple: true,
                    sound: true,
                    haptic: true,
                }} className={`
                      flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300
                      ${isActive(item.path)
                    ? 'text-pink-600 bg-pink-50 shadow-md'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50 hover:shadow-lg'}
                    `} tooltip={`Navigate to ${item.name}`} aria-label={`Navigate to ${item.name}`}>
                    <Icon className="w-5 h-5"/>
                    <span>{item.name}</span>
                  </EnhancedButton>
                </Link>);
        })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {/* Language Toggle */}
            <LanguageSelect />
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Add Pet Button */}
            <Link href="./pets/new">
              <EnhancedButton id="add-pet-button" variant="primary" size="md" icon={<PlusIcon className="w-5 h-5"/>} effects={{
            hover: true,
            magnetic: true,
            glow: true,
            ripple: true,
            sound: true,
            haptic: true,
            shimmer: true,
        }} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl border-none" tooltip="Add a new pet to your profile" aria-label="Add a new pet to your profile" apiOperation="add-pet">
                Add Pet
              </EnhancedButton>
            </Link>

            {/* Premium Button */}
            {typedUser?.premium?.isActive !== true && (<Link href="./premium">
                <EnhancedButton id="premium-button" variant="holographic" size="md" icon={<SparklesIcon className="w-5 h-5"/>} effects={{
                hover: true,
                magnetic: true,
                glow: true,
                ripple: true,
                sound: true,
                haptic: true,
                shimmer: true,
                particles: true,
            }} className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 font-bold shadow-xl border-none" tooltip="Upgrade to Premium for exclusive features" aria-label="Upgrade to Premium for exclusive features" apiOperation="premium-upgrade">
                  Premium
                </EnhancedButton>
              </Link>)}

            {/* User Menu */}
            <div className="relative">
              <EnhancedButton id="user-menu-button" variant="ghost" size="sm" onClick={handleLogout} effects={{
            hover: true,
            magnetic: true,
            glow: false,
            ripple: true,
            sound: true,
            haptic: true,
        }} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2" icon={typedUser?.avatar ? (<img className="w-6 h-6 rounded-full object-cover" src={typedUser.avatar} alt="User avatar"/>) : (<div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {typedUser?.firstName?.[0]}{typedUser?.lastName?.[0]}
                    </div>)} tooltip={`Logged in as ${typedUser?.firstName || 'User'}`} aria-label={`User menu for ${typedUser?.firstName || 'User'}`} apiOperation="user-logout">
                <span className="hidden lg:inline">{typedUser?.firstName || 'User'}</span>
              </EnhancedButton>
            </div>
          </div>

          {/* Mobile menu button */}
          <EnhancedButton id="mobile-menu-button" variant="ghost" size="sm" onClick={handleMobileMenuToggle} effects={{
            hover: true,
            magnetic: true,
            glow: false,
            ripple: true,
            sound: true,
            haptic: true,
        }} className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100" tooltip={isMobileMenuOpen ? "Close menu" : "Open menu"} aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMobileMenuOpen} aria-haspopup="menu">
            {isMobileMenuOpen ? (<XMarkIcon className="w-6 h-6"/>) : (<Bars3Icon className="w-6 h-6"/>)}
          </EnhancedButton>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (<div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200" ref={mobileMenuRef}>
              {navigationItems.map((item) => {
                const Icon = isActive(item.path) ? item.iconSolid : item.icon;
                return (<Link key={item.path} href={item.path} onClick={() => { setIsMobileMenuOpen(false); }} className="block">
                    <EnhancedButton id={`mobile-nav-${item.path}`} variant="ghost" size="md" effects={{
                        hover: true,
                        magnetic: true,
                        glow: isActive(item.path),
                        ripple: true,
                        sound: true,
                        haptic: true,
                    }} className={`
                        w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-300
                        ${isActive(item.path)
                        ? 'text-pink-600 bg-pink-50 shadow-md'
                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50 hover:shadow-lg'}
                      `} tooltip={`Navigate to ${item.name}`} aria-label={`Navigate to ${item.name}`}>
                      <Icon className="w-5 h-5"/>
                      <span>{item.name}</span>
                    </EnhancedButton>
                  </Link>);
            })}
              
              {/* Mobile Actions */}
              <div className="pt-4 space-y-2">
                {/* Mobile Language Toggle */}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-gray-600 text-base font-medium">Language</span>
                  <LanguageSelect compact/>
                </div>
                
                <Link href="/pets/new" onClick={handleMobileMenuClose}>
                  <EnhancedButton id="mobile-add-pet-button" variant="primary" size="md" icon={<PlusIcon className="w-5 h-5"/>} effects={{
                hover: true,
                magnetic: true,
                glow: true,
                ripple: true,
                sound: true,
                haptic: true,
                shimmer: true,
            }} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl border-none" tooltip="Add a new pet to your profile" aria-label="Add a new pet to your profile" apiOperation="add-pet">
                    Add Pet
                  </EnhancedButton>
                </Link>
                
                {typedUser?.premium?.isActive !== true && (<Link href="/premium" onClick={handleMobileMenuClose}>
                    <EnhancedButton id="mobile-premium-button" variant="holographic" size="md" icon={<SparklesIcon className="w-5 h-5"/>} effects={{
                    hover: true,
                    magnetic: true,
                    glow: true,
                    ripple: true,
                    sound: true,
                    haptic: true,
                    shimmer: true,
                    particles: true,
                }} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 font-bold shadow-xl border-none" tooltip="Upgrade to Premium for exclusive features" aria-label="Upgrade to Premium for exclusive features" apiOperation="premium-upgrade">
                      Upgrade to Premium
                    </EnhancedButton>
                  </Link>)}
                
                <EnhancedButton id="mobile-logout-button" variant="outline" size="md" onClick={handleLogout} effects={{
                hover: true,
                magnetic: true,
                glow: false,
                ripple: true,
                sound: true,
                haptic: true,
            }} className="w-full bg-white/20 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 font-semibold" tooltip="Sign out of your account" aria-label="Sign out of your account" apiOperation="user-logout">
                  Logout
                </EnhancedButton>
              </div>
            </div>
          </div>)}
        </div>
      </header>
    </InteractionProvider>);
};
export default Header;
//# sourceMappingURL=Header.jsx.map
//# sourceMappingURL=Header.jsx.map