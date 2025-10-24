import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_CONFIG } from '../../constants/animations';
import { Message, User } from '../../types';
import MessageBubble from './MessageBubble';
/**
 * A simplified message list component that uses MessageBubble components
 * This is a temporary replacement for a proper virtualized list (react-window)
 */
const VirtualizedMessageList = ({ messages, currentUserId, height, className = '', }) => {
    // Early return for empty state
    if (!messages.length) {
        return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING_CONFIG} className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <p>No messages yet. Start the conversation!</p>
      </motion.div>);
    }
    // Using a simple scrollable div for now until react-window is properly integrated
    return (<div className={`${className} overflow-y-auto px-4`} style={{ height }}>
      {messages.map((message, index) => (<motion.div key={message._id || message.id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_CONFIG, delay: index * 0.05 }} className="mb-4">
          <MessageBubble message={message} isOwnMessage={message.sender?._id === currentUserId} currentUser={{ id: currentUserId, name: '' }}/>
        </motion.div>))}
    </div>);
};
export default VirtualizedMessageList;
//# sourceMappingURL=VirtualizedMessageList.jsx.map
//# sourceMappingURL=VirtualizedMessageList.jsx.map