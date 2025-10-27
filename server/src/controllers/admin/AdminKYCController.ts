/**
 * Admin KYC Management Controller for PawfectMatch
 * Handles identity verification and compliance management
 */

import type { Request, Response } from 'express';
import Verification from '../../models/Verification';
import User from '../../models/User';
import { logAdminActivity } from '../../middleware/adminLogger';
const logger = require('../../utils/logger');

// Type definitions
interface AdminRequest extends Request {
  userId?: string;
}

interface GetKYCVerificationsQuery {
  status?: string;
  type?: string;
  priority?: string;
  country?: string;
  search?: string;
  page?: string;
  limit?: string;
}

interface ReviewKYCVerificationBody {
  status: 'approved' | 'rejected';
  notes?: string;
  reviewedBy?: string;
}

interface RequestAdditionalDocumentsBody {
  documentTypes: string[];
  message?: string;
}

/**
 * Get KYC statistics and overview
 */
export const getKYCStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    // Get real verification statistics
    const totalVerifications = await Verification.countDocuments();
    const pendingReview = await Verification.countDocuments({ status: 'pending' });
    const approved = await Verification.countDocuments({ status: 'approved' });
    const rejected = await Verification.countDocuments({ status: 'rejected' });
    
    // Get expired verifications
    const now = new Date();
    const expired = await Verification.countDocuments({ expiresAt: { $lt: now } });

    // Calculate average processing time
    const approvedVerifications = await Verification.find({ status: 'approved' })
      .select('submittedAt reviewedAt')
      .lean();

    const processingTimes = approvedVerifications
      .map((v: any) => {
        const submitted = new Date(v.submittedAt).getTime();
        const reviewed = new Date(v.reviewedAt || v.updatedAt).getTime();
        return (reviewed - submitted) / (1000 * 60 * 60 * 24); // Convert to days
      })
      .filter((time: number) => time > 0 && time < 365); // Filter outliers

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    // Calculate compliance rate
    const complianceRate = totalVerifications > 0 
      ? ((approved / totalVerifications) * 100).toFixed(1)
      : 0;

    // Get risk distribution based on verification type
    const riskStats = await Verification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // Map verification types to risk levels
    const riskDistribution = {
      low: riskStats.filter(r => ['identity', 'pet_ownership'].includes(r._id))
        .reduce((sum, r) => sum + r.count, 0),
      medium: riskStats.filter(r => ['veterinary'].includes(r._id))
        .reduce((sum, r) => sum + r.count, 0),
      high: riskStats.filter(r => ['rescue_organization'].includes(r._id))
        .reduce((sum, r) => sum + r.count, 0),
      critical: 0 // Would be flagged manually
    };

    // Get country distribution from personal info
    const countryStats = await Verification.aggregate([
      { $match: { 'personalInfo.address.country': { $exists: true } } },
      {
        $group: {
          _id: '$personalInfo.address.country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const countryDistribution = countryStats.map((stat: any) => ({
      country: stat._id,
      count: stat.count
    }));

    // Get document type distribution
    const allVerifications = await Verification.find()
      .select('documents type')
      .lean();

    const docTypeCounts: Record<string, { count: number; success: number; total: number }> = {};
    
    allVerifications.forEach((v: any) => {
      v.documents.forEach((doc: any) => {
        if (!docTypeCounts[doc.type]) {
          docTypeCounts[doc.type] = { count: 0, success: 0, total: 0 };
        }
        docTypeCounts[doc.type].count++;
        docTypeCounts[doc.type].total++;
        
        if (v.status === 'approved') {
          docTypeCounts[doc.type].success++;
        }
      });
    });

    const documentTypes = Object.entries(docTypeCounts).map(([type, data]) => ({
      type: type.replace(/_/g, ' '),
      count: data.count,
      successRate: ((data.success / data.total) * 100).toFixed(1)
    }));

    const stats = {
      totalVerifications,
      pendingReview,
      approved,
      rejected,
      expired,
      averageProcessingTime: parseFloat(averageProcessingTime.toFixed(1)),
      complianceRate: parseFloat(complianceRate),
      riskDistribution,
      countryDistribution,
      documentTypes
    };

    await logAdminActivity(req, 'VIEW_KYC_STATS', { statsRequested: true }, true);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logger.error('Failed to fetch KYC stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC statistics',
      message: error.message
    });
  }
};

/**
 * Get list of KYC verifications
 */
