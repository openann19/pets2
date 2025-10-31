/**
 * Adoption Routes
 * Handles adoption process, verification, payments, contracts, and transfers
 */

import { Router } from 'express';
import type { Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  submitBackgroundCheck,
  submitReferenceCheck,
  processAdoptionPayment,
  generateAdoptionContract,
  schedulePickupDelivery,
  transferHealthRecords,
  transferOwnership,
  integratePetInsurance,
} from '../services/adoptionService';
import logger from '../utils/logger';
import type { AuthRequest } from '../types/express';

const router = Router();

/**
 * POST /api/adoption/:applicationId/background-check
 * Submit background check
 */
router.post(
  '/:applicationId/background-check',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { applicationId } = req.params;
      const userId = req.user?._id?.toString() || req.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await submitBackgroundCheck(applicationId, userId);

      res.json({ success: true, data: result });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error submitting background check:', error);
      res.status(500).json({ success: false, error: errorMessage });
    }
  },
);

/**
 * POST /api/adoption/:applicationId/references
 * Submit reference check
 */
router.post('/:applicationId/references', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const reference = req.body;

    if (!reference.name || !reference.email || !reference.type) {
      return res.status(400).json({
        success: false,
        error: 'Reference name, email, and type are required',
      });
    }

    const result = await submitReferenceCheck(applicationId, reference);

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting reference check:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/adoption/:applicationId/payment
 * Process adoption payment
 */
router.post('/:applicationId/payment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const paymentData = req.body;

    if (!paymentData.amount || !paymentData.paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Amount and payment method ID are required',
      });
    }

    const result = await processAdoptionPayment(applicationId, paymentData);

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error processing adoption payment:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/adoption/:applicationId/contract
 * Generate adoption contract
 */
router.post('/:applicationId/contract', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const contractTerms = req.body.contractTerms || req.body;

    const result = await generateAdoptionContract(applicationId, contractTerms);

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error generating adoption contract:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/adoption/:applicationId/schedule
 * Schedule pickup/delivery
 */
router.post('/:applicationId/schedule', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const scheduleData = req.body;

    if (!scheduleData.type || !scheduleData.scheduledDate) {
      return res.status(400).json({
        success: false,
        error: 'Type and scheduled date are required',
      });
    }

    const result = await schedulePickupDelivery(applicationId, {
      ...scheduleData,
      scheduledDate: new Date(scheduleData.scheduledDate),
    });

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error scheduling pickup/delivery:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/adoption/:applicationId/health-records
 * Transfer health records
 */
router.post(
  '/:applicationId/health-records',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { applicationId } = req.params;
      const { records } = req.body;

      if (!records || !Array.isArray(records)) {
        return res.status(400).json({
          success: false,
          error: 'Records array is required',
        });
      }

      const result = await transferHealthRecords(
        applicationId,
        records.map((r: { date: string }) => ({
          ...r,
          date: new Date(r.date),
        })),
      );

      res.json({ success: true, data: result });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error transferring health records:', error);
      res.status(500).json({ success: false, error: errorMessage });
    }
  },
);

/**
 * POST /api/adoption/:applicationId/transfer-ownership
 * Transfer ownership
 */
router.post(
  '/:applicationId/transfer-ownership',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { applicationId } = req.params;

      const result = await transferOwnership(applicationId);

      res.json({ success: true, data: result });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error transferring ownership:', error);
      res.status(500).json({ success: false, error: errorMessage });
    }
  },
);

/**
 * POST /api/adoption/:applicationId/insurance
 * Integrate pet insurance
 */
router.post('/:applicationId/insurance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const insuranceData = req.body;

    if (!insuranceData.provider || !insuranceData.coverageType) {
      return res.status(400).json({
        success: false,
        error: 'Provider and coverage type are required',
      });
    }

    const result = await integratePetInsurance(applicationId, insuranceData);

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error integrating pet insurance:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;
