/**
 * 💬 Enhanced Message Input
 * Advanced chat features: photos, voice, location, typing indicators
 */
'use client';
import React, { useState, useRef, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, PhotoIcon, MapPinIcon, MicrophoneIcon, FaceSmileIcon, XMarkIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../UI/LoadingSpinner';
import Image from 'next/image';
import { useAnalytics } from '@/utils/analytics-system';
export default function EnhancedMessageInput({ onSendMessage, onTyping, disabled = false, placeholder = "Type a message...", autoFocus = false, draftKey, }) {
    const analytics = useAnalytics();
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    // Media states
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isSharingLocation, setIsSharingLocation] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(undefined);
    const mediaRecorderRef = useRef(null);
    const recordingIntervalRef = useRef(undefined);
    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, [message]);
    // Optional autofocus
    useEffect(() => {
        if (autoFocus && !disabled) {
            textareaRef.current?.focus();
        }
    }, [autoFocus, disabled]);
    // Draft: load on mount and persist on change
    useEffect(() => {
        if (!draftKey)
            return;
        try {
            const saved = localStorage.getItem(draftKey);
            if (saved)
                setMessage(saved);
        }
        catch { }
    }, [draftKey]);
    useEffect(() => {
        if (!draftKey)
            return;
        try {
            if (message)
                localStorage.setItem(draftKey, message);
            else
                localStorage.removeItem(draftKey);
        }
        catch { }
    }, [message, draftKey]);
    // Handle typing indicators
    useEffect(() => {
        if (onTyping) {
            onTyping(isTyping);
        }
    }, [isTyping, onTyping]);
    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);
        // Handle typing indicator
        if (value.trim() && !isTyping) {
            setIsTyping(true);
        }
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 1000);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if ((!trimmedMessage && !selectedImage) || disabled || isSending)
            return;
        setIsSending(true);
        setError(null);
        try {
            if (selectedImage) {
                // Upload image first
                await handleImageUpload();
            }
            else {
                await onSendMessage(trimmedMessage, 'text');
                analytics.trackMessage('unknown', trimmedMessage.length);
                analytics.trackInteraction('MessageInput', 'send_text', { length: trimmedMessage.length });
            }
            setMessage('');
            setIsTyping(false);
            setSuccess('✓ Sent');
            setTimeout(() => setSuccess(null), 2000);
            // Clear persisted draft after successful send
            try {
                if (draftKey)
                    localStorage.removeItem(draftKey);
            }
            catch { }
            // Clear typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
        catch (err) {
            logger.error('Failed to send message:', { error });
            setError(err.message || 'Failed to send message. Please try again.');
            // Report analytics error via interaction to avoid missing hook method
            analytics.trackInteraction('MessageInput', 'error', { message: String(err) });
        }
        finally {
            setIsSending(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    // 📸 Image Upload
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image too large. Maximum 5MB.');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleImageUpload = async () => {
        if (!selectedImage)
            return;
        setIsUploadingImage(true);
        try {
            // Upload to Cloudinary or your image service
            const formData = new FormData();
            formData.append('file', selectedImage);
            formData.append('upload_preset', 'pawfectmatch'); // Configure in Cloudinary
            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                await onSendMessage(data.secure_url, 'image');
                analytics.trackInteraction('MessageInput', 'send_image', { size: selectedImage.size });
                setSelectedImage(null);
                setImagePreview(null);
            }
        }
        catch (err) {
            logger.error('Failed to upload image:', { error });
            setError('Failed to upload image. Please try again.');
            analytics.trackInteraction('MessageInput', 'error_upload_image', { message: String(err) });
        }
        finally {
            setIsUploadingImage(false);
        }
    };
    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    // 📍 Location Sharing
    const handleLocationShare = async () => {
        if (!navigator.geolocation) {
            setError('Location sharing not supported in your browser.');
            return;
        }
        setIsSharingLocation(true);
        setError(null);
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                });
            });
            const { latitude, longitude } = position.coords;
            const locationMessage = `📍 Live Location\nhttps://www.google.com/maps?q=${latitude},${longitude}`;
            await onSendMessage(locationMessage, 'location');
            setSuccess('✓ Location shared');
            setTimeout(() => setSuccess(null), 2000);
            analytics.trackInteraction('MessageInput', 'send_location');
        }
        catch (err) {
            logger.error('Failed to get location:', { error });
            setError(err.code === 1 ? 'Location permission denied.' : 'Failed to get location.');
            analytics.trackInteraction('MessageInput', 'error_share_location', { message: String(err) });
        }
        finally {
            setIsSharingLocation(false);
        }
    };
    // 🎤 Voice Recording
    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                await handleVoiceUpload(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecordingVoice(true);
            setRecordingDuration(0);
            // Update duration timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        }
        catch (err) {
            logger.error('Failed to start recording:', { error });
            setError('Microphone permission denied.');
            analytics.trackInteraction('MessageInput', 'error_start_voice', { message: String(err) });
        }
    };
    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && isRecordingVoice) {
            mediaRecorderRef.current.stop();
            setIsRecordingVoice(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };
    const handleVoiceUpload = async (audioBlob) => {
        try {
            // Upload voice message to storage
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice-message.webm');
            formData.append('upload_preset', 'pawfectmatch_voice');
            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                await onSendMessage(data.secure_url, 'voice');
                setSuccess('✓ Voice message sent');
                setTimeout(() => setSuccess(null), 2000);
                analytics.trackInteraction('MessageInput', 'send_voice', { size: audioBlob.size });
            }
        }
        catch (err) {
            logger.error('Failed to upload voice:', { error });
            setError('Failed to send voice message.');
            analytics.trackInteraction('MessageInput', 'error_upload_voice', { message: String(err) });
        }
    };
    const formatRecordingTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return (<div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
      {/* Success Message */}
      <AnimatePresence>
        {success && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400"/>
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">{success}</span>
          </motion.div>)}
      </AnimatePresence>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (<motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 12 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0"/>
            <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-sm font-medium">
              Dismiss
            </button>
          </motion.div>)}
      </AnimatePresence>

      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-3 relative">
            <div className="relative inline-block">
              <Image src={imagePreview} alt="Preview" width={200} height={200} className="rounded-lg object-cover"/>
              <button onClick={clearImage} className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors">
                <XMarkIcon className="w-5 h-5 text-white"/>
              </button>
              {isUploadingImage && (<div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <LoadingSpinner size="md" variant="default"/>
                </div>)}
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Voice Recording UI */}
      <AnimatePresence>
        {isRecordingVoice && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg px-4 py-3 flex items-center gap-3">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-red-500 rounded-full"/>
            <span className="text-sm font-bold text-red-700 dark:text-red-300">
              Recording... {formatRecordingTime(recordingDuration)}
            </span>
            <button onClick={stopVoiceRecording} className="ml-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">
              Stop & Send
            </button>
          </motion.div>)}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3" aria-label="Message input">
        {/* Action buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Photo Upload */}
          <motion.button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || isRecordingVoice} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Attach photo">
            <PhotoIcon className="w-5 h-5"/>
          </motion.button>
          
          {/* Location Share */}
          <motion.button type="button" onClick={handleLocationShare} disabled={disabled || isSharingLocation || isRecordingVoice} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Share location">
            {isSharingLocation ? (<LoadingSpinner size="sm" variant="default"/>) : (<MapPinIcon className="w-5 h-5"/>)}
          </motion.button>

          {/* Voice Message */}
          <motion.button type="button" onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording} disabled={disabled} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`p-2 rounded-full transition-colors ${isRecordingVoice
            ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
            : 'text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`} aria-label={isRecordingVoice ? 'Stop recording' : 'Record voice message'}>
            <MicrophoneIcon className="w-5 h-5"/>
          </motion.button>
        </div>

        {/* Message input */}
        <div className="flex-1">
          <textarea ref={textareaRef} value={message} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder={placeholder} disabled={disabled || isRecordingVoice} rows={1} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all" style={{ maxHeight: '120px' }} aria-label="Message"/>
        </div>

        {/* Send button */}
        <motion.button type="submit" disabled={(!message.trim() && !selectedImage) || disabled || isSending || isRecordingVoice} whileHover={{ scale: isSending ? 1 : 1.05 }} whileTap={{ scale: isSending ? 1 : 0.95 }} className={`p-3 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative ${(message.trim() || selectedImage) && !disabled && !isSending
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'} ${isSending ? 'cursor-wait' : ''}`} aria-label="Send message">
          {isSending ? (<LoadingSpinner size="sm" variant="default"/>) : (<PaperAirplaneIcon className="w-5 h-5"/>)}
        </motion.button>
      </form>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden"/>
    </div>);
}
//# sourceMappingURL=EnhancedMessageInput.jsx.map