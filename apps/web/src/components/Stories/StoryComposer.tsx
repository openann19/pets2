/**
 * ✏️ STORY COMPOSER COMPONENT
 * Instagram-style story creation with image crop, stickers, and captions
 */
'use client';
import React, { useState, useRef, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CameraIcon, PhotoIcon, FaceSmileIcon, PencilIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
const STICKERS = [
    '❤️', '😂', '😍', '😮', '😢', '😡', '🤔', '😎', '🥳', '🤩',
    '🔥', '💯', '✨', '🌟', '💫', '🎉', '🎊', '🎈', '🎁', '🏆'
];
const FILTERS = [
    { id: 'none', name: 'Original', intensity: 0 },
    { id: 'vintage', name: 'Vintage', intensity: 0.5 },
    { id: 'dramatic', name: 'Dramatic', intensity: 0.7 },
    { id: 'warm', name: 'Warm', intensity: 0.6 },
    { id: 'cool', name: 'Cool', intensity: 0.6 },
    { id: 'bright', name: 'Bright', intensity: 0.8 },
];
export default function StoryComposer({ isOpen, onClose, onPublish, petId, petName, className = '' }) {
    const [step, setStep] = useState('select');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaType, setMediaType] = useState('photo');
    const [caption, setCaption] = useState('');
    const [stickers, setStickers] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
    const [showStickers, setShowStickers] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showCaption, setShowCaption] = useState(false);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const handleMediaSelect = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const url = URL.createObjectURL(file);
        setSelectedMedia(url);
        setMediaType(file.type.startsWith('video/') ? 'video' : 'photo');
        setStep('edit');
    }, []);
    const handleCameraCapture = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            // Create video element for camera preview
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            // For now, we'll use a placeholder - in a real app, you'd capture the frame
            setSelectedMedia('/api/placeholder-camera-capture');
            setMediaType('photo');
            setStep('edit');
            // Stop the stream
            stream.getTracks().forEach(track => { track.stop(); });
        }
        catch (error) {
            logger.error('Camera access failed:', { error });
        }
    }, []);
    const addSticker = useCallback((stickerContent) => {
        const newSticker = {
            id: `sticker_${Date.now()}`,
            type: 'emoji',
            content: stickerContent,
            position: { x: 50, y: 50 }, // Center position
            rotation: 0,
            scale: 1
        };
        setStickers(prev => [...prev, newSticker]);
        setSelectedSticker(newSticker.id);
        setShowStickers(false);
    }, []);
    const updateSticker = useCallback((stickerId, updates) => {
        setStickers(prev => prev.map(sticker => sticker.id === stickerId
            ? { ...sticker, ...updates }
            : sticker));
    }, []);
    const removeSticker = useCallback((stickerId) => {
        setStickers(prev => prev.filter(sticker => sticker.id !== stickerId));
        setSelectedSticker(null);
    }, []);
    const handlePublish = useCallback(() => {
        if (!selectedMedia)
            return;
        const storyData = {
            type: mediaType,
            url: selectedMedia,
            caption,
            stickers,
            filters: [selectedFilter],
            duration: mediaType === 'video' ? 15 : undefined
        };
        onPublish(storyData);
        onClose();
        resetComposer();
    }, [selectedMedia, mediaType, caption, stickers, selectedFilter, onPublish, onClose]);
    const resetComposer = useCallback(() => {
        setStep('select');
        setSelectedMedia(null);
        setCaption('');
        setStickers([]);
        setSelectedFilter(FILTERS[0]);
        setShowStickers(false);
        setShowFilters(false);
        setShowCaption(false);
        setSelectedSticker(null);
    }, []);
    const handleClose = useCallback(() => {
        onClose();
        resetComposer();
    }, [onClose, resetComposer]);
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-50 bg-black ${className}`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            <button onClick={handleClose} className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
              <XMarkIcon className="w-6 h-6"/>
            </button>
            
            <h2 className="text-white font-semibold text-lg">
              {step === 'select' ? 'Create Story' :
            step === 'edit' ? 'Edit Story' : 'Publish Story'}
            </h2>
            
            {step === 'edit' && (<button onClick={handlePublish} className="px-4 py-2 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors">
                Publish
              </button>)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 pt-20">
          {step === 'select' && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h3 className="text-white text-2xl font-bold mb-8">
                Create a story for {petName}
              </h3>
              
              <div className="flex flex-col space-y-4 max-w-sm mx-auto">
                {/* Camera button */}
                <button onClick={handleCameraCapture} className="flex items-center justify-center space-x-3 p-6 bg-white/10 backdrop-blur-sm rounded-2xl text-white hover:bg-white/20 transition-colors">
                  <CameraIcon className="w-8 h-8"/>
                  <span className="text-lg font-semibold">Take Photo</span>
                </button>

                {/* Gallery button */}
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center space-x-3 p-6 bg-white/10 backdrop-blur-sm rounded-2xl text-white hover:bg-white/20 transition-colors">
                  <PhotoIcon className="w-8 h-8"/>
                  <span className="text-lg font-semibold">Choose from Gallery</span>
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden"/>
            </motion.div>)}

          {step === 'edit' && selectedMedia && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md mx-auto">
              {/* Media container */}
              <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden">
                {mediaType === 'photo' ? (<Image src={selectedMedia} alt="Story content" fill className="object-cover"/>) : (<video src={selectedMedia} className="w-full h-full object-cover" controls muted/>)}

                {/* Filter overlay */}
                {selectedFilter.id !== 'none' && (<div className="absolute inset-0" style={{
                    filter: `sepia(${selectedFilter.intensity * 100}%) saturate(${selectedFilter.intensity * 150}%) hue-rotate(${selectedFilter.intensity * 30}deg)`
                }}/>)}

                {/* Stickers */}
                {stickers.map((sticker) => (<motion.div key={sticker.id} drag dragMomentum={false} onDragEnd={(_, info) => {
                    updateSticker(sticker.id, {
                        position: {
                            x: (info.point.x / window.innerWidth) * 100,
                            y: (info.point.y / window.innerHeight) * 100
                        }
                    });
                }} className={`
                      absolute cursor-move select-none
                      ${selectedSticker === sticker.id ? 'ring-2 ring-primary-500' : ''}
                    `} style={{
                    left: `${sticker.position.x}%`,
                    top: `${sticker.position.y}%`,
                    transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`
                }} onClick={() => setSelectedSticker(sticker.id)}>
                    <div className="text-4xl">
                      {sticker.content}
                    </div>
                    
                    {selectedSticker === sticker.id && (<button onClick={() => removeSticker(sticker.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                        <XMarkIcon className="w-4 h-4"/>
                      </button>)}
                  </motion.div>))}

                {/* Caption overlay */}
                {showCaption && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-20 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                      <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..." className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none" autoFocus/>
                    </div>
                  </motion.div>)}
              </div>
            </motion.div>)}
        </div>

        {/* Bottom toolbar */}
        {step === 'edit' && (<motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center space-x-8">
              {/* Stickers */}
              <button onClick={() => setShowStickers(!showStickers)} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <FaceSmileIcon className="w-6 h-6"/>
              </button>

              {/* Filters */}
              <button onClick={() => setShowFilters(!showFilters)} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <ArrowPathIcon className="w-6 h-6"/>
              </button>

              {/* Caption */}
              <button onClick={() => setShowCaption(!showCaption)} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <PencilIcon className="w-6 h-6"/>
              </button>
            </div>
          </motion.div>)}

        {/* Sticker picker */}
        <AnimatePresence>
          {showStickers && (<motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-black/90 backdrop-blur-sm">
              <div className="grid grid-cols-10 gap-2">
                {STICKERS.map((sticker) => (<button key={sticker} onClick={() => addSticker(sticker)} className="p-2 text-2xl hover:scale-110 transition-transform">
                    {sticker}
                  </button>))}
              </div>
            </motion.div>)}
        </AnimatePresence>

        {/* Filter picker */}
        <AnimatePresence>
          {showFilters && (<motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-black/90 backdrop-blur-sm">
              <div className="flex space-x-4 overflow-x-auto">
                {FILTERS.map((filter) => (<button key={filter.id} onClick={() => setSelectedFilter(filter)} className={`
                      flex-shrink-0 p-3 rounded-lg text-white text-sm font-medium
                      ${selectedFilter.id === filter.id
                    ? 'bg-primary-500'
                    : 'bg-white/10 hover:bg-white/20'}
                    `}>
                    {filter.name}
                  </button>))}
              </div>
            </motion.div>)}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>);
}
// Hook for story composition
export function useStoryComposer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const openComposer = () => {
        setIsOpen(true);
        setIsComposing(true);
    };
    const closeComposer = () => {
        setIsOpen(false);
        setIsComposing(false);
    };
    const publishStory = async (storyData) => {
        try {
            setIsComposing(true);
            // Upload story to server
            const formData = new FormData();
            formData.append('type', storyData.type);
            formData.append('caption', storyData.caption);
            formData.append('stickers', JSON.stringify(storyData.stickers));
            formData.append('filters', JSON.stringify(storyData.filters));
            if (storyData.type === 'photo') {
                // Convert image to blob for upload
                const response = await fetch(storyData.url);
                const blob = await response.blob();
                formData.append('media', blob, 'story.jpg');
            }
            else {
                // Handle video upload
                const response = await fetch(storyData.url);
                const blob = await response.blob();
                formData.append('media', blob, 'story.mp4');
            }
            const uploadResponse = await fetch('/api/stories', {
                method: 'POST',
                body: formData
            });
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload story');
            }
            const result = await uploadResponse.json();
            return result;
        }
        catch (error) {
            logger.error('Story upload failed:', { error });
            throw error;
        }
        finally {
            setIsComposing(false);
        }
    };
    return {
        isOpen,
        isComposing,
        openComposer,
        closeComposer,
        publishStory
    };
}
//# sourceMappingURL=StoryComposer.jsx.map