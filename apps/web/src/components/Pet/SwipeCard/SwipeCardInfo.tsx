/**
 * 📋 SWIPE CARD INFO COMPONENT
 * Pet information display with optimized rendering
 */
import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
export const SwipeCardInfo = ({ pet, onCardClick }) => {
    return (<motion.div className="p-6 bg-white rounded-b-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
      {/* Pet Name and Age */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-bold text-gray-900">{pet.name}</h3>
        <div className="flex items-center text-gray-600">
          <CalendarIcon className="w-4 h-4 mr-1"/>
          <span className="text-sm">{pet.age} years old</span>
        </div>
      </div>

      {/* Breed */}
      <p className="text-lg text-gray-700 mb-3">{pet.breed}</p>

      {/* Description */}
      {pet.description && (<p className="text-gray-600 text-sm mb-4 line-clamp-3">{pet.description}</p>)}

      {/* Location */}
      {pet.location?.address && (<div className="flex items-center text-gray-600 mb-4">
          <MapPinIcon className="w-4 h-4 mr-1"/>
          <span className="text-sm">
            {pet.location.address.city}, {pet.location.address.state}
          </span>
        </div>)}

      {/* Health Info */}
      {/* Removed tags and healthInfo as they are not in the core Pet type */}

      {/* Click to view more */}
      <motion.button onClick={onCardClick} className="w-full py-2 text-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        View Full Profile
      </motion.button>
    </motion.div>);
};
//# sourceMappingURL=SwipeCardInfo.jsx.map
//# sourceMappingURL=SwipeCardInfo.jsx.map