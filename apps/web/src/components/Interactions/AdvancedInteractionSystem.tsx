/**
 * ADVANCED INTERACTION SYSTEM FOR PET COMMUNITIES
 *
 * A sophisticated social interaction platform with real-time features,
 * advanced commenting, reaction system, mentions, hashtags, and
 * intelligent content moderation.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logger } from '@pawfectmatch/core';

// Interaction Types
export interface Interaction {
  id: string;
  type: InteractionType;
  authorId: string;
  targetId: string;        // Post, comment, or story ID
  targetType: 'post' | 'comment' | 'story' | 'community';
  content?: string;        // For comments and replies
  metadata: InteractionMetadata;
  reactions: Reaction[];
  replies?: Interaction[]; // For threaded comments
  mentions: Mention[];
  hashtags: Hashtag[];
  createdAt: Date;
  updatedAt: Date;
}

export type InteractionType =
  | 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
  | 'comment' | 'reply' | 'share' | 'save' | 'report'
  | 'follow' | 'unfollow' | 'mention' | 'tag';

export interface InteractionMetadata {
  petContext?: PetContext;
  location?: GeoPoint;
  deviceInfo?: DeviceInfo;
  sentiment?: number;       // -1 to 1 (negative to positive)
  toxicity?: number;        // 0 to 1 (safe to toxic)
  spamScore?: number;       // 0 to 1 (legitimate to spam)
  language?: string;
  translation?: {
    originalLanguage: string;
    translatedText: string;
    translator: string;
  };
}

export interface Reaction {
  id: string;
  type: InteractionType;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
}

export interface Mention {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  position: number;         // Character position in text
  length: number;           // Length of mention
}

export interface Hashtag {
  id: string;
  tag: string;
  position: number;
  length: number;
  trending?: boolean;
  trendingScore?: number;
}

export interface PetContext {
  petId?: string;
  petName?: string;
  petBreed?: string;
  petAge?: number;
}

// Real-time Communication Engine
export class RealtimeInteractionEngine {
  private static wsConnection: WebSocket | null = null;
  private static subscribers = new Map<string, Set<(data: any) => void>>();
  private static reconnectAttempts = 0;
  private static readonly MAX_RECONNECT_ATTEMPTS = 5;
  private static readonly RECONNECT_DELAY = 1000; // Start with 1 second

  static connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      try {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/interactions?userId=${userId}`;
        this.wsConnection = new WebSocket(wsUrl);

        this.wsConnection.onopen = () => {
          logger.info('Real-time interaction connection established');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleIncomingMessage(data);
          } catch (error) {
            logger.error('Failed to parse WebSocket message:', error);
          }
        };

        this.wsConnection.onclose = () => {
          logger.info('Real-time interaction connection closed');
          this.attemptReconnect(userId);
        };

        this.wsConnection.onerror = (error) => {
          logger.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  static disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscribers.clear();
  }

  static subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  static sendInteraction(interaction: Partial<Interaction>): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'interaction',
        data: interaction,
      }));
    }
  }

  private static handleIncomingMessage(data: any): void {
    const { type, payload } = data;

    // Notify all subscribers for this event type
    const subscribers = this.subscribers.get(type);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          logger.error('Error in interaction subscriber:', error);
        }
      });
    }
  }

  private static attemptReconnect(userId: string): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    setTimeout(() => {
      logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
      this.connect(userId).catch(error => {
        logger.error('Reconnection failed:', error);
      });
    }, delay);
  }
}

// Advanced Commenting System
export class CommentingEngine {
  private static readonly MAX_COMMENT_DEPTH = 3;
  private static readonly MAX_COMMENT_LENGTH = 1000;
  private static readonly MENTION_REGEX = /@(\w+)/g;
  private static readonly HASHTAG_REGEX = /#(\w+)/g;

  static async createComment(
    targetId: string,
    targetType: Interaction['targetType'],
    content: string,
    authorId: string,
    parentCommentId?: string
  ): Promise<Interaction> {
    // Validate content
    this.validateCommentContent(content);

    // Check depth limit for replies
    if (parentCommentId) {
      await this.validateCommentDepth(targetId, parentCommentId);
    }

    // Parse mentions and hashtags
    const mentions = this.extractMentions(content);
    const hashtags = this.extractHashtags(content);

    // Analyze content for moderation
    const metadata = await this.analyzeContent(content);

    const comment: Interaction = {
      id: generateId(),
      type: parentCommentId ? 'reply' : 'comment',
      authorId,
      targetId,
      targetType,
      content,
      metadata,
      reactions: [],
      mentions,
      hashtags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store comment
    await this.persistComment(comment, parentCommentId);

    // Process mentions and hashtags
    await this.processMentions(mentions, comment);
    await this.processHashtags(hashtags, comment);

    // Send real-time notification
    RealtimeInteractionEngine.sendInteraction(comment);

    return comment;
  }

  static async addReaction(
    targetId: string,
    reactionType: InteractionType,
    authorId: string
  ): Promise<Reaction> {
    const reaction: Reaction = {
      id: generateId(),
      type: reactionType,
      authorId,
      createdAt: new Date(),
    };

    // Add author info
    const authorInfo = await this.getAuthorInfo(authorId);
    reaction.authorName = authorInfo.displayName;
    reaction.authorAvatar = authorInfo.avatar;

    await this.persistReaction(targetId, reaction);

    // Send real-time update
    RealtimeInteractionEngine.sendInteraction({
      type: 'reaction_added',
      targetId,
      reaction,
    });

    return reaction;
  }

  private static validateCommentContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment cannot be empty');
    }

    if (content.length > this.MAX_COMMENT_LENGTH) {
      throw new Error(`Comment too long (max ${this.MAX_COMMENT_LENGTH} characters)`);
    }

    // Check for prohibited content
    if (this.containsProhibitedContent(content)) {
      throw new Error('Comment contains prohibited content');
    }
  }

  private static async validateCommentDepth(targetId: string, parentCommentId: string): Promise<void> {
    const depth = await this.calculateCommentDepth(targetId, parentCommentId);

    if (depth >= this.MAX_COMMENT_DEPTH) {
      throw new Error('Maximum reply depth reached');
    }
  }

  private static extractMentions(content: string): Mention[] {
    const mentions: Mention[] = [];
    let match;

    while ((match = this.MENTION_REGEX.exec(content)) !== null) {
      const username = match[1];
      // In a real app, you'd look up the user ID from username
      const userId = `user_${username}`; // Placeholder

      mentions.push({
        id: generateId(),
        userId,
        username,
        displayName: username, // Would fetch from user service
        position: match.index,
        length: match[0].length,
      });
    }

    return mentions;
  }

  private static extractHashtags(content: string): Hashtag[] {
    const hashtags: Hashtag[] = [];
    let match;

    while ((match = this.HASHTAG_REGEX.exec(content)) !== null) {
      const tag = match[1];

      hashtags.push({
        id: generateId(),
        tag: tag.toLowerCase(),
        position: match.index,
        length: match[0].length,
      });
    }

    return hashtags;
  }

  private static async analyzeContent(content: string): Promise<InteractionMetadata> {
    // AI-powered content analysis
    const analysis = await this.performContentAnalysis(content);

    return {
      sentiment: analysis.sentiment,
      toxicity: analysis.toxicity,
      spamScore: analysis.spamScore,
      language: analysis.language,
    };
  }

  private static containsProhibitedContent(content: string): boolean {
    const prohibitedWords = ['spam', 'offensive', 'prohibited']; // Would be more comprehensive
    return prohibitedWords.some(word => content.toLowerCase().includes(word));
  }

  private static async calculateCommentDepth(targetId: string, parentCommentId: string): Promise<number> {
    // Calculate nesting depth
    let depth = 1;
    let currentId = parentCommentId;

    while (currentId) {
      const parent = await this.getCommentParent(currentId);
      if (!parent) break;

      depth++;
      currentId = parent.id;
    }

    return depth;
  }

  private static async processMentions(mentions: Mention[], comment: Interaction): Promise<void> {
    for (const mention of mentions) {
      // Send notification to mentioned user
      await this.sendMentionNotification(mention, comment);

      // Update user's mention count/activity
      await this.updateUserMentionStats(mention.userId);
    }
  }

  private static async processHashtags(hashtags: Hashtag[], comment: Interaction): Promise<void> {
    for (const hashtag of hashtags) {
      // Update hashtag trending score
      await this.updateHashtagTrendingScore(hashtag.tag);

      // Index for search
      await this.indexHashtagForSearch(hashtag, comment);
    }
  }

  // Database and external service methods (implement with actual services)
  private static async persistComment(comment: Interaction, parentCommentId?: string): Promise<void> {}
  private static async persistReaction(targetId: string, reaction: Reaction): Promise<void> {}
  private static async performContentAnalysis(content: string): Promise<any> { return {}; }
  private static async getCommentParent(commentId: string): Promise<Interaction | null> { return null; }
  private static async getAuthorInfo(authorId: string): Promise<{ displayName: string; avatar?: string }> { return { displayName: 'User' }; }
  private static async sendMentionNotification(mention: Mention, comment: Interaction): Promise<void> {}
  private static async updateUserMentionStats(userId: string): Promise<void> {}
  private static async updateHashtagTrendingScore(tag: string): Promise<void> {}
  private static async indexHashtagForSearch(hashtag: Hashtag, comment: Interaction): Promise<void> {}
}

// Reaction System
export class ReactionEngine {
  private static readonly AVAILABLE_REACTIONS: InteractionType[] = [
    'like', 'love', 'laugh', 'wow', 'sad', 'angry'
  ];

  private static readonly REACTION_EMOJIS: Record<InteractionType, string> = {
    like: '👍',
    love: '❤️',
    laugh: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠',
  };

  static getAvailableReactions(): Array<{ type: InteractionType; emoji: string; label: string }> {
    return this.AVAILABLE_REACTIONS.map(type => ({
      type,
      emoji: this.REACTION_EMOJIS[type],
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }));
  }

  static getReactionEmoji(type: InteractionType): string {
    return this.REACTION_EMOJIS[type] || '👍';
  }

  static async toggleReaction(
    targetId: string,
    reactionType: InteractionType,
    authorId: string
  ): Promise<{ added: boolean; reaction?: Reaction }> {
    const existingReaction = await this.getUserReaction(targetId, authorId, reactionType);

    if (existingReaction) {
      // Remove reaction
      await this.removeReaction(existingReaction.id);
      return { added: false };
    } else {
      // Add reaction
      const reaction = await this.addReaction(targetId, reactionType, authorId);
      return { added: true, reaction };
    }
  }

  private static async getUserReaction(
    targetId: string,
    authorId: string,
    reactionType: InteractionType
  ): Promise<Reaction | null> {
    // Query database for existing reaction
    return null; // Placeholder
  }

  private static async addReaction(
    targetId: string,
    reactionType: InteractionType,
    authorId: string
  ): Promise<Reaction> {
    const reaction = await CommentingEngine.addReaction(targetId, reactionType, authorId);

    // Update reaction counts
    await this.updateReactionCounts(targetId);

    return reaction;
  }

  private static async removeReaction(reactionId: string): Promise<void> {
    // Remove from database
    await this.updateReactionCountsForRemoval(reactionId);
  }

  private static async updateReactionCounts(targetId: string): Promise<void> {
    // Update cached reaction counts
  }

  private static async updateReactionCountsForRemoval(reactionId: string): Promise<void> {
    // Update cached reaction counts after removal
  }
}

// React Hooks for Interactions
export const useRealtimeInteractions = (userId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        setConnectionStatus('connecting');
        await RealtimeInteractionEngine.connect(userId);
        if (mounted) {
          setIsConnected(true);
          setConnectionStatus('connected');
        }
      } catch (error) {
        if (mounted) {
          setConnectionStatus('error');
          logger.error('Failed to connect to real-time interactions:', error);
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      RealtimeInteractionEngine.disconnect();
    };
  }, [userId]);

  return { isConnected, connectionStatus };
};

export const useInteractions = (targetId: string, targetType: Interaction['targetType']) => {
  return useQuery({
    queryKey: ['interactions', targetId, targetType],
    queryFn: () => CommentingEngine.getInteractions(targetId, targetType),
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetId,
      targetType,
      content,
      parentCommentId
    }: {
      targetId: string;
      targetType: Interaction['targetType'];
      content: string;
      parentCommentId?: string;
    }) =>
      CommentingEngine.createComment(targetId, targetType, content, 'current-user', parentCommentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
};

export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetId,
      reactionType
    }: {
      targetId: string;
      reactionType: InteractionType;
    }) =>
      ReactionEngine.toggleReaction(targetId, reactionType, 'current-user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });
};

export const useMentions = (searchQuery: string) => {
  return useQuery({
    queryKey: ['mentions', searchQuery],
    queryFn: () => CommentingEngine.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
  });
};

export const useHashtags = (searchQuery: string) => {
  return useQuery({
    queryKey: ['hashtags', searchQuery],
    queryFn: () => CommentingEngine.searchHashtags(searchQuery),
    enabled: searchQuery.length >= 1,
  });
};

// Advanced Commenting Component
export const AdvancedCommentSection = ({
  targetId,
  targetType,
  maxDepth = 3
}: {
  targetId: string;
  targetType: Interaction['targetType'];
  maxDepth?: number;
}) => {
  const { data: interactions } = useInteractions(targetId, targetType);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [showReactions, setShowReactions] = useState(false);

  const comments = interactions?.filter(i => i.type === 'comment') || [];
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'popular':
          return (b.reactions?.length || 0) - (a.reactions?.length || 0);
        default:
          return 0;
      }
    });
  }, [comments, sortBy]);

  return (
    <div className="advanced-comment-section">
      <CommentSectionHeader
        commentCount={comments.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <CommentComposer targetId={targetId} targetType={targetType} />

      <div className="comments-list">
        {sortedComments.map(comment => (
          <ThreadedComment
            key={comment.id}
            comment={comment}
            maxDepth={maxDepth}
            targetType={targetType}
          />
        ))}
      </div>
    </div>
  );
};

// Threaded Comment Component
export const ThreadedComment = ({
  comment,
  maxDepth,
  targetType,
  depth = 0
}: {
  comment: Interaction;
  maxDepth: number;
  targetType: Interaction['targetType'];
  depth?: number;
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const toggleReaction = useToggleReaction();

  const handleReaction = useCallback(async (reactionType: InteractionType) => {
    await toggleReaction.mutateAsync({
      targetId: comment.id,
      reactionType,
    });
    setShowReactions(false);
  }, [comment.id, toggleReaction]);

  const canReply = depth < maxDepth;

  return (
    <div className={`threaded-comment depth-${depth}`}>
      <div className="comment-content">
        <CommentHeader comment={comment} />
        <CommentBody comment={comment} />
        <CommentActions
          comment={comment}
          onReply={() => setShowReplyForm(!showReplyForm)}
          onShowReactions={() => setShowReactions(!showReactions)}
          canReply={canReply}
        />

        {showReactions && (
          <ReactionPicker
            onSelectReaction={handleReaction}
            onClose={() => setShowReactions(false)}
          />
        )}

        {showReplyForm && canReply && (
          <CommentComposer
            targetId={comment.targetId}
            targetType={targetType}
            parentCommentId={comment.id}
            onCommentPosted={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
          />
        )}
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <ThreadedComment
              key={reply.id}
              comment={reply}
              maxDepth={maxDepth}
              targetType={targetType}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Comment Composer with Mentions and Hashtags
export const CommentComposer = ({
  targetId,
  targetType,
  parentCommentId,
  onCommentPosted,
  placeholder = "Write a comment..."
}: CommentComposerProps) => {
  const [content, setContent] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const createComment = useCreateComment();
  const { data: mentionSuggestions } = useMentions(mentionQuery);
  const { data: hashtagSuggestions } = useHashtags(hashtagQuery);

  const handleInputChange = useCallback((value: string) => {
    setContent(value);

    // Check for mention or hashtag triggers
    const lastAtIndex = value.lastIndexOf('@', cursorPosition);
    const lastHashIndex = value.lastIndexOf('#', cursorPosition);

    if (lastAtIndex > lastHashIndex && lastAtIndex >= 0) {
      const query = value.substring(lastAtIndex + 1, cursorPosition);
      if (query.length >= 2) {
        setMentionQuery(query);
        setHashtagQuery('');
        setShowSuggestions(true);
      }
    } else if (lastHashIndex >= 0) {
      const query = value.substring(lastHashIndex + 1, cursorPosition);
      if (query.length >= 1) {
        setHashtagQuery(query);
        setMentionQuery('');
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [cursorPosition]);

  const handleSuggestionSelect = useCallback((suggestion: string, type: 'mention' | 'hashtag') => {
    const trigger = type === 'mention' ? '@' : '#';
    const lastTriggerIndex = content.lastIndexOf(trigger, cursorPosition);

    if (lastTriggerIndex >= 0) {
      const before = content.substring(0, lastTriggerIndex + 1);
      const after = content.substring(cursorPosition);
      const newContent = before + suggestion + ' ' + after;

      setContent(newContent);
      setShowSuggestions(false);
      setCursorPosition(lastTriggerIndex + suggestion.length + 2);
    }
  }, [content, cursorPosition]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;

    await createComment.mutateAsync({
      targetId,
      targetType,
      content,
      parentCommentId,
    });

    setContent('');
    onCommentPosted?.();
  }, [content, targetId, targetType, parentCommentId, createComment, onCommentPosted]);

  return (
    <div className="comment-composer">
      <div className="composer-input-container">
        <textarea
          value={content}
          onChange={(e) => handleInputChange(e.target.value)}
          onSelect={(e) => setCursorPosition(e.target.selectionStart)}
          placeholder={placeholder}
          className="composer-input"
          rows={3}
        />

        {showSuggestions && (
          <SuggestionDropdown
            suggestions={mentionQuery ? mentionSuggestions : hashtagSuggestions}
            type={mentionQuery ? 'mention' : 'hashtag'}
            onSelect={handleSuggestionSelect}
          />
        )}
      </div>

      <div className="composer-actions">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || createComment.isPending}
          className="submit-comment-button"
        >
          {createComment.isPending ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
};

// Reaction Picker Component
export const ReactionPicker = ({
  onSelectReaction,
  onClose
}: {
  onSelectReaction: (type: InteractionType) => void;
  onClose: () => void;
}) => {
  const reactions = ReactionEngine.getAvailableReactions();

  return (
    <div className="reaction-picker">
      <div className="reaction-picker-header">
        <span>React to this</span>
        <button onClick={onClose}>×</button>
      </div>

      <div className="reaction-buttons">
        {reactions.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => onSelectReaction(type)}
            className="reaction-button"
            title={label}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper Components
const CommentSectionHeader = ({
  commentCount,
  sortBy,
  onSortChange
}: {
  commentCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
}) => (
  <div className="comment-section-header">
    <h3>{commentCount} Comments</h3>
    <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="popular">Most Liked</option>
    </select>
  </div>
);

const CommentHeader = ({ comment }: { comment: Interaction }) => (
  <div className="comment-header">
    <img src={comment.authorAvatar || '/default-avatar.jpg'} alt="Author" className="author-avatar" />
    <div className="author-info">
      <span className="author-name">{comment.authorName}</span>
      <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
    </div>
  </div>
);

const CommentBody = ({ comment }: { comment: Interaction }) => (
  <div className="comment-body">
    {comment.content && <p>{renderContentWithMentions(comment.content, comment.mentions)}</p>}
  </div>
);

const CommentActions = ({
  comment,
  onReply,
  onShowReactions,
  canReply
}: {
  comment: Interaction;
  onReply: () => void;
  onShowReactions: () => void;
  canReply: boolean;
}) => (
  <div className="comment-actions">
    <button onClick={onShowReactions} className="reaction-toggle">
      👍 {comment.reactions.length}
    </button>

    {canReply && (
      <button onClick={onReply} className="reply-button">
        Reply
      </button>
    )}

    <button className="more-actions">⋯</button>
  </div>
);

const SuggestionDropdown = ({
  suggestions,
  type,
  onSelect
}: {
  suggestions?: any[];
  type: 'mention' | 'hashtag';
  onSelect: (suggestion: string, type: 'mention' | 'hashtag') => void;
}) => (
  <div className="suggestion-dropdown">
    {suggestions?.slice(0, 5).map((suggestion, index) => (
      <div
        key={index}
        className="suggestion-item"
        onClick={() => onSelect(
          type === 'mention' ? suggestion.username : suggestion.tag,
          type
        )}
      >
        {type === 'mention' ? (
          <>
            <img src={suggestion.avatar} alt={suggestion.username} />
            <span>{suggestion.displayName} (@{suggestion.username})</span>
          </>
        ) : (
          <span>#{suggestion.tag}</span>
        )}
      </div>
    ))}
  </div>
);

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

function renderContentWithMentions(content: string, mentions: Mention[]): React.ReactNode {
  if (!mentions.length) return content;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  mentions.forEach(mention => {
    // Add text before mention
    if (mention.position > lastIndex) {
      parts.push(content.substring(lastIndex, mention.position));
    }

    // Add mention link
    parts.push(
      <a key={mention.id} href={`/user/${mention.userId}`} className="mention">
        @{mention.displayName}
      </a>
    );

    lastIndex = mention.position + mention.length;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts;
}

// Extend CommentingEngine with query methods
Object.assign(CommentingEngine, {
  async getInteractions(targetId: string, targetType: Interaction['targetType']): Promise<Interaction[]> {
    // Query database for interactions
    return [];
  },

  async searchUsers(query: string): Promise<any[]> {
    // Search users for mentions
    return [];
  },

  async searchHashtags(query: string): Promise<any[]> {
    // Search hashtags
    return [];
  },
});

// Type definitions
interface CommentComposerProps {
  targetId: string;
  targetType: Interaction['targetType'];
  parentCommentId?: string;
  onCommentPosted?: () => void;
  placeholder?: string;
}

interface GeoPoint {
  lat: number;
  lng: number;
}

interface DeviceInfo {
  deviceModel: string;
  osVersion: string;
  appVersion: string;
}
