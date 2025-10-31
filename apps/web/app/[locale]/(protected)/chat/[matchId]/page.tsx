'use client';

import {
  ArrowLeftIcon,
  CheckIcon,
  FaceSmileIcon,
  HeartIcon,
  InformationCircleIcon,
  PhoneIcon,
  PhotoIcon,
  SparklesIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import MessageInput from '@/components/Chat/MessageInput';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import SafeImage from '@/components/UI/SafeImage';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useSocket } from '@/hooks/useSocket';
import { api, chatAPI } from '@/services/api';
import { logger } from '@/services/logger';
import type { UserTypingEvent, MessageReadEvent } from '@pawfectmatch/core';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'emoji' | 'gift';
  metadata?: Record<string, string | number | boolean>;
}

interface Match {
  id: string;
  petName: string;
  petPhoto: string;
  ownerName: string;
  lastSeen: string;
  isOnline: boolean;
  isTyping: boolean;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale?.() || (typeof navigator !== 'undefined' ? navigator.language : 'en');
  const matchId = (params?.['matchId'] as string) || '';
  const { user } = useAuth();
  const socket = useSocket();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchInfo, setShowMatchInfo] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const closeSideSheetButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerTopRef = useRef<HTMLDivElement>(null);
  const emojiPickerBottomRef = useRef<HTMLDivElement>(null);
  const sideSheetRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<boolean>(true);

  const emojis = ['😀', '❤️', '🐕', '🐱', '🎾', '🦴', '🐾', '💕', '😍', '🥰', '😊', '🎉'];

  useEffect(() => {
    loadChat();
    joinChatRoom();
    
    return () => {
      leaveChatRoom();
    };
  }, [matchId]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on?.('new_message', handleNewMessage);
    socket.on?.('typing', handleTypingIndicator);
    socket.on?.('read_receipt', handleReadReceipt);
    socket.on?.('user_status', ({ isOnline }: { isOnline: boolean }) => {
      setMatch(prev => (prev ? { ...prev, isOnline } : prev));
    });
    
    return () => {
      socket.off?.('new_message');
      socket.off?.('typing');
      socket.off?.('read_receipt');
      socket.off?.('user_status');
    };
  }, [socket, messages]);

  useEffect(() => {
    // Auto-scroll to bottom only if user is near bottom
    if (autoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const loadChat = async () => {
    setIsLoading(true);
    try {
      // Load match info
      const matchData = await api.matches.getMatch(matchId);
      setMatch(matchData as unknown as Match);
      
      // Load messages
      const messagesData = await chatAPI.getMessages(matchId);
      setMessages(messagesData as unknown as Message[]);
      
      // Mark as read
      await chatAPI.markAsRead(matchId);
      
      // Get AI suggestions for conversation starters
      if ((messagesData as unknown as Message[]).length === 0) {
        loadAiSuggestions();
      }
      
      logger.info('Chat loaded', { matchId });
    } catch (error) {
      logger.error('Failed to load chat', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAiSuggestions = async () => {
    try {
      const suggestions = await api.ai.getChatSuggestions(matchId);
      if (Array.isArray(suggestions)) {
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      // Default suggestions
      setAiSuggestions([
        "Hi! Your pet looks adorable! 😊",
        "Would love to arrange a playdate! 🐾",
        "What's your pet's favorite activity?"
      ]);
    }
  };

  // Autofocus message input on match change
  useEffect(() => {
    inputRef.current?.focus();
  }, [matchId]);

  // Restore chat draft for this match
  useEffect(() => {
    const key = `chat_draft_${matchId}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) setInputMessage(saved);
    } catch {}
  }, [matchId]);

  // Persist chat draft while typing
  useEffect(() => {
    const key = `chat_draft_${matchId}`;
    try {
      localStorage.setItem(key, inputMessage);
    } catch {}
  }, [inputMessage, matchId]);

  // Close emoji picker on outside click
  useClickOutside(emojiPickerTopRef, () => setShowEmojis(false), showEmojis);
  useClickOutside(emojiPickerBottomRef, () => setShowEmojis(false), showEmojis);
  // Escape handling for emoji and side sheet
  useEscapeKey(() => {
    if (showEmojis) setShowEmojis(false);
    if (showMatchInfo) {
      setShowMatchInfo(false);
      requestAnimationFrame(() => infoButtonRef.current?.focus());
    }
  }, showEmojis || showMatchInfo);
  // Trap focus in side sheet while open
  useFocusTrap(sideSheetRef, showMatchInfo);

  // Persist and restore scroll position per match
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const key = `chat_scroll_${locale}_${matchId}`;
    // Restore
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        el.scrollTop = Number(saved);
        autoScrollRef.current = false;
      }
    } catch {}

    const onScroll = () => {
      const container = messagesContainerRef.current;
      if (!container) return;
      // Save
      try { sessionStorage.setItem(key, String(container.scrollTop)); } catch {}
      // Determine if we should auto-scroll on new messages
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      autoScrollRef.current = distanceFromBottom < 24;
    };

    el.addEventListener('scroll', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [matchId]);

  const joinChatRoom = () => {
    if (socket) {
      socket.joinMatch?.(matchId);
    }
  };

  const leaveChatRoom = () => {
    if (socket) {
      socket.leaveMatch?.(matchId);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Show notification if message is from other user
    if (message.senderId !== user?.id) {
      playNotificationSound();
      showNotification(message);
      
      // Enhanced haptic feedback for new messages
      if ('vibrate' in navigator) {
        navigator.vibrate([20, 10, 20]);
      }
    }
  };

  const handleTypingIndicator = ({ userId, isTyping: typing }: UserTypingEvent) => {
    if (userId !== user?.id && match) {
      setMatch({ ...match, isTyping: typing });
    }
  };

  const handleReadReceipt = ({ messageIds }: MessageReadEvent) => {
    setMessages(prev => prev.map(msg => 
      messageIds.includes(msg.id) ? { ...msg, read: true } : msg
    ));
  };

  const sendMessage = async (messageData?: Partial<Message>) => {
    const content = messageData?.content || inputMessage.trim();
    const type = messageData?.type || 'text';
    
    if (!content || !socket) return;

    // Enhanced haptic feedback for sending messages
    if ('vibrate' in navigator) {
      navigator.vibrate([10]);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      metadata: messageData?.metadata,
    };

    // Optimistic update with enhanced animation
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    requestAnimationFrame(() => scrollToBottom());

    // Send via socket
    socket.sendMessage?.(content, matchId);

    // Mark as sent
    try {
      await chatAPI.sendMessage(matchId, content);
      try { localStorage.removeItem(`chat_draft_${matchId}`); } catch {}
      logger.info('Message sent', { matchId });
    } catch (error) {
      logger.error('Failed to send message', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const { url } = await response.json();
      
      // Send as image message
      await sendMessage({
        type: 'image',
        content: url,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
        }
      });
    } catch (error) {
      logger.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (socket) {
        socket.startTyping?.(matchId);
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout with debouncing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.stopTyping?.(matchId);
      }
    }, 1500); // Reduced from 2000ms for more responsive typing indicators
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    // Enhanced notification sound with fallback
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3; // Reduced volume for better UX
      audio.play().catch(() => {
        // Fallback to system sound
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      });
    } catch (error) {
      // Fallback to haptic feedback only
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const showNotification = (message: Message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New message from ${match?.petName}`, {
        body: message.content,
        ...(match?.petPhoto && { icon: match.petPhoto })
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <HeartIcon className="h-12 w-12 text-pink-500 mx-auto" />
            </motion.div>
            <p className="mt-4 text-white/80">Loading chat...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] bg-transparent">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b px-4 py-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/matches')}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <SafeImage
                src={match?.petPhoto}
                alt={match?.petName || 'Pet'}
                fallbackType="pet"
                className="w-10 h-10 rounded-full object-cover"
              />
              {match?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            
            <div className="ml-3">
              <h2 className="font-semibold text-gray-900">{match?.petName}</h2>
              <p className="text-xs text-gray-500">
                {match?.isTyping ? (
                  <span className="text-purple-600 font-medium">Typing...</span>
                ) : match?.isOnline ? (
                  <span className="text-green-600 font-medium">● Online</span>
                ) : (
                  <span className="text-gray-500">{formatLastSeen(match?.lastSeen)}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-green-500/20 border-2 border-green-500/50 rounded-full hover:bg-green-500/30 hover:border-green-500 transition-all shadow-lg hover:shadow-green-500/50">
              <PhoneIcon className="h-5 w-5 text-green-600" />
            </button>
            <button className="p-2.5 bg-blue-500/20 border-2 border-blue-500/50 rounded-full hover:bg-blue-500/30 hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/50">
              <VideoCameraIcon className="h-5 w-5 text-blue-600" />
            </button>
            <button 
              onClick={() => {
                setShowMatchInfo(!showMatchInfo);
                requestAnimationFrame(() => closeSideSheetButtonRef.current?.focus());
              }}
              className="p-2.5 bg-purple-500/20 border-2 border-purple-500/50 rounded-full hover:bg-purple-500/30 hover:border-purple-500 transition-all shadow-lg hover:shadow-purple-500/50"
              ref={infoButtonRef}
            >
              <InformationCircleIcon className="h-5 w-5 text-purple-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <SparklesIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">Start a conversation!</p>
            
            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-3">AI-suggested openers:</p>
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(suggestion);
                      sendMessage({ content: suggestion });
                    }}
                    className="block w-full max-w-sm mx-auto text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-sm text-purple-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : undefined;
              const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
              
              return (
                <React.Fragment key={message.id}>
                  {/* Date Separator */}
                  {showDateSeparator && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center my-6"
                    >
                      <div className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full shadow-sm">
                        {getDateSeparatorLabel(message.timestamp)}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Message Bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex mb-4 ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.senderId === user?.id ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.senderId === user?.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white text-gray-900 shadow-md'
                        }`}
                      >
                        {message.type === 'emoji' ? (
                          <span className="text-3xl">{message.content}</span>
                        ) : (
                          <p className="break-words">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Timestamp and Read Receipt */}
                      <div className={`flex items-center mt-1 px-2 gap-1 ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-xs ${message.senderId === user?.id ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.senderId === user?.id && (
                          <div className="flex items-center">
                            {message.read ? (
                              // Double check mark for read
                              <div className="flex -space-x-1">
                                <CheckIcon className="h-3 w-3 text-blue-500" />
                                <CheckIcon className="h-3 w-3 text-blue-500" />
                              </div>
                            ) : (
                              // Single check mark for delivered
                              <CheckIcon className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        )}
        
        {match?.isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-gray-500 text-sm"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="ml-2">{match.petName} is typing...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t px-4 py-2"
            ref={emojiPickerTopRef}
          >
            <div className="flex gap-2 overflow-x-auto">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    sendMessage({ content: emoji, type: 'emoji' });
                    setShowEmojis(false);
                  }}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Premium Input */}
      <motion.div 
        className="bg-white/95 backdrop-blur-lg border-t border-white/20 px-6 py-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          
          {/* Enhanced Photo Button */}
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="p-3 glass-light rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload photo"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            {uploadingImage ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <SparklesIcon className="h-5 w-5 text-purple-600" />
              </motion.div>
            ) : (
              <PhotoIcon className="h-5 w-5 text-gray-600" />
            )}
          </motion.button>
          
          {/* Enhanced Emoji Button */}
          <motion.button
            onClick={() => setShowEmojis(!showEmojis)}
            className={`p-3 glass-light rounded-xl transition-all ${showEmojis ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaceSmileIcon className="h-5 w-5" />
          </motion.button>
          
          <div className="flex-1">
            <MessageInput
              onSendMessage={async (content: string, type?: 'text' | 'image' | 'location' | 'voice') => {
                if (type && type !== 'text') {
                  await sendMessage({ content, type: type as any });
                } else {
                  await sendMessage({ content });
                }
              }}
              onTyping={(typing: boolean) => {
                setIsTyping(typing);
                if (socket) {
                  if (typing) {
                    socket.startTyping?.(matchId);
                  } else {
                    socket.stopTyping?.(matchId);
                  }
                }
              }}
              disabled={isLoading}
              autoFocus
              draftKey={`chat_draft_${locale}_${matchId}`}
              matchId={matchId}
            />
          </div>
        </div>
        
        {/* Enhanced Emoji Picker */}
        <AnimatePresence>
          {showEmojis && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mt-3 p-4 glass-light rounded-2xl"
              ref={emojiPickerBottomRef}
            >
              <div className="grid grid-cols-8 gap-2">
                {['❤️', '😍', '🥰', '😘', '🤗', '👋', '🎉', '🔥', '💯', '✨', '🐶', '🐱', '🐾', '🎾', '🦴', '🏠'].map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    onClick={() => {
                      setInputMessage(prev => prev + emoji);
                      setShowEmojis(false);
                    }}
                    className="p-2 text-2xl hover:bg-white/50 rounded-lg transition-all"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Match Info Sidebar */}
      <AnimatePresence>
        {showMatchInfo && (
          <>
          {/* Backdrop for outside click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => {
              setShowMatchInfo(false);
              requestAnimationFrame(() => infoButtonRef.current?.focus());
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto"
            ref={sideSheetRef}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Match Info</h3>
                <button
                  onClick={() => {
                    setShowMatchInfo(false);
                    requestAnimationFrame(() => infoButtonRef.current?.focus());
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  ref={closeSideSheetButtonRef}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <SafeImage
                src={match?.petPhoto}
                alt={match?.petName || 'Pet'}
                fallbackType="pet"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <h4 className="font-semibold text-lg mb-2">{match?.petName}</h4>
              <p className="text-gray-600 mb-4">Owner: {match?.ownerName}</p>
              
              <div className="space-y-3">
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/50 font-semibold">
                  View Profile
                </button>
                <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl hover:from-pink-400 hover:to-orange-400 transition-all shadow-lg hover:shadow-pink-500/50 font-semibold">
                  Schedule Playdate
                </button>
                <button className="w-full py-3 bg-red-500/20 border-2 border-red-500/50 text-red-600 rounded-xl hover:bg-red-500/30 hover:border-red-500 transition-all font-semibold">
                  Report/Block
                </button>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </PremiumLayout>
  );
}
