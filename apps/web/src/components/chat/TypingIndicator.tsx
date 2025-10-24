/**
 * Typing Indicator Component
 * Shows "Ben is typing..." with smooth animations
 */
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { UserCircleIcon } from '@heroicons/react/24/outline';
export function TypingIndicator({ chatId, className = '', showAvatars = true, maxUsers = 3 }) {
    const { typingUsers, typingText } = useTypingIndicator({ chatId });
    if (!typingText || typingUsers.length === 0) {
        return null;
    }
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.2 }} className={`flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        {/* Avatars */}
        {showAvatars && (<div className="flex -space-x-2">
            {typingUsers.slice(0, maxUsers).map((user, index) => (<motion.div key={user.userId} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: index * 0.1 }} className="relative">
                {user.avatar ? (<img src={user.avatar} alt={user.userName} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover"/>) : (<UserCircleIcon className="w-6 h-6 text-gray-400"/>)}
              </motion.div>))}
            {typingUsers.length > maxUsers && (<div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  +{typingUsers.length - maxUsers}
                </span>
              </div>)}
          </div>)}

        {/* Typing Text */}
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {typingText}
          </span>
          
          {/* Animated Dots */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (<motion.div key={i} className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
            }} transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
            }}/>))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>);
}
export function OnlineStatus({ userId, className = '', size = 'md' }) {
    const { isUserOnline } = useOnlineStatus([userId]);
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };
    return (<div className={`relative ${className}`}>
      <motion.div className={`${sizeClasses[size]} rounded-full ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'}`} animate={{
            scale: isUserOnline ? [1, 1.2, 1] : 1,
            opacity: isUserOnline ? [0.7, 1, 0.7] : 0.5
        }} transition={{
            duration: 2,
            repeat: isUserOnline ? Infinity : 0
        }}/>
      {isUserOnline && (<motion.div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500`} animate={{
                scale: [1, 2],
                opacity: [0.3, 0]
            }} transition={{
                duration: 2,
                repeat: Infinity
            }}/>)}
    </div>);
}
export function ChatInputWithTyping({ chatId, onSendMessage, placeholder = "Type a message...", className = "" }) {
    const { handleInputChange, handleInputFocus, handleInputBlur } = useTypingIndicator({ chatId });
    const [message, setMessage] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };
    const handleChange = (e) => {
        const value = e.target.value;
        setMessage(value);
        handleInputChange(value);
    };
    return (<div className={`space-y-2 ${className}`}>
      {/* Typing Indicator */}
      <TypingIndicator chatId={chatId}/>
      
      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input type="text" value={message} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder={placeholder} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"/>
        <button type="submit" disabled={!message.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors">
          Send
        </button>
      </form>
    </div>);
}
//# sourceMappingURL=TypingIndicator.jsx.map