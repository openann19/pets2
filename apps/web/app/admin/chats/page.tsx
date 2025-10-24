'use client';

import { useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';

interface Chat {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  status: 'active' | 'reported' | 'blocked';
  reportedReason?: string;
}

export default function AdminChatController() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/admin/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
      } else {
        logger.error('Failed to load chats');
      }
    } catch (error) {
      logger.error('Error loading chats', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/block`, {
        method: 'POST',
      });
      if (response.ok) {
        loadChats(); // Refresh
      }
    } catch (error) {
      logger.error('Error blocking chat', error);
    }
  };

  const handleUnblockChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/unblock`, {
        method: 'POST',
      });
      if (response.ok) {
        loadChats();
      }
    } catch (error) {
      logger.error('Error unblocking chat', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading chats...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chat Moderation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Active Chats</h2>
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedChat?.id === chat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">
                      {chat.participants.map(p => p.name).join(', ')}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(chat.lastMessage.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                    {chat.status === 'reported' && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded mt-1">
                        Reported
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Details */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Chat Details</h2>
          {selectedChat ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Participants</h3>
                <p className="text-sm text-gray-600">
                  {selectedChat.participants.map(p => p.name).join(', ')}
                </p>
              </div>

              {selectedChat.status === 'reported' && selectedChat.reportedReason && (
                <div>
                  <h3 className="font-medium text-red-600">Reported Reason</h3>
                  <p className="text-sm text-red-600">{selectedChat.reportedReason}</p>
                </div>
              )}

              <div className="flex space-x-2">
                {selectedChat.status === 'blocked' ? (
                  <button
                    onClick={() => handleUnblockChat(selectedChat.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Unblock Chat
                  </button>
                ) : (
                  <button
                    onClick={() => handleBlockChat(selectedChat.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Block Chat
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select a chat to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
