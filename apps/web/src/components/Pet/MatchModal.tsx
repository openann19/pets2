import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { XMarkIcon, ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import type { Pet, User } from '../../types';
import { ConfettiPhysics, useHaptics } from '@/components/Animations';
const MatchModal = ({ isOpen, onClose, matchId, currentUserPet, matchedPet, matchedUser, }) => {
    const router = useRouter();
    const haptics = useHaptics();
    const [showConfetti, setShowConfetti] = useState(false);

    // Trigger confetti and haptics when modal opens
    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            haptics.success(); // Haptic feedback
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => { clearTimeout(timer); };
        }
    }, [isOpen, haptics]);

    const handleStartChatting = () => {
        haptics.tap();
        router.push(`/chat/${matchId}`);
        onClose();
    };
    const handleKeepSwiping = () => {
        haptics.tap();
        onClose();
    };
    // Get primary photos
    const currentPetPhoto = currentUserPet.photos.find(p => p.isPrimary)?.url || currentUserPet.photos[0]?.url;
    const matchedPetPhoto = matchedPet.photos.find(p => p.isPrimary)?.url || matchedPet.photos[0]?.url;
    return (<AnimatePresence>
      {isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          {/* Confetti Celebration */}
          {showConfetti && (
            <ConfettiPhysics
              count={200}
              duration={4}
              gravity={0.6}
              wind={0.2}
              shapes={['circle', 'square', 'triangle']}
              colors={['#EC4899', '#8B5CF6', '#3B82F6', '#F59E0B', '#10B981']}
            />
          )}

          {/* Background blur */}
          <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose}/>
          
          {/* Modal Content */}
          <motion.div initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 50 }} transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.5
            }} className="relative w-full max-w-md mx-auto">
            {/* Close button */}
            <button onClick={onClose} className="absolute -top-4 -right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
              <XMarkIcon className="w-5 h-5 text-gray-600"/>
            </button>

            {/* Match celebration card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header with celebration */}
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 px-6 py-8 text-center relative overflow-hidden">
                {/* Floating hearts animation */}
                {[...Array(6)].map((_, i) => (<motion.div key={i} className="absolute text-2xl" initial={{
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 100 + 50,
                }} animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    y: [50, -50],
                }} transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                }}>
                    ❤️
                  </motion.div>))}

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="text-6xl mb-4">
                  🎉
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-bold text-white mb-2">
                  It's a Match!
                </motion.h2>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-pink-100 text-lg">
                  {currentUserPet.name} and {matchedPet.name} liked each other
                </motion.p>
              </div>

              {/* Pet photos section */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  {/* Current user's pet */}
                  <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
                      <img src={currentPetPhoto || 'https://via.placeholder.com/96?text=🐾'} alt={currentUserPet.name} className="w-full h-full object-cover"/>
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">{currentUserPet.name}</p>
                    <p className="text-sm text-gray-600">Your pet</p>
                  </motion.div>

                  {/* Heart icon */}
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring", stiffness: 200 }} className="text-4xl text-red-500">
                    <HeartIcon className="w-8 h-8"/>
                  </motion.div>

                  {/* Matched pet */}
                  <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                      <img src={matchedPetPhoto || 'https://via.placeholder.com/96?text=🐾'} alt={matchedPet.name} className="w-full h-full object-cover"/>
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">{matchedPet.name}</p>
                    <p className="text-sm text-gray-600">
                      {matchedUser.firstName}'s pet
                    </p>
                  </motion.div>
                </div>

                {/* Match details */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Match Intent</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {matchedPet.intent === 'all' ? 'Open to all' : matchedPet.intent}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} onClick={handleStartChatting} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <ChatBubbleLeftRightIcon className="w-6 h-6"/>
                    <span>Start Chatting</span>
                  </motion.button>

                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} onClick={handleKeepSwiping} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    Keep Swiping
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
};
export default MatchModal;
//# sourceMappingURL=MatchModal.jsx.map
//# sourceMappingURL=MatchModal.jsx.map