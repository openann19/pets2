/**
 * Admin Security Controller
 * Handles security metrics, IP blocking, and monitoring
 */

import { Request, Response } from 'express';
import SecurityAlert from '../../models/SecurityAlert';
import logger from '../../utils/logger';
import { logAdminActivity } from '../../middleware/adminLogger';

interface AdminRequest extends Request {
  userId?: string;
}

/**
 * GET /api/admin/security/metrics
 * Get security metrics summary
 */
export const getSecurityMetrics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    // Get security alert counts by severity
    const criticalAlerts = await SecurityAlert.countDocuments({ severity: 'critical', resolved: false });
    const highAlerts = await SecurityAlert.countDocuments({ severity: 'high', resolved: false });
    const mediumAlerts = await SecurityAlert.countDocuments({ severity: 'medium', resolved: false });
    const lowAlerts = await SecurityAlert.countDocuments({ severity: 'low', resolved: false });
    
    // Get total counts
    const totalAlerts = await SecurityAlert.countDocuments();
    const resolvedAlerts = await SecurityAlert.countDocuments({ resolved: true });
    const pendingAlerts = await SecurityAlert.countDocuments({ resolved: false });
    
    // Get counts by type
    const suspiciousLogins = await SecurityAlert.countDocuments({ 
      type: 'suspicious_login',
      resolved: false 
    });
    const blockedIPs = await SecurityAlert.countDocuments({ 
      type: 'blocked_ip',
      resolved: false 
    });
    const reportedContent = await SecurityAlert.countDocuments({ 
      type: 'reported_content',
      resolved: false 
    });
    const spamDetected = await SecurityAlert.countDocuments({ 
      type: 'spam_detected',
      resolved: false 
    });
    const dataBreaches = await SecurityAlert.countDocuments({ 
      type: 'data_breach',
      resolved: false 
    });
    const unusualActivity = await SecurityAlert.countDocuments({ 
      type: 'unusual_activity',
      resolved: false 
    });

    const metrics = {
      totalAlerts,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      resolvedAlerts,
      pendingAlerts,
      suspiciousLogins,
      blockedIPs,
      reportedContent,
      spamDetected,
      dataBreaches,
      unusualActivity,
    };

    await logAdminActivity(req, 'VIEW_SECURITY_METRICS');

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    logger.error('Failed to get security metrics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get security metrics',
      message: error.message,
    });
  }
};

/**
 * POST /api/admin/security/block-ip
 * Block an IP address
 */
export const blockIP = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ipAddress, reason, duration } = req.body as {
      ipAddress: string;
      reason: string;
      duration?: number;
    };

    if (!ipAddress) {
      res.status(400).json({
        success: false,
        error: 'IP address is required',
      });
      return;
    }

    // Create a security alert for IP blocking
    const securityAlert = new SecurityAlert({
      type: 'blocked_ip',
      severity: 'high',
      title: 'IP Address Blocked',
      description: `IP address ${ipAddress} has been blocked: ${reason}`,
      ipAddress,
      metadata: {
        reason,
        duration,
        blockedBy: req.userId,
        blockedAt: new Date().toISOString(),
      },
      resolved: false,
    });

    await securityAlert.save();

    // Log the admin activity
    await logAdminActivity(req, 'BLOCK_IP', { ipAddress, reason });

    res.json({
      success: true,
      message: `IP address ${ipAddress} has been blocked`,
      data: {
        ipAddress,
        securityAlertId: securityAlert._id,
      },
    });
  } catch (error: any) {
    logger.error('Failed to block IP address', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to block IP address',
      message: error.message,
    });
  }
};

/**
 * GET /api/admin/security/blocked-ips
 * List all blocked IPs
 */
export const getBlockedIPs = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const blockedIPs = await SecurityAlert.find({
      type: 'blocked_ip',
      resolved: false,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const ips = blockedIPs.map((alert) => ({
      ipAddress: alert.ipAddress,
      reason: alert.description,
      blockedAt: alert.createdAt,
      blockedBy: alert.metadata?.blockedBy,
    }));

    res.json({
      success: true,
      data: ips,
    });
  } catch (error: any) {
    logger.error('Failed to get blocked IPs', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get blocked IPs',
      message: error.message,
    });
  }
};

/**
 * DELETE /api/admin/security/blocked-ips/:ip
 * Unblock an IP address
 */
export const unblockIP = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { ip } = req.params;

    // Find and resolve the security alert
    const securityAlert = await SecurityAlert.findOne({
      type: 'blocked_ip',
      ipAddress: ip,
      resolved: false,
    });

    if (!securityAlert) {
      res.status(404).json({
        success: false,
        error: 'IP address not found in blocked list',
      });
      return;
    }

    securityAlert.resolved = true;
    securityAlert.resolvedBy = req.userId;
    securityAlert.resolvedAt = new Date();
    await securityAlert.save();

    await logAdminActivity(req, 'UNBLOCK_IP', { ipAddress: ip });

    res.json({
      success: true,
      message: `IP address ${ip} has been unblocked`,
    });
  } catch (error: any) {
    logger.error('Failed to unblock IP', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to unblock IP',
      message: error.message,
    });
  }
};

