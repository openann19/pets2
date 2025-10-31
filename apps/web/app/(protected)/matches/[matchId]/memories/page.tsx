/**
 * MemoryWeave Page
 * Visual representation of match memories and conversations
 * Matches mobile MemoryWeaveScreen structure
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MemoryWeave3D } from '@/components/MemoryWeave/MemoryWeave3D';
import { useTheme } from '@/theme';
import { api } from '@/services/api';

export default function MemoryWeavePage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const matchId = params?.matchId as string;
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!matchId) {
        setError('Match ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.chat.getMessages(matchId);
        if (response.success && response.data) {
          setMessages(Array.isArray(response.data) ? response.data : []);
        } else {
          setError('Failed to load messages');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [matchId]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.bg }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
            style={{ borderColor: theme.colors.primary }} />
          <p style={{ color: theme.colors.onMuted }}>Loading memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: theme.colors.bg }}
      >
        <div 
          className="rounded-xl p-8 text-center max-w-md"
          style={{ 
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <p className="mb-4" style={{ color: theme.colors.danger }}>{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ 
              backgroundColor: theme.colors.primary,
              color: theme.colors.onPrimary,
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Extract user IDs from messages (assuming first message sender is the other user)
  const userId = typeof window !== 'undefined' 
    ? (window as any).__USER_ID__ || 'current-user'
    : 'current-user';
  
  const partnerId = messages[0]?.senderId || messages[0]?.userId || matchId;

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-50 border-b"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ color: theme.colors.onSurface }}
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold" style={{ color: theme.colors.onSurface }}>
                Memory Weave
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* MemoryWeave Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemoryWeave3D
          matchId={matchId}
          userId={userId}
          partnerId={partnerId}
          messages={messages}
          onClose={() => router.back()}
        />
      </div>
    </div>
  );
}

