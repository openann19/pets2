/**
 * Content Moderation Controller
 * Backend controller for AI content filtering and safety
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import Match from '../models/Match';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface CheckContentRequest extends AuthenticatedRequest {
  body: {
    content: string;
  };
}

interface ReportContentRequest extends AuthenticatedRequest {
  body: {
    matchId: string;
    messageId: string;
    reason: 'inappropriate' | 'spam' | 'harassment' | 'unsafe' | 'other';
    description?: string;
  };
}

interface GetEmergencyContactsRequest extends AuthenticatedRequest {
  query: {
    latitude: string;
    longitude: string;
  };
}

/**
 * @desc    Check if message content is safe
 * @route   POST /api/chat/moderation/check
 * @access  Private
 */
export const checkContentSafety = async (
  req: CheckContentRequest,
  res: Response,
): Promise<void> => {
  try {
    const { content } = req.body;

    // Basic content filtering (in production, use AI/ML service)
    const unsafeKeywords = [
      'scam',
      'fraud',
      'suspicious',
      // Add more keywords as needed
    ];

    const hasUnsafeKeywords = unsafeKeywords.some((keyword) =>
      content.toLowerCase().includes(keyword),
    );

    // Check for pet safety violations
    const petSafetyViolations = [
      'abuse',
      'neglect',
      'harm',
      // Add more as needed
    ];

    const hasPetSafetyViolations = petSafetyViolations.some((violation) =>
      content.toLowerCase().includes(violation),
    );

    let isSafe = true;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let reason: string | undefined;

    if (hasPetSafetyViolations) {
      isSafe = false;
      severity = 'critical';
      reason = 'Content may indicate pet safety concerns';
    } else if (hasUnsafeKeywords) {
      isSafe = false;
      severity = 'high';
      reason = 'Content contains potentially unsafe language';
    }

    res.json({
      success: true,
      data: {
        isSafe,
        severity,
        reason,
        suggestions: !isSafe
          ? ['Please review your message and ensure it follows community guidelines']
          : undefined,
      },
    });
  } catch (error) {
    logger.error('Check content safety error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to check content safety',
    });
  }
};

/**
 * @desc    Report inappropriate content
 * @route   POST /api/chat/moderation/report
 * @access  Private
 */
export const reportContent = async (
  req: ReportContentRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId, messageId, reason, description } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied',
      });
      return;
    }

    // In production, store report in moderation queue
    logger.warn('Content reported', {
      userId: req.userId,
      matchId,
      messageId,
      reason,
      description,
    });

    // Send notification to moderators
    // await notifyModerators({ matchId, messageId, reason, reportedBy: req.userId });

    res.json({
      success: true,
      message: 'Report submitted successfully. Our team will review it.',
    });
  } catch (error) {
    logger.error('Report content error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
    });
  }
};

/**
 * @desc    Get pet safety guidelines
 * @route   GET /api/chat/moderation/guidelines
 * @access  Private
 */
export const getSafetyGuidelines = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const guidelines = [
      {
        title: 'First Meetup Safety',
        description:
          'Always meet in a public place for the first time. Bring a friend if possible and let someone know where you are.',
        category: 'first_meetup' as const,
      },
      {
        title: 'Pet Introduction',
        description:
          'Introduce pets slowly and in a neutral location. Watch for signs of stress or aggression.',
        category: 'pets' as const,
      },
      {
        title: 'Location Safety',
        description:
          'Choose well-lit, pet-friendly locations. Avoid isolated areas, especially for first meetups.',
        category: 'location' as const,
      },
      {
        title: 'Emergency Preparedness',
        description:
          'Keep emergency contacts handy, including local animal control and vet emergency services.',
        category: 'emergency' as const,
      },
      {
        title: 'Trust Your Instincts',
        description:
          'If something feels off, trust your instincts and reschedule or cancel the meetup.',
        category: 'general' as const,
      },
      {
        title: 'Pet Health',
        description:
          'Ensure pets are up-to-date on vaccinations before meetups. Share health records if comfortable.',
        category: 'pets' as const,
      },
    ];

    res.json({
      success: true,
      data: { guidelines },
    });
  } catch (error) {
    logger.error('Get safety guidelines error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get safety guidelines',
    });
  }
};

/**
 * @desc    Get emergency contacts for location
 * @route   GET /api/chat/moderation/emergency-contacts
 * @access  Private
 */
export const getEmergencyContacts = async (
  req: GetEmergencyContactsRequest,
  res: Response,
): Promise<void> => {
  try {
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);

    // In production, integrate with local emergency services API
    const contacts = [
      {
        type: 'animal_control' as const,
        name: 'Local Animal Control',
        phone: '911',
        address: 'Contact local authorities',
        distance: 0,
      },
      {
        type: 'vet_emergency' as const,
        name: '24/7 Emergency Vet',
        phone: '(555) 123-4567',
        address: '123 Emergency St',
        distance: 2.5,
      },
      {
        type: 'pet_hospital' as const,
        name: 'Pet Emergency Hospital',
        phone: '(555) 987-6543',
        address: '456 Animal Ave',
        distance: 5.2,
      },
    ];

    res.json({
      success: true,
      data: { contacts },
    });
  } catch (error) {
    logger.error('Get emergency contacts error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get emergency contacts',
    });
  }
};

