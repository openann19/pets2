/**
 * Phase 2 Product Enhancements - Type Contracts
 * Production-ready contracts for Scheduling, Translation, Offline Outbox, Premium, Templates, and Smart Suggestions
 * Aligned with AEOS V3 Final Canonical Specification
 */

import type { RichContent } from './phase1-contracts';

/**
 * Scheduled Message Contract (v1)
 * Message scheduling with timezone handling
 */
export interface ScheduledMessage {
  id: string;
  convoId: string;
  senderId: string;
  body: RichContent;
  scheduledAt: string; // ISO-8601 UTC
  tz: string; // IANA timezone (e.g., 'America/New_York')
  status: 'scheduled' | 'sent' | 'canceled' | 'failed';
  createdAt: string; // ISO-8601 UTC
  updatedAt: string; // ISO-8601 UTC
  attempts?: number;
  error?: string;
}

/**
 * Create Scheduled Message Request
 */
export interface CreateScheduledMessageRequest {
  convoId: string;
  body: RichContent;
  scheduledAt: string; // ISO-8601 UTC
  tz: string; // IANA timezone
}

/**
 * Translation Contract (v1)
 * Message translation with quality scores
 */
export interface Translation {
  msgId: string;
  srcLang: string; // ISO 639-1 (e.g., 'en', 'es')
  tgtLang: string;
  text: string;
  quality: 'high' | 'low';
  cachedUntil: string; // ISO-8601 UTC
  provider?: string; // 'google', 'azure', 'deepl'
  confidence?: number; // 0-1
}

/**
 * Translation Request
 */
export interface TranslationRequest {
  msgId: string;
  msgText: string;
  srcLang?: string; // Auto-detect if not provided
  tgtLang: string; // Target language (ISO 639-1)
}

/**
 * Translation Response
 */
export interface TranslationResponse {
  success: boolean;
  data?: Translation;
  error?: string;
}

/**
 * Offline Outbox Item Contract (v1)
 * Messages queued while offline, synced when connectivity restored
 */
export interface OutboxItem {
  id: string;
  matchId: string;
  content: string;
  messageType?: 'text' | 'image' | 'video';
  attachments?: Array<{
    type: 'image' | 'video' | 'file' | 'voice';
    url: string;
    thumb?: string;
    filename?: string;
    size?: number;
    mimeType?: string;
  }>;
  replyTo?: string;
  timestamp: number; // Unix timestamp (milliseconds)
  retries: number;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  maxRetries?: number; // Default: 5
  nextRetryAt?: number; // Unix timestamp (milliseconds)
}

/**
 * Outbox Sync Request
 */
export interface OutboxSyncRequest {
  items: OutboxItem[];
}

/**
 * Outbox Sync Response
 */
export interface OutboxSyncResponse {
  success: boolean;
  synced: number;
  failed: number;
  results: Array<{
    id: string;
    status: 'sent' | 'failed';
    error?: string;
  }>;
}

/**
 * Message Template Contract (v1)
 * Personal and team templates with variables
 */
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[]; // e.g., ['name', 'petName', 'meetingTime']
  category: 'personal' | 'team' | 'ops';
  version: number;
  createdAt: string; // ISO-8601 UTC
  updatedAt: string; // ISO-8601 UTC
  encrypted?: boolean;
}

/**
 * Create Message Template Request
 */
export interface CreateMessageTemplateRequest {
  name: string;
  content: string;
  variables?: string[];
  category?: 'personal' | 'team' | 'ops';
  encrypted?: boolean;
}

/**
 * Message Template with Variables Rendered
 */
export interface RenderedTemplate {
  templateId: string;
  content: string;
  variables: Record<string, string>;
}

/**
 * Smart Suggestion Contract (v1)
 * AI-powered message suggestions based on conversation context
 */
export interface SmartSuggestion {
  id: string;
  convoId: string;
  text: string;
  relevance: number; // 0-1 semantic similarity
  context?: {
    lastMessage?: string;
    conversationTopic?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
  createdAt: string; // ISO-8601 UTC
}

/**
 * Smart Suggestions Request
 */
export interface SmartSuggestionsRequest {
  convoId: string;
  recentMessages?: number; // Number of recent messages to consider (default: 10)
}

/**
 * Smart Suggestions Response
 */
export interface SmartSuggestionsResponse {
  success: boolean;
  suggestions: SmartSuggestion[];
  relevance?: number; // Average relevance score
}

/**
 * Swipe Premium Feature Contract (v1)
 * Enhanced swipe features for premium users
 */
export interface SwipePremiumAction {
  type: 'rewind' | 'super_like' | 'boost';
  petId?: string; // For rewind
  matchId?: string; // For super_like/boost
  timestamp: number; // Unix timestamp (milliseconds)
}

/**
 * Swipe Premium Usage
 */
export interface SwipePremiumUsage {
  rewindCount: number;
  superLikeCount: number;
  boostCount: number;
  rewindLimit: number; // Daily limit
  superLikeLimit: number; // Daily limit
  boostLimit: number; // Daily limit
  resetAt: string; // ISO-8601 UTC (when limits reset)
}

/**
 * API Response Wrappers
 */
export interface ScheduledMessageResponse {
  success: boolean;
  data?: ScheduledMessage;
  error?: string;
}

export interface ScheduledMessagesListResponse {
  success: boolean;
  data: {
    messages: ScheduledMessage[];
    total: number;
  };
}

export interface MessageTemplateResponse {
  success: boolean;
  data?: MessageTemplate;
  error?: string;
}

export interface MessageTemplatesListResponse {
  success: boolean;
  data: {
    templates: MessageTemplate[];
    total: number;
  };
}

export interface OutboxItemsResponse {
  success: boolean;
  data: {
    items: OutboxItem[];
    total: number;
  };
}

export interface SwipePremiumUsageResponse {
  success: boolean;
  data: SwipePremiumUsage;
}

/**
 * Type Guards
 */
export function isScheduledMessage(obj: unknown): obj is ScheduledMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'convoId' in obj &&
    'senderId' in obj &&
    'scheduledAt' in obj &&
    'status' in obj
  );
}

export function isTranslation(obj: unknown): obj is Translation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'msgId' in obj &&
    'srcLang' in obj &&
    'tgtLang' in obj &&
    'text' in obj
  );
}

export function isOutboxItem(obj: unknown): obj is OutboxItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'matchId' in obj &&
    'content' in obj &&
    'status' in obj &&
    'timestamp' in obj
  );
}

export function isMessageTemplate(obj: unknown): obj is MessageTemplate {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'content' in obj &&
    'category' in obj
  );
}

export function isSmartSuggestion(obj: unknown): obj is SmartSuggestion {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'convoId' in obj &&
    'text' in obj &&
    'relevance' in obj
  );
}

/**
 * Schema Versions
 */
export const PHASE2_CONTRACT_VERSIONS = {
  SCHEDULED_MESSAGE: 'v1',
  TRANSLATION: 'v1',
  OUTBOX_ITEM: 'v1',
  MESSAGE_TEMPLATE: 'v1',
  SMART_SUGGESTION: 'v1',
  SWIPE_PREMIUM: 'v1',
} as const;

