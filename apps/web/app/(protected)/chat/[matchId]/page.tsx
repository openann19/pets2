'use client';

import {
  ArrowLeftIcon,
  CheckIcon,
  FaceSmileIcon,
  HeartIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  PhotoIcon,
  SparklesIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/hooks/useSocket';
import { api, chatAPI } from '@/services/api';
import { logger } from '@/services/logger';
import type { Match, Message, MessageAttachment, SocketTypingData, SocketUserStatusData } from '@/types';


export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
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
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😀', '❤️', '🐕', '🐱', '🎾', '🦴', '🐾', '💕', '😍', '🥰', '😊', '🎉'];

  useEffect(() => {
    loadChat();
    joinChatRoom();
    
    return () => {
      leaveChatRoom();
    };
  }, [matchId]);

  useEffect(() => {
    if (!socket?.on) return;
    
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTypingIndicator);
    socket.on('messages_read', handleReadReceipt);
    socket.on('user_status', handleUserStatus);
    
    return () => {
      if (socket?.off) {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('messages_read');
        socket.off('user_status');
      }
    };
  }, [socket, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    setIsLoading(true);
    try {
      // Load match info
      const matchResponse: any = await api.matches.getMatch(matchId);
      const matchData = matchResponse?.data || matchResponse;
      setMatch(matchData as Match);
      
      // Load messages
      const messagesResponse: any = await chatAPI.getMessages(matchId);
      const messagesData = Array.isArray(messagesResponse) ? messagesResponse : messagesResponse?.data || [];
      setMessages(messagesData);
      
      // Mark as read
      await chatAPI.markAsRead(matchId);
      
      // Get AI suggestions for conversation starters
      if (messagesData.length === 0) {
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

  const joinChatRoom = () => {
    if (socket) {
      socket.joinMatch(matchId);
    }
  };

  const leaveChatRoom = () => {
    if (socket) {
      socket.leaveMatch(matchId);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Show notification if message is from other user
    if (message.senderId !== user?.id) {
      playNotificationSound();
      showNotification(message);
    }
  };

  const handleTypingIndicator = ({ userId, isTyping: typing }: SocketTypingData) => {
    if (userId !== user?.id && match) {
      setMatch({ ...match, isTyping: typing });
    }
  };

  const handleReadReceipt = ({ messageIds }: { messageIds: string[] }) => {
    setMessages(prev => prev.map(msg => 
      messageIds.includes(msg._id) ? { ...msg, read: true } : msg
    ));
  };

  const handleUserStatus = ({ userId, status }: SocketUserStatusData) => {
    if (userId !== user?.id && match) {
      setMatch({ ...match, isOnline: status === 'online' });
    }
  };

  const sendMessage = async (messageData?: Partial<Message>) => {
    const content = messageData?.content || inputMessage.trim();
    const type = messageData?.type || 'text';
    
    if (!content || !socket) return;

    const newMessage: Message = {
      _id: Date.now().toString(),
      matchId,
      senderId: user?.id || '',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      read: false,
      type,
      ...(messageData?.metadata && { metadata: messageData.metadata }),
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Send via socket
    const attachments: MessageAttachment[] = newMessage.metadata ? [{
      type: 'image',
      url: newMessage.content,
      ...(newMessage.metadata.fileName && { filename: newMessage.metadata.fileName }),
      ...(newMessage.metadata.fileSize && { size: newMessage.metadata.fileSize })
    }] : [];
    socket.sendMessage(matchId, newMessage.content, attachments);

    // Mark as sent
    try {
      await chatAPI.sendMessage(matchId, content);
      logger.info('Message sent', { matchId });
    } catch (error) {
      logger.error('Failed to send message', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== newMessage._id));
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
      
      const responseData = await response.json();
      const url = responseData.data?.url || responseData.url;
      
      if (!url) {
        throw new Error('No URL returned from upload');
      }
      
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
      console.error('Upload failed:', error);
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
        socket.startTyping(matchId);
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.stopTyping(matchId);
      }
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(() => {});
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <HeartIcon className="h-12 w-12 text-pink-500 mx-auto" />
          </motion.div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50" data-testid="chat-interface">
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
              <img
                src={match?.petPhoto || '/placeholder-pet.jpg'}
                alt={match?.petName}
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
                  <span className="text-purple-600">Typing...</span>
                ) : match?.isOnline ? (
                  <span className="text-green-600">Online</span>
                ) : (
                  `Last seen ${match?.lastSeen}`
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <PhoneIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <VideoCameraIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setShowMatchInfo(!showMatchInfo)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <InformationCircleIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
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
            {messages.map((message) => (
              <motion.div
                key={message._id}
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
                    ) : message.type === 'image' ? (
                      <div className="space-y-2">
                        <img 
                          src={message.content} 
                          alt="Chat image" 
                          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(message.content, '_blank')}
                        />
                        {message.metadata?.fileName && (
                          <p className="text-xs opacity-75">{message.metadata.fileName}</p>
                        )}
                      </div>
                    ) : (
                      <p className="break-words">{message.content}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-1 px-2">
                    <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                    {message.senderId === user?.id && message.read && (
                      <CheckIcon className="h-3 w-3 text-blue-500 ml-1" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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
          
          {/* Premium Message Input */}
          <div className="flex-1 relative">
            <motion.input
              type="text"
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="w-full px-6 py-3 glass-light rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-500"
              data-testid="message-input"
              animate={{ 
                scale: inputMessage.length > 0 ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
            
            {/* Typing indicator inside input */}
            {inputMessage.length > 0 && (
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              </motion.div>
            )}
          </div>
          
          {/* Enhanced Send Button */}
          <motion.button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px -12px rgba(147, 51, 234, 0.4)",
              rotate: 5 
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              animate={{ 
                x: inputMessage.length > 0 ? [0, 3, 0] : 0 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: inputMessage.length > 0 ? Infinity : 0 
              }}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </motion.div>
          </motion.button>
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
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Match Info</h3>
                <button
                  onClick={() => setShowMatchInfo(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <img
                src={match?.petPhoto || '/placeholder-pet.jpg'}
                alt={match?.petName}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <h4 className="font-semibold text-lg mb-2">{match?.petName}</h4>
              <p className="text-gray-600 mb-4">Owner: {match?.ownerName}</p>
              
              <div className="space-y-3">
                <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  View Profile
                </button>
                <button className="w-full py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                  Schedule Playdate
                </button>
                <button className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Report/Block
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
