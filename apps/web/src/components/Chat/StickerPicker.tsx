'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
export const StickerPicker = ({ isOpen, onClose, onSelectSticker }) => {
    const [selectedPack, setSelectedPack] = useState('pets');
    const stickerPacks = [
        {
            id: 'pets',
            name: 'Pets',
            emoji: '🐾',
            stickers: [
                { id: '1', url: '😺', name: 'Cat Face' },
                { id: '2', url: '🐱', name: 'Cat' },
                { id: '3', url: '🐶', name: 'Dog Face' },
                { id: '4', url: '🐕', name: 'Dog' },
                { id: '5', url: '🐩', name: 'Poodle' },
                { id: '6', url: '🐕‍🦺', name: 'Service Dog' },
                { id: '7', url: '🐈', name: 'Cat' },
                { id: '8', url: '🐈‍⬛', name: 'Black Cat' },
                { id: '9', url: '🐰', name: 'Rabbit' },
                { id: '10', url: '🐹', name: 'Hamster' },
                { id: '11', url: '🐭', name: 'Mouse' },
                { id: '12', url: '🐦', name: 'Bird' },
                { id: '13', url: '🐤', name: 'Baby Chick' },
                { id: '14', url: '🐥', name: 'Front-Facing Baby Chick' },
                { id: '15', url: '🐣', name: 'Hatching Chick' },
                { id: '16', url: '🐧', name: 'Penguin' },
            ],
        },
        {
            id: 'hearts',
            name: 'Hearts',
            emoji: '❤️',
            stickers: [
                { id: '1', url: '❤️', name: 'Red Heart' },
                { id: '2', url: '🧡', name: 'Orange Heart' },
                { id: '3', url: '💛', name: 'Yellow Heart' },
                { id: '4', url: '💚', name: 'Green Heart' },
                { id: '5', url: '💙', name: 'Blue Heart' },
                { id: '6', url: '💜', name: 'Purple Heart' },
                { id: '7', url: '🖤', name: 'Black Heart' },
                { id: '8', url: '🤍', name: 'White Heart' },
                { id: '9', url: '🤎', name: 'Brown Heart' },
                { id: '10', url: '💕', name: 'Two Hearts' },
                { id: '11', url: '💞', name: 'Revolving Hearts' },
                { id: '12', url: '💓', name: 'Beating Heart' },
                { id: '13', url: '💗', name: 'Growing Heart' },
                { id: '14', url: '💖', name: 'Sparkling Heart' },
                { id: '15', url: '💘', name: 'Heart with Arrow' },
                { id: '16', url: '💝', name: 'Heart with Ribbon' },
            ],
        },
        {
            id: 'emotions',
            name: 'Emotions',
            emoji: '😊',
            stickers: [
                { id: '1', url: '😊', name: 'Smiling Face' },
                { id: '2', url: '😃', name: 'Grinning Face' },
                { id: '3', url: '😄', name: 'Grinning Face with Smiling Eyes' },
                { id: '4', url: '😁', name: 'Beaming Face with Smiling Eyes' },
                { id: '5', url: '😆', name: 'Grinning Squinting Face' },
                { id: '6', url: '😅', name: 'Grinning Face with Sweat' },
                { id: '7', url: '😂', name: 'Face with Tears of Joy' },
                { id: '8', url: '🤣', name: 'Rolling on the Floor Laughing' },
                { id: '9', url: '😌', name: 'Relieved Face' },
                { id: '10', url: '😍', name: 'Smiling Face with Heart-Eyes' },
                { id: '11', url: '🥰', name: 'Smiling Face with Hearts' },
                { id: '12', url: '😘', name: 'Face Blowing a Kiss' },
                { id: '13', url: '😗', name: 'Kissing Face' },
                { id: '14', url: '😙', name: 'Kissing Face with Smiling Eyes' },
                { id: '15', url: '😚', name: 'Kissing Face with Closed Eyes' },
                { id: '16', url: '😋', name: 'Face Savoring Food' },
            ],
        },
        {
            id: 'playful',
            name: 'Playful',
            emoji: '🎉',
            stickers: [
                { id: '1', url: '🎉', name: 'Party Popper' },
                { id: '2', url: '🎊', name: 'Confetti Ball' },
                { id: '3', url: '🎈', name: 'Balloon' },
                { id: '4', url: '🎁', name: 'Wrapped Gift' },
                { id: '5', url: '🎀', name: 'Ribbon' },
                { id: '6', url: '🎂', name: 'Birthday Cake' },
                { id: '7', url: '🍰', name: 'Shortcake' },
                { id: '8', url: '🧁', name: 'Cupcake' },
                { id: '9', url: '🍭', name: 'Lollipop' },
                { id: '10', url: '🍬', name: 'Candy' },
                { id: '11', url: '🍫', name: 'Chocolate Bar' },
                { id: '12', url: '🍪', name: 'Cookie' },
                { id: '13', url: '🎮', name: 'Video Game' },
                { id: '14', url: '🕹️', name: 'Joystick' },
                { id: '15', url: '🎯', name: 'Direct Hit' },
                { id: '16', url: '🎲', name: 'Game Die' },
            ],
        },
    ];
    const handleStickerSelect = (sticker) => {
        onSelectSticker(sticker.url);
        onClose();
    };
    const currentPack = stickerPacks.find((pack) => pack.id === selectedPack);
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => { e.stopPropagation(); }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose a Sticker
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <XMarkIcon className="h-5 w-5 text-gray-500"/>
            </button>
          </div>

          {/* Pack Selection */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              {stickerPacks.map((pack) => (<button key={pack.id} onClick={() => { setSelectedPack(pack.id); }} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPack === pack.id
                ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  <span className="mr-1">{pack.emoji}</span>
                  {pack.name}
                </button>))}
            </div>
          </div>

          {/* Sticker Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentPack && (<div className="grid grid-cols-4 gap-3">
                {currentPack.stickers.map((sticker) => (<motion.button key={sticker.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 text-2xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => { handleStickerSelect(sticker); }} title={sticker.name}>
                    {sticker.url}
                  </motion.button>))}
              </div>)}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Tap a sticker to send it
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);
};
//# sourceMappingURL=StickerPicker.jsx.map