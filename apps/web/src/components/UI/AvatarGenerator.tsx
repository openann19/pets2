'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
// Predefined gradients for different moods/personalities
const gradients = {
    primary: 'from-pink-500 to-purple-600',
    secondary: 'from-blue-500 to-cyan-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600',
    danger: 'from-red-500 to-pink-600',
    info: 'from-indigo-500 to-blue-600',
};
// Size configurations
const sizes = {
    sm: {
        container: 'w-8 h-8 text-xs',
        text: 'text-xs',
    },
    md: {
        container: 'w-12 h-12 text-sm',
        text: 'text-sm',
    },
    lg: {
        container: 'w-16 h-16 text-lg',
        text: 'text-lg',
    },
    xl: {
        container: 'w-24 h-24 text-2xl',
        text: 'text-2xl',
    },
};
// Pet-themed emojis for different species
const petEmojis = {
    dog: ['🐕', '🐶', '🦮', '🐕‍🦺'],
    cat: ['🐱', '🐈', '🐈‍⬛', '😸'],
    bird: ['🐦', '🦅', '🦜', '🐤'],
    rabbit: ['🐰', '🐇', '🐾'],
    fish: ['🐠', '🐟', '🐡'],
    hamster: ['🐹', '🐭'],
    turtle: ['🐢', '🐊'],
    default: ['🐾', '💕', '✨', '🌟'],
};
export function AvatarGenerator({ name, size = 'md', className = '', showInitials = true, gradient, }) {
    // Generate initials from name
    const initials = useMemo(() => {
        if (!name)
            return '?';
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return words[0][0].toUpperCase();
    }, [name]);
    // Generate a consistent gradient based on name hash
    const selectedGradient = useMemo(() => {
        if (gradient)
            return gradients[gradient];
        // Create a hash from the name to get consistent colors
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const gradientKeys = Object.keys(gradients);
        const gradientIndex = Math.abs(hash) % gradientKeys.length;
        return gradients[gradientKeys[gradientIndex]];
    }, [name, gradient]);
    // Generate a pet emoji based on name
    const petEmoji = useMemo(() => {
        const nameLower = name.toLowerCase();
        // Detect pet type from name
        if (nameLower.includes('dog') || nameLower.includes('puppy') || nameLower.includes('canine')) {
            return petEmojis.dog[Math.abs(name.length) % petEmojis.dog.length];
        }
        if (nameLower.includes('cat') || nameLower.includes('kitten') || nameLower.includes('feline')) {
            return petEmojis.cat[Math.abs(name.length) % petEmojis.cat.length];
        }
        if (nameLower.includes('bird') || nameLower.includes('parrot') || nameLower.includes('avian')) {
            return petEmojis.bird[Math.abs(name.length) % petEmojis.bird.length];
        }
        if (nameLower.includes('rabbit') || nameLower.includes('bunny')) {
            return petEmojis.rabbit[Math.abs(name.length) % petEmojis.rabbit.length];
        }
        if (nameLower.includes('fish') || nameLower.includes('aquatic')) {
            return petEmojis.fish[Math.abs(name.length) % petEmojis.fish.length];
        }
        if (nameLower.includes('hamster') || nameLower.includes('mouse')) {
            return petEmojis.hamster[Math.abs(name.length) % petEmojis.hamster.length];
        }
        if (nameLower.includes('turtle') || nameLower.includes('tortoise')) {
            return petEmojis.turtle[Math.abs(name.length) % petEmojis.turtle.length];
        }
        // Default to a random emoji from default set
        return petEmojis.default[Math.abs(name.length) % petEmojis.default.length];
    }, [name]);
    const sizeConfig = sizes[size];
    return (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className={`
        ${sizeConfig.container}
        ${className}
        rounded-full
        bg-gradient-to-br
        ${selectedGradient}
        flex
        items-center
        justify-center
        text-white
        font-bold
        shadow-lg
        relative
        overflow-hidden
        select-none
      `}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"/>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-white/10 rounded-full -mr-4 -mb-4"/>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {showInitials ? (<span className={`${sizeConfig.text} font-bold drop-shadow-sm`}>
            {initials}
          </span>) : (<span className={`${sizeConfig.text} drop-shadow-sm`}>
            {petEmoji}
          </span>)}
      </div>

      {/* Hover effect */}
      <motion.div className="absolute inset-0 bg-white/20 rounded-full opacity-0" whileHover={{ opacity: 1 }} transition={{ duration: 0.2 }}/>
    </motion.div>);
}
export function PetAvatar({ petName, species = 'other', personality = 'friendly', size = 'md', className = '', ...props }) {
    // Select gradient based on personality
    const personalityGradients = {
        friendly: 'primary',
        energetic: 'warning',
        calm: 'info',
        playful: 'success',
        shy: 'secondary',
        confident: 'danger',
    };
    const gradient = personalityGradients[personality];
    return (<AvatarGenerator name={petName} size={size} className={className} gradient={gradient} {...props}/>);
}
export function UserAvatar({ user, size = 'md', className = '', fallbackToInitials = true, ...props }) {
    const displayName = user.name || user.email || 'Anonymous';
    // If user has an avatar, show it
    if (user.avatar && !fallbackToInitials) {
        return (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className={`
          ${sizes[size].container}
          ${className}
          rounded-full
          overflow-hidden
          shadow-lg
          relative
        `}>
        <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" onError={(e) => {
                // Fallback to generated avatar on error
                const target = e.target;
                target.style.display = 'none';
                target.parentElement?.appendChild(document.createElement('div')).innerHTML = `
              <div class="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                ${displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            `;
            }}/>
      </motion.div>);
    }
    // Generate avatar
    return (<AvatarGenerator name={displayName} size={size} className={className} showInitials={fallbackToInitials} {...props}/>);
}
export function AvatarGroup({ items, maxVisible = 4, size = 'md', className = '', }) {
    const visibleItems = items.slice(0, maxVisible);
    const remainingCount = Math.max(0, items.length - maxVisible);
    return (<div className={`flex -space-x-2 ${className}`}>
      {visibleItems.map((item, index) => (<motion.div key={item.id} initial={{ scale: 0, x: -20 }} animate={{ scale: 1, x: 0 }} transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: index * 0.1,
            }} className="relative z-10">
          <UserAvatar user={item} size={size} className="border-2 border-white dark:border-neutral-800"/>
        </motion.div>))}
      
      {remainingCount > 0 && (<motion.div initial={{ scale: 0, x: -20 }} animate={{ scale: 1, x: 0 }} transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: visibleItems.length * 0.1,
            }} className="relative z-10">
          <div className={`
              ${sizes[size].container}
              border-2 border-white dark:border-neutral-800
              rounded-full
              bg-gradient-to-br from-neutral-500 to-neutral-600
              flex items-center justify-center
              text-white font-bold
              shadow-lg
            `}>
            <span className={sizes[size].text}>
              +{remainingCount}
            </span>
          </div>
        </motion.div>)}
    </div>);
}
//# sourceMappingURL=AvatarGenerator.jsx.map