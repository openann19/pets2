import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Message, User } from '../../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
const MessageList = ({ messages, currentUser, isLoading, hasMoreMessages, typingUsers, onLoadMore, onScroll, }) => {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    // Handle scroll to load more messages
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container && container.scrollTop === 0 && hasMoreMessages && !isLoading) {
            onLoadMore();
        }
        onScroll?.();
    };
    return (<div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
      {/* Load more indicator */}
      {hasMoreMessages && (<div className="text-center py-4">
          <button onClick={onLoadMore} disabled={isLoading} className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50">
            {isLoading ? 'Loading...' : 'Load more messages'}
          </button>
        </div>)}

      {/* Messages */}
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
            const msg = message;
            const isOwnMessage = typeof msg.sender === 'object'
                ? msg.sender._id === currentUser?._id
                : msg.sender === currentUser?._id;
            const showAvatar = index === 0 ||
                (typeof messages[index - 1]?.sender === 'object' && typeof msg.sender === 'object'
                    ? messages[index - 1].sender._id !== msg.sender._id
                    : (typeof messages[index - 1]?.sender === 'string' && typeof msg.sender === 'string')
                        ? messages[index - 1].sender !== msg.sender
                        : true);
            return (<MessageBubble key={msg._id || msg.id || index} message={message} isOwnMessage={isOwnMessage} currentUser={currentUser} showAvatar={showAvatar}/>);
        })}
      </AnimatePresence>

      {/* Typing indicator */}
      <TypingIndicator isVisible={typingUsers.length > 0} userNames={typingUsers}/>

      {/* Scroll anchor */}
      <div ref={messagesEndRef}/>
    </div>);
};
export default MessageList;
//# sourceMappingURL=MessageList.jsx.map
//# sourceMappingURL=MessageList.jsx.map