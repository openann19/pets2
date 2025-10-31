'use client';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedInput,
  EnhancedDropdown,
  EnhancedDataTable,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';

interface ChatMessage extends Record<string, unknown> {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
  flagged: boolean;
  flaggedReason?: string;
  deleted: boolean;
}

const filterOptions = [
  { value: 'all', label: 'All Messages' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'recent', label: 'Recent (24h)' },
  { value: 'deleted', label: 'Deleted' },
];

export default function ChatsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [_totalPages, setTotalPages] = useState(1);

  const loadMessages = async (force = false): Promise<void> => {
    try {
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Call the admin API to fetch chat messages for moderation
      const queryParams = new URLSearchParams();
      if (filter !== 'all') queryParams.append('status', filter);
      if (searchQuery) queryParams.append('search', searchQuery);
      queryParams.append('page', String(currentPage));
      queryParams.append('limit', '50');
      
      const response = await fetch(`/api/admin/chats?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        // Log error but don't crash
        logger.error('Failed to load chat messages', {
          status: response.status,
          statusText: response.statusText,
        });
        setMessages([]);
      }
    } catch (error: unknown) {
      logger.error('Error loading chat messages:', { error });
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, [currentPage, filter, searchQuery]);

  const handleRefresh = async (): Promise<void> => {
    await loadMessages(true);
  };

  const handleMessageAction = async (
    messageId: string,
    action: 'flag' | 'unflag' | 'delete' | 'restore',
  ): Promise<void> => {
    try {
      // In a real implementation, this would call the admin API
      await fetch(`/api/admin/chats/${messageId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            switch (action) {
              case 'flag':
                return { ...msg, flagged: true };
              case 'unflag':
                return { ...msg, flagged: false };
              case 'delete':
                return { ...msg, deleted: true };
              case 'restore':
                return { ...msg, deleted: false };
              default:
                return msg;
            }
          }
          return msg;
        }),
      );
    } catch (error: unknown) {
      logger.error('Error performing message action:', { error });
    }
  };

  const filteredMessages = messages.filter((msg) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !msg.content.toLowerCase().includes(query) &&
        !msg.senderName.toLowerCase().includes(query) &&
        !msg.receiverName.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Status filter
    switch (filter) {
      case 'flagged':
        return msg.flagged && !msg.deleted;
      case 'recent':
        const msgDate = new Date(msg.timestamp);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return msgDate >= yesterday && !msg.deleted;
      case 'deleted':
        return msg.deleted;
      default:
        return !msg.deleted;
    }
  });

  const columns = [
    {
      key: 'timestamp',
      label: 'Time',
      render: (_value: unknown, row: ChatMessage) => new Date(row.timestamp).toLocaleString(),
    },
    {
      key: 'sender',
      label: 'From',
      render: (_value: unknown, row: ChatMessage) => row.senderName,
    },
    {
      key: 'receiver',
      label: 'To',
      render: (_value: unknown, row: ChatMessage) => row.receiverName,
    },
    {
      key: 'content',
      label: 'Message',
      render: (_value: unknown, row: ChatMessage) => (
        <div className="max-w-md truncate">
          {row.content.length > 100 ? `${row.content.substring(0, 100)}...` : row.content}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: ChatMessage) => (
        <div className="flex items-center space-x-2">
          {row.flagged && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
              Flagged
            </span>
          )}
          {row.deleted && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              Deleted
            </span>
          )}
          {!row.flagged && !row.deleted && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: ChatMessage) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedMessage(row)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="View message"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          {!row.flagged && (
            <button
              onClick={() => handleMessageAction(row.id, 'flag')}
              className="rounded-md p-1 text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300"
              aria-label="Flag message"
            >
              <ExclamationTriangleIcon className="h-5 w-5" />
            </button>
          )}
          {row.flagged && (
            <button
              onClick={() => handleMessageAction(row.id, 'unflag')}
              className="rounded-md p-1 text-green-400 hover:text-green-600 dark:hover:text-green-300"
              aria-label="Unflag message"
            >
              <ExclamationTriangleIcon className="h-5 w-5" />
            </button>
          )}
          {!row.deleted && (
            <button
              onClick={() => handleMessageAction(row.id, 'delete')}
              className="rounded-md p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
              aria-label="Delete message"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton
          variant="card"
          count={3}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat Moderation</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Moderate and manage user messages
          </p>
        </div>
        <EnhancedButton
          onClick={handleRefresh}
          disabled={refreshing}
          variant="primary"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </EnhancedButton>
      </div>

      {/* Search and Filters */}
      <EnhancedCard className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <EnhancedInput
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <EnhancedDropdown
              value={filter}
              onChange={(value) => setFilter(value)}
              options={filterOptions}
              className="pl-10"
            />
          </div>
        </div>
      </EnhancedCard>

      {/* Messages Table */}
      <EnhancedCard className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Messages ({filteredMessages.length})
        </h2>
        {filteredMessages.length === 0 ? (
          <div className="py-12 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No messages found</p>
          </div>
        ) : (
          <EnhancedDataTable
            data={filteredMessages}
            columns={columns}
          />
        )}
      </EnhancedCard>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <EnhancedCard className="max-w-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Message Details
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">From</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedMessage.senderName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">To</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedMessage.receiverName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {new Date(selectedMessage.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Message</p>
                <p className="mt-1 rounded-md bg-gray-50 p-3 text-gray-900 dark:bg-gray-800 dark:text-white">
                  {selectedMessage.content}
                </p>
              </div>
              {selectedMessage.flagged && selectedMessage.flaggedReason && (
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Flag Reason</p>
                  <p className="mt-1 text-red-600 dark:text-red-400">
                    {selectedMessage.flaggedReason}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <EnhancedButton
                onClick={() => setSelectedMessage(null)}
                variant="secondary"
              >
                Close
              </EnhancedButton>
              {selectedMessage.flagged ? (
                <EnhancedButton
                  onClick={() => {
                    handleMessageAction(selectedMessage.id, 'unflag');
                    setSelectedMessage(null);
                  }}
                  variant="primary"
                >
                  Unflag
                </EnhancedButton>
              ) : (
                <EnhancedButton
                  onClick={() => {
                    handleMessageAction(selectedMessage.id, 'flag');
                    setSelectedMessage(null);
                  }}
                  variant="danger"
                >
                  Flag
                </EnhancedButton>
              )}
            </div>
          </EnhancedCard>
        </div>
      )}
    </div>
  );
}