export const getKYCVerifications = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { status, type, priority, country, search, page = '1', limit = '20' } = req.query as GetKYCVerificationsQuery;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Get verifications with user information
    let verifications = await Verification.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Transform to match expected format
    const transformedVerifications = verifications.map((v: any) => {
      const user = v.userId;
      const personalInfo = v.personalInfo || {};
      const address = personalInfo.address || {};
      
      // Calculate risk score (simplified)
      let riskScore = 0.1;
      if (v.type === 'rescue_organization') riskScore = 0.6;
      else if (v.type === 'pet_ownership') riskScore = 0.3;
      else if (v.type === 'veterinary') riskScore = 0.4;

      // Priority mapping
      const priorityMap: Record<string, string> = {
        'identity': 'medium',
        'pet_ownership': 'low',
        'veterinary': 'medium',
        'rescue_organization': 'high'
      };

      // Get document metadata
      const documents = (v.documents || []).map((doc: any) => ({
        id: doc._id,
        type: doc.type,
        name: `${doc.type}_${v._id}.pdf`,
        url: doc.url,
        status: 'uploaded',
        uploadedAt: doc.uploadedAt,
        metadata: {
          documentNumber: doc.metadata?.documentNumber || '',
          issuingAuthority: doc.metadata?.issuingAuthority || '',
          issueDate: doc.metadata?.issueDate || '',
          expiryDate: doc.metadata?.expiryDate || '',
          name: `${user?.firstName || ''} ${user?.lastName || ''}`,
          dateOfBirth: personalInfo.dateOfBirth || ''
        }
      }));

      return {
        id: v._id.toString(),
        userId: user?._id?.toString() || '',
        userEmail: user?.email || '',
        userName: `${user?.firstName || ''} ${user?.lastName || ''}`,
        status: v.status,
        type: v.type,
        documents,
        submittedAt: v.submittedAt,
        riskScore,
        complianceFlags: v.status === 'rejected' ? [v.rejectionReason].filter(Boolean) : [],
        priority: priorityMap[v.type] || 'medium',
        country: address.country || 'Unknown',
        regulatoryFramework: address.country === 'United States' ? 'US_PATRIOT_Act' : 'GDPR',
        lastUpdated: v.updatedAt || v.submittedAt
      };
    });

    // Apply additional filters
    if (priority && priority !== 'all') {
      transformedVerifications.filter(v => v.priority === priority);
    }
    if (country && country !== 'all') {
      transformedVerifications.filter(v => v.country === country);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      transformedVerifications.filter(v =>
        v.userName.toLowerCase().includes(searchLower) ||
        v.userEmail.toLowerCase().includes(searchLower)
      );
    }

    const total = await Verification.countDocuments(filter);

    await logAdminActivity(req, 'VIEW_KYC_VERIFICATIONS', {
      filters: { status, type, priority, country, search }
    }, true);

    res.json({
      success: true,
      data: transformedVerifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch KYC verifications', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC verifications',
      message: error.message
    });
  }
};

/**
 * Review a KYC verification
 */
export const reviewKYCVerification = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { verificationId } = req.params;
    const { status, notes, reviewedBy } = req.body as ReviewKYCVerificationBody;

    const verification = await Verification.findById(verificationId);

    if (!verification) {
      res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
      return;
    }

    // Update verification status
    verification.status = status;
    verification.reviewedAt = new Date();
    verification.reviewedBy = req.userId as any;
    
    if (status === 'approved') {
      verification.approvedBy = req.userId as any;
      verification.approvalNotes = notes;
      
      // Also update user verification status
      const user = await User.findById(verification.userId);
      if (user) {
        user.isVerified = true;
        await user.save();
      }
    } else if (status === 'rejected') {
      verification.rejectedBy = req.userId as any;
      verification.rejectionReason = notes;
      verification.rejectionNotes = notes;
    }

    await verification.save();

    await logAdminActivity(req, 'REVIEW_KYC_VERIFICATION', {
      verificationId,
      status,
      reviewedBy: reviewedBy || req.userId
    }, true);

    logger.info(`KYC verification ${verificationId} reviewed by admin ${req.userId}`, {
      status,
      notes
    });

    res.json({
      success: true,
      message: 'KYC verification reviewed successfully',
      data: {
        verificationId,
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: req.userId
      }
    });
  } catch (error: any) {
    logger.error('Failed to review KYC verification', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to review KYC verification',
      message: error.message
    });
  }
};

/**
 * Request additional documents
 */
export const requestAdditionalDocuments = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { verificationId } = req.params;
    const { documentTypes, message } = req.body as RequestAdditionalDocumentsBody;

    const verification = await Verification.findById(verificationId);

    if (!verification) {
      res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
      return;
    }

    // Update verification with requested documents
    const requestedDocs = documentTypes.map((docType: string) => ({
      type: docType,
      requestedAt: new Date(),
      requestedBy: req.userId,
      status: 'requested',
      note: message
    }));

    if (!verification.metadata) {
      verification.metadata = {};
    }
    if (!(verification.metadata as any).requestedDocuments) {
      (verification.metadata as any).requestedDocuments = [];
    }

    (verification.metadata as any).requestedDocuments.push(...requestedDocs);
    await verification.save();

    // In a real implementation, you would send a notification to the user
    logger.info(`Additional documents requested for verification ${verificationId}`, {
      documentTypes,
      message,
      requestedBy: req.userId
    });

    await logAdminActivity(req, 'REQUEST_KYC_DOCUMENTS', {
      verificationId,
      documentTypes
    }, true);

    res.json({
      success: true,
      message: 'Document request sent successfully',
      data: {
        verificationId,
        requestedDocuments: documentTypes,
        message
      }
    });
  } catch (error: any) {
    logger.error('Failed to request additional documents', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to request additional documents',
      message: error.message
    });
  }
};

// Export all functions
export default {
  getKYCStats,
  getKYCVerifications,
  reviewKYCVerification,
  requestAdditionalDocuments
};

