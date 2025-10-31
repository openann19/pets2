/**
 * PET-AWARE CHAT ENHANCEMENTS
 * Building on existing chat architecture to add pet-first features
 */

import type { Message, Pet } from './index';

// Extend existing chat types in packages/core/src/types/models.ts
export interface PetAwareMessage extends Message {
  // Pet-aware extensions
  petContext?: {
    petId: string;
    petName: string;
    action: 'playdate_proposal' | 'vet_share' | 'behavior_note' | 'health_update';
  };

  // Play-date planning
  playdateProposal?: {
    proposedAt: string;
    venueId?: string;
    duration?: number;
    notes?: string;
    status: 'proposed' | 'accepted' | 'declined' | 'confirmed';
  };

  // Vet record sharing
  vetShare?: {
    recordType: 'vaccine' | 'medication' | 'exam' | 'condition';
    recordId: string;
    shareExpiresAt?: string; // Temporary sharing
    accessCode?: string; // For secure access
  };

  // Behavioral context
  behaviorNote?: {
    context: 'playful' | 'anxious' | 'protective' | 'shy' | 'energetic';
    description: string;
    severity: 'low' | 'medium' | 'high';
  };
}

export interface ChatContext {
  pets: {
    userPet: Pet;
    otherPet: Pet;
  };
  compatibility: {
    score: number;
    factors: string[];
  };
  lastActivity: {
    type: 'playdate' | 'meetup' | 'message';
    timestamp: string;
    location?: string;
  };
}

// Extend existing chat hooks to be pet-aware
// Add to apps/mobile/src/hooks/chat/usePetAwareChat.ts
