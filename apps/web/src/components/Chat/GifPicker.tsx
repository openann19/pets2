'use client';
import React, { useState, useEffect } from 'react';
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
export const GifPicker = ({ isOpen, onClose, onSelectGif }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [gifs, setGifs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('trending');
    const categories = [
        { id: 'trending', label: 'Trending', emoji: '🔥' },
        { id: 'cats', label: 'Cats', emoji: '🐱' },
        { id: 'dogs', label: 'Dogs', emoji: '🐶' },
        { id: 'funny', label: 'Funny', emoji: '😂' },
        { id: 'love', label: 'Love', emoji: '❤️' },
        { id: 'happy', label: 'Happy', emoji: '😊' },
        { id: 'sad', label: 'Sad', emoji: '😢' },
        { id: 'excited', label: 'Excited', emoji: '🤩' },
    ];
    const fetchGifs = async (query = '', category = 'trending') => {
        setIsLoading(true);
        try {
            // Using Giphy API (you'll need to add your API key)
            const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'demo';
            let url = '';
            if (query) {
                url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`;
            }
            else {
                url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.data) {
                const gifData = data.data.map((gif) => ({
                    id: gif.id,
                    url: gif.images.original.url,
                    preview: gif.images.preview_gif.url,
                    title: gif.title || 'GIF',
                }));
                setGifs(gifData);
            }
        }
        catch (error) {
            logger.error('Error fetching GIFs:', { error });
            // Fallback to demo GIFs
            setGifs([
                {
                    id: '1',
                    url: 'https://media.giphy.com/media/3o7TKSjRrfIPnMvzBK/giphy.gif',
                    preview: 'https://media.giphy.com/media/3o7TKSjRrfIPnMvzBK/giphy.gif',
                    title: 'Happy Dog',
                },
                {
                    id: '2',
                    url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
                    preview: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
                    title: 'Cute Cat',
                },
                {
                    id: '3',
                    url: 'https://media.giphy.com/media/26BRrSvJUa5Uid55u/giphy.gif',
                    preview: 'https://media.giphy.com/media/26BRrSvJUa5Uid55u/giphy.gif',
                    title: 'Love',
                },
            ]);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (isOpen) {
            fetchGifs(searchQuery, selectedCategory);
        }
    }, [isOpen, searchQuery, selectedCategory]);
    const handleGifSelect = (gif) => {
        onSelectGif(gif.url);
        onClose();
    };
    const handleSearch = (e) => {
        e.preventDefault();
        fetchGifs(searchQuery);
    };
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose a GIF</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <XMarkIcon className="h-5 w-5 text-gray-500"/>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for GIFs..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"/>
              </div>
              <button type="submit" className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors">
                Search
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map((category) => (<button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id
                ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  <span className="mr-1">{category.emoji}</span>
                  {category.label}
                </button>))}
            </div>
          </div>

          {/* GIF Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (<div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>) : (<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gifs.map((gif) => (<motion.div key={gif.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700" onClick={() => handleGifSelect(gif)}>
                    <img src={gif.preview} alt={gif.title} className="w-full h-32 object-cover" loading="lazy"/>
                    <div className="p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {gif.title}
                      </p>
                    </div>
                  </motion.div>))}
              </div>)}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              GIFs provided by Giphy
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);
};
//# sourceMappingURL=GifPicker.jsx.map