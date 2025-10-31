/**
 * Advanced Match Filter Controller
 * Phase 1 Product Enhancement - Matches Screen
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import {
  filterMatches,
  getMatchInsights as getInsights,
} from '../services/advancedMatchFilterService';
import type { AdvancedMatchFilter } from '@pawfectmatch/core/types/phase1-contracts';
import logger from '../utils/logger';

interface FilterMatchesRequest extends AuthRequest {
  query: {
    page?: string;
    limit?: string;
    sort?: string;
    search?: string;
    minDistance?: string;
    maxDistance?: string;
    minAge?: string;
    maxAge?: string;
    species?: string;
    breeds?: string;
    sizes?: string;
    energyLevels?: string;
    genders?: string;
    activityStatus?: string;
    userLat?: string;
    userLng?: string;
  };
}

/**
 * @desc    Filter matches with advanced options
 * @route   GET /api/matches/filter
 * @access  Private
 */
export const filterMatchesController = async (
  req: FilterMatchesRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Build filter from query params
    const filter: AdvancedMatchFilter = {
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
      sort: req.query.sort as any,
      search: req.query.search,
    };

    // Distance filter
    if (req.query.minDistance || req.query.maxDistance || (req.query.userLat && req.query.userLng)) {
      filter.distance = {};
      if (req.query.minDistance) {
        filter.distance.minKm = parseFloat(req.query.minDistance);
      }
      if (req.query.maxDistance) {
        filter.distance.maxKm = parseFloat(req.query.maxDistance);
      }
      if (req.query.userLat && req.query.userLng) {
        filter.distance.userLocation = {
          lat: parseFloat(req.query.userLat),
          lng: parseFloat(req.query.userLng),
        };
      }
    }

    // Age filter
    if (req.query.minAge || req.query.maxAge) {
      filter.age = {};
      if (req.query.minAge) {
        filter.age.min = parseInt(req.query.minAge, 10);
      }
      if (req.query.maxAge) {
        filter.age.max = parseInt(req.query.maxAge, 10);
      }
    }

    // Pet preferences filter
    if (
      req.query.species ||
      req.query.breeds ||
      req.query.sizes ||
      req.query.energyLevels ||
      req.query.genders
    ) {
      filter.petPreferences = {};
      if (req.query.species) {
        filter.petPreferences.species = req.query.species.split(',');
      }
      if (req.query.breeds) {
        filter.petPreferences.breeds = req.query.breeds.split(',');
      }
      if (req.query.sizes) {
        filter.petPreferences.sizes = req.query.sizes.split(',') as any;
      }
      if (req.query.energyLevels) {
        filter.petPreferences.energyLevels = req.query.energyLevels.split(',') as any;
      }
      if (req.query.genders) {
        filter.petPreferences.genders = req.query.genders.split(',') as any;
      }
    }

    // Activity status
    if (req.query.activityStatus) {
      filter.activityStatus = req.query.activityStatus as any;
    }

    const result = await filterMatches(userId, filter);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Failed to filter matches', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to filter matches',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

interface GetMatchInsightsRequest extends AuthRequest {
  params: {
    matchId: string;
  };
}

/**
 * @desc    Get match insights (compatibility analysis)
 * @route   GET /api/matches/:matchId/insights
 * @access  Private
 */
export const getMatchInsights = async (
  req: GetMatchInsightsRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { matchId } = req.params;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const result = await getInsights(userId, matchId);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Failed to get match insights', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
      matchId: req.params.matchId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get match insights',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

