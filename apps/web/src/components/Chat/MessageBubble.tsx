import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckSolidIcon } from '@heroicons/react/24/solid';
import { Message, User } from '../../types';
const MessageBubble = ({ message, isOwnMessage, currentUser, showAvatar = true, showTimestamp = true, }) => {
    const msg = message;
    // Sender is always a populated User object due to backend consistency fixes
    const sender = msg.sender || {};
    const senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'User';
    const senderAvatar = sender.avatar;
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };
    const isRead = msg.readBy?.some((receipt) => receipt.user !== currentUser._id) || false;
    return (<motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }} className={`flex items-end space-x-2 mb-4 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (<div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
          {senderAvatar ? (<Image src={senderAvatar} alt={senderName} className="w-full h-full object-cover" width={32} height={32}/>) : (<span>{sender.firstName[0]}</span>)}
        </div>)}

      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
        {/* Sender name (for group chats or other user messages) */}
        {!isOwnMessage && showAvatar && (<p className="text-xs text-gray-500 mb-1 ml-3">{senderName}</p>)}

        <div className={`px-4 py-2 rounded-2xl ${isOwnMessage
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
            : 'bg-white text-gray-900 shadow-sm border border-gray-100'} ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'}`}>
          {/* Message content based on type */}
          {msg.messageType === 'text' && (<p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {msg.content}
            </p>)}

          {msg.messageType === 'image' && msg.attachments && (<div className="space-y-2">
              {msg.attachments.map((attachment, index) => (<div key={index} className="rounded-lg overflow-hidden">
                  <Image src={attachment.url} alt={attachment.fileName || 'Image'} width={200} height={200} className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                    // Could open image in modal
                    window.open(attachment.url, '_blank');
                }}/>
                </div>))}
              {message.content && (<p className="text-sm leading-relaxed mt-2">{message.content}</p>)}
            </div>)}

          {msg.messageType === 'location' && (<div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📍</span>
                <span className="text-sm font-medium">Location shared</span>
              </div>
              {message.content && (<p className="text-sm opacity-90">{message.content}</p>)}
            </div>)}

          {msg.messageType === 'system' && (<p className="text-sm italic opacity-75">{message.content}</p>)}

          {/* Edited indicator */}
          {message.isEdited && (<p className={`text-xs mt-1 opacity-60 ${isOwnMessage ? 'text-pink-100' : 'text-gray-500'}`}>
              edited
            </p>)}
        </div>

        {/* Timestamp and read status */}
        {showTimestamp && (<div className={`flex items-center space-x-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">
              {formatTime(msg.sentAt || msg.createdAt)}
            </span>
            
            {/* Read status for own messages */}
            {isOwnMessage && (<div className="flex items-center">
                {isRead ? (<CheckSolidIcon className="w-4 h-4 text-blue-500"/>) : (<CheckIcon className="w-4 h-4 text-gray-400"/>)}
              </div>)}
          </div>)}
      </div>

      {/* Spacer for own messages to maintain alignment */}
      {isOwnMessage && <div className="w-8 flex-shrink-0"/>}
    </motion.div>);
};
export default MessageBubble;
//# sourceMappingURL=MessageBubble.jsx.map
//# sourceMappingURL=MessageBubble.jsx.map