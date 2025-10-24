'use client';
import React, { useState } from 'react';
import { FaceSmileIcon } from '@heroicons/react/24/outline';
const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];
export const MessageReactions = ({ messageId, reactions, onReact, currentUserId, }) => {
    const [showPicker, setShowPicker] = useState(false);
    const handleReact = (emoji) => {
        onReact(messageId, emoji);
        setShowPicker(false);
    };
    return (<div className="relative inline-block">
      {/* Existing Reactions */}
      {reactions.length > 0 && (<div className="flex flex-wrap gap-1 mb-1">
          {reactions.map((reaction) => (<button key={reaction.emoji} onClick={() => handleReact(reaction.emoji)} className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all ${reaction.hasReacted
                    ? 'bg-pink-100 dark:bg-pink-900/30 border-2 border-pink-500'
                    : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <span>{reaction.emoji}</span>
              <span className="font-medium">{reaction.count}</span>
            </button>))}
        </div>)}

      {/* Add Reaction Button */}
      <button onClick={() => setShowPicker(!showPicker)} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Add reaction">
        <FaceSmileIcon className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
      </button>

      {/* Reaction Picker */}
      {showPicker && (<>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)}/>
          <div className="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2">
            <div className="flex space-x-1">
              {QUICK_REACTIONS.map((emoji) => (<button key={emoji} onClick={() => handleReact(emoji)} className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  {emoji}
                </button>))}
            </div>
          </div>
        </>)}
    </div>);
};
export default MessageReactions;
//# sourceMappingURL=MessageReactions.jsx.map