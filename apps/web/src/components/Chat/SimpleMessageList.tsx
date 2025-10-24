import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_CONFIG } from '../../constants/animations';
import { Message, User } from '../../types';
import MessageBubble from './MessageBubble';
/**
 * Simplified Message List Component that directly renders MessageBubbles.
 * This replaces VirtualizedMessageList until proper integration with react-window is completed
 */
const SimpleMessageList = ({ messages, currentUserId, height, className = '', }) => {
    // Early return for empty state
    if (!messages.length) {
        return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING_CONFIG} className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <p>No messages yet. Start the conversation!</p>
      </motion.div>);
    }
    return (<div className={`${className} overflow-y-auto px-4`} style={{ height }}>
      {messages.map((message, index) => (<motion.div key={message._id || message.id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_CONFIG, delay: index * 0.05 }} className="mb-4">
          <MessageBubble message={message} isOwnMessage={message.sender?._id === currentUserId} currentUser={({
                id: currentUserId,
                name: '',
                _id: currentUserId,
                email: '',
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                age: 0,
                location: { latitude: 0, longitude: 0, city: '', state: '', country: '' },
                preferences: {
                    maxDistance: 0,
                    ageRange: { min: 0, max: 0 },
                    species: [],
                    intents: [],
                    notifications: { email: false, push: false, matches: false, messages: false }
                },
                premium: {
                    isActive: false,
                    plan: 'basic',
                    features: { unlimitedLikes: false, boostProfile: false, seeWhoLiked: false, advancedFilters: false }
                },
                pets: [],
                analytics: {
                    totalSwipes: 0, totalLikes: 0, totalMatches: 0, profileViews: 0, lastActive: ''
                },
                isEmailVerified: false,
                isActive: true,
                createdAt: '',
                updatedAt: ''
            })}/>
        </motion.div>))}
    </div>);
};
export default SimpleMessageList;
//# sourceMappingURL=SimpleMessageList.jsx.map
//# sourceMappingURL=SimpleMessageList.jsx.map