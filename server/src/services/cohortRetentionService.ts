/**
 * Cohort Retention Service
 * Calculates user retention by signup cohort
 */

import User from '../models/User';
import logger from '../utils/logger';

export interface RetentionData {
  cohort: string; // e.g., "2024-01"
  totalUsers: number;
  week1: number; // percentage retained
  week2: number;
  week4: number;
  month2: number;
  month3: number;
  month6: number;
  month12: number;
}

export interface CohortRetentionData {
  cohorts: RetentionData[];
  averageRetention: {
    week1: number;
    week2: number;
    week4: number;
    month2: number;
    month3: number;
    month6: number;
    month12: number;
  };
  latestCohortSize: number;
}

class CohortRetentionService {
  /**
   * Calculate retention for a specific cohort
   * @param cohortStartDate - Start date of the cohort
   * @param cohortEndDate - End date of the cohort
   * @param cohortLabel - Label for the cohort (e.g., "2024-01")
   */
  async calculateCohortRetention(
    cohortStartDate: Date,
    cohortEndDate: Date,
    cohortLabel: string
  ): Promise<RetentionData> {
    try {
      // Get total users in cohort
      const totalUsers = await User.countDocuments({
        createdAt: {
          $gte: cohortStartDate,
          $lt: cohortEndDate
        }
      });

      if (totalUsers === 0) {
        return {
          cohort: cohortLabel,
          totalUsers: 0,
          week1: 0,
          week2: 0,
          week4: 0,
          month2: 0,
          month3: 0,
          month6: 0,
          month12: 0
        };
      }

      const now = new Date();
      const cohortAge = now.getTime() - cohortStartDate.getTime();
      const cohortAgeDays = Math.floor(cohortAge / (24 * 60 * 60 * 1000));

      // Calculate retention at different time points
      const calculateRetention = async (daysAfterCohort: number): Promise<number> => {
        if (cohortAgeDays < daysAfterCohort) {
          return 0; // Cohort too new for this retention period
        }

        const retentionDate = new Date(cohortStartDate);
        retentionDate.setDate(retentionDate.getDate() + daysAfterCohort);

        // Users who were active after the retention date
        const activeUsers = await User.countDocuments({
          createdAt: {
            $gte: cohortStartDate,
            $lt: cohortEndDate
          },
          $or: [
            { lastLoginAt: { $gte: retentionDate } },
            { 'analytics.lastActive': { $gte: retentionDate } }
          ]
        });

        return totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
      };

      // Calculate retention for each period
      const week1 = await calculateRetention(7);
      const week2 = await calculateRetention(14);
      const week4 = await calculateRetention(28);
      const month2 = await calculateRetention(60);
      const month3 = await calculateRetention(90);
      const month6 = await calculateRetention(180);
      const month12 = await calculateRetention(365);

      return {
        cohort: cohortLabel,
        totalUsers,
        week1: Number(week1.toFixed(1)),
        week2: Number(week2.toFixed(1)),
        week4: Number(week4.toFixed(1)),
        month2: Number(month2.toFixed(1)),
        month3: Number(month3.toFixed(1)),
        month6: Number(month6.toFixed(1)),
        month12: Number(month12.toFixed(1))
      };
    } catch (error) {
      logger.error('Error calculating cohort retention', { error, cohortLabel });
      throw error;
    }
  }

  /**
   * Get retention data for multiple cohorts
   * @param numberOfCohorts - Number of cohorts to analyze (default: 6)
   */
  async getCohortRetentionData(numberOfCohorts: number = 6): Promise<CohortRetentionData> {
    try {
      const cohorts: RetentionData[] = [];
      const now = new Date();

      // Generate cohorts (monthly by default)
      for (let i = 0; i < numberOfCohorts; i++) {
        const cohortEndDate = new Date(now);
        cohortEndDate.setMonth(cohortEndDate.getMonth() - i);
        cohortEndDate.setDate(1);
        cohortEndDate.setHours(0, 0, 0, 0);

        const cohortStartDate = new Date(cohortEndDate);
        cohortStartDate.setMonth(cohortStartDate.getMonth() - 1);

        const year = cohortStartDate.getFullYear();
        const month = String(cohortStartDate.getMonth() + 1).padStart(2, '0');
        const cohortLabel = `${year}-${month}`;

        const retention = await this.calculateCohortRetention(
          cohortStartDate,
          cohortEndDate,
          cohortLabel
        );

        cohorts.push(retention);
      }

      // Calculate average retention
      const calculateAverage = (period: keyof Omit<RetentionData, 'cohort' | 'totalUsers'>): number => {
        const values = cohorts
          .filter(c => c.totalUsers > 0)
          .map(c => c[period])
          .filter(v => v > 0);

        if (values.length === 0) return 0;
        const sum = values.reduce((a, b) => a + b, 0);
        return Number((sum / values.length).toFixed(1));
      };

      const latestCohortSize = cohorts[0]?.totalUsers || 0;

      return {
        cohorts: cohorts.reverse(), // Oldest first
        averageRetention: {
          week1: calculateAverage('week1'),
          week2: calculateAverage('week2'),
          week4: calculateAverage('week4'),
          month2: calculateAverage('month2'),
          month3: calculateAverage('month3'),
          month6: calculateAverage('month6'),
          month12: calculateAverage('month12')
        },
        latestCohortSize
      };
    } catch (error) {
      logger.error('Error getting cohort retention data', { error });
      throw error;
    }
  }

  /**
   * Get retention for specific time period
   * @param daysAfterSignup - Days after signup to check retention
   */
  async getRetentionAtTimePoint(daysAfterSignup: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAfterSignup);

      const usersAtTime = await User.countDocuments({
        createdAt: { $lte: cutoffDate }
      });

      if (usersAtTime === 0) return 0;

      const activeUsers = await User.countDocuments({
        createdAt: { $lte: cutoffDate },
        $or: [
          { lastLoginAt: { $gte: cutoffDate } },
          { 'analytics.lastActive': { $gte: cutoffDate } }
        ]
      });

      return Number(((activeUsers / usersAtTime) * 100).toFixed(2));
    } catch (error) {
      logger.error('Error calculating retention at time point', { error, daysAfterSignup });
      throw error;
    }
  }
}

export default new CohortRetentionService();
