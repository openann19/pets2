'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  PaperAirplaneIcon,
  PhotoIcon,
  FaceSmileIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../src/lib/auth-store';
import { chatAPI, api } from '../../../../src/services/api';
import { useSocket } from '../../../../src/hooks/useSocket';
import { logger } from '../../../../src/services/logger';
import Image from 'next/image';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'emoji' | 'gift';
  metadata?: any;
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
  const matchId = params.matchId as string;
  const { user } = useAuthStore();
  const socket = useSocket();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchInfo, setShowMatchInfo] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const emojis = ['😀', '❤️', '🐕', '🐱', '🎾', '🦴', '🐾', '💕', '😍', '🥰', '😊', '🎉'];

  useEffect(() => {
    loadChat();
    joinChatRoom();
    
    return () => {
      leaveChatRoom();
    };
  }, [matchId]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('typing', handleTypingIndicator);
      socket.on('read_receipt', handleReadReceipt);
      socket.on('user_status', handleUserStatus);
      
      return () => {
        socket.off('new_message');
        socket.off('typing');
        socket.off('read_receipt');
        socket.off('user_status');
      };
    }
  }, [socket, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    setIsLoading(true);
    try {
      // Load match info
      const matchData = await api.matches.getMatch(matchId);
      setMatch(matchData);
      
      // Load messages
      const messagesData = await chatAPI.getMessages(matchId);
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
      socket.emit('join_chat', { matchId, userId: user?.id });
    }
  };

  const leaveChatRoom = () => {
    if (socket) {
      socket.emit('leave_chat', { matchId, userId: user?.id });
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

  const handleTypingIndicator = ({ userId, isTyping: typing }: any) => {
    if (userId !== user?.id && match) {
      setMatch({ ...match, isTyping: typing });
    }
  };

  const handleReadReceipt = ({ messageIds }: any) => {
    setMessages(prev => prev.map(msg => 
      messageIds.includes(msg.id) ? { ...msg, read: true } : msg
    ));
  };

  const handleUserStatus = ({ userId, isOnline, lastSeen }: any) => {
    if (match && userId === match.id) {
      setMatch({ ...match, isOnline, lastSeen });
    }
  };

  const sendMessage = async (content: string = inputMessage, type: 'text' | 'emoji' = 'text') => {
    if (!content.trim() && type === 'text') return;
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: user?.id || '',
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setInputMessage('');
    
    try {
      const sentMessage = await chatAPI.sendMessage(matchId, content);
      
      // Replace temp message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? sentMessage : msg
      ));
      
      // Emit to socket
      if (socket) {
        socket.emit('send_message', sentMessage);
      }
      
      logger.info('Message sent', { matchId });
    } catch (error) {
      logger.error('Failed to send message', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (socket) {
        socket.emit('typing', { matchId, userId: user?.id, isTyping: true });
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
        socket.emit('typing', { matchId, userId: user?.id, isTyping: false });
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
        icon: match?.petPhoto
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
    <div className="flex flex-col h-screen bg-gray-50">
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
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
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
                    onClick={() => sendMessage(suggestion)}
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
                key={message.id}
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
                  
                  <div className="flex items-center mt-1 px-2">
                    <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
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
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                    sendMessage(emoji, 'emoji');
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

      {/* Input */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <PhotoIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaceSmileIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

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
