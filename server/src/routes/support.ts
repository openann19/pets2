import express, { Router, Response } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import logger from '../utils/logger';
import type { 
  AuthenticatedRequest, 
  ApiResponse, 
  FAQ, 
  SupportTicket, 
  BugReport 
} from '../types';

const router: Router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// FAQ data (in a real app, this would come from a database)
const faqData: FAQ[] = [
  {
    id: '1',
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Go to the login screen and tap "Forgot Password". Enter your email address and follow the instructions sent to your email.',
  },
  {
    id: '2',
    category: 'Account',
    question: 'How do I delete my account?',
    answer: 'Go to Settings > Account > Delete Account. This action is permanent and cannot be undone.',
  },
  {
    id: '3',
    category: 'Matching',
    question: 'Why am I not seeing any matches?',
    answer: 'Make sure your profile is complete with photos and bio. Also check your distance and age preferences in settings.',
  },
  {
    id: '4',
    category: 'Matching',
    question: 'How does the matching algorithm work?',
    answer: 'Our AI analyzes compatibility based on pet personalities, activity levels, and owner preferences to suggest the best matches.',
  },
  {
    id: '5',
    category: 'Premium',
    question: 'What features are included in Premium?',
    answer: 'Premium includes unlimited swipes, advanced filters, read receipts, and priority customer support.',
  },
  {
    id: '6',
    category: 'Safety',
    question: 'How do I report inappropriate behavior?',
    answer: 'Tap the three dots on any profile or message, then select "Report". Our team will review the report within 24 hours.',
  },
];

// @desc    Get FAQ data
// @route   GET /api/support/faq
// @access  Private
const getFAQ = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const response: ApiResponse<FAQ[]> = {
      success: true,
      data: faqData,
    };
    res.json(response);
  } catch (error) {
    logger.error('Failed to fetch FAQ data', { error });
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch FAQ data',
    };
    res.status(500).json(response);
  }
};

// @desc    Create support ticket
// @route   POST /api/support/ticket
// @access  Private
const createSupportTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { subject, message, category, priority = 'normal' } = req.body;
    
    // In a real app, this would save to a database
    const ticket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      userId: req.userId,
      subject,
      message,
      category,
      priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('Support ticket created', { ticketId: ticket.id, userId: req.userId });

    const response: ApiResponse<SupportTicket> = {
      success: true,
      data: ticket,
      message: 'Support ticket created successfully. We\'ll get back to you within 24 hours.',
    };
    res.json(response);
  } catch (error) {
    logger.error('Failed to create support ticket', { error });
    const response: ApiResponse = {
      success: false,
      message: 'Failed to create support ticket',
    };
    res.status(500).json(response);
  }
};

// @desc    Submit bug report
// @route   POST /api/support/bug-report
// @access  Private
const submitBugReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      description, 
      stepsToReproduce, 
      expectedBehavior, 
      actualBehavior,
      deviceInfo,
      appVersion 
    } = req.body;
    
    // In a real app, this would save to a database
    const bugReport: BugReport = {
      id: `bug_${Date.now()}`,
      userId: req.userId,
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      deviceInfo,
      appVersion,
      status: 'new',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('Bug report submitted', { bugId: bugReport.id, userId: req.userId });

    const response: ApiResponse<BugReport> = {
      success: true,
      data: bugReport,
      message: 'Bug report submitted successfully. Thank you for helping us improve the app!',
    };
    res.json(response);
  } catch (error) {
    logger.error('Failed to submit bug report', { error });
    const response: ApiResponse = {
      success: false,
      message: 'Failed to submit bug report',
    };
    res.status(500).json(response);
  }
};

// Validation rules
const supportTicketValidation = [
  body('subject').trim().isLength({ min: 5, max: 100 }).withMessage('Subject must be 5-100 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters'),
  body('category').isIn(['account', 'matching', 'premium', 'technical', 'safety', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
];

const bugReportValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('stepsToReproduce').optional().trim().isLength({ max: 500 }).withMessage('Steps to reproduce too long'),
  body('expectedBehavior').optional().trim().isLength({ max: 500 }).withMessage('Expected behavior too long'),
  body('actualBehavior').optional().trim().isLength({ max: 500 }).withMessage('Actual behavior too long'),
];

// Routes
router.get('/faq', getFAQ);
router.post('/ticket', supportTicketValidation, validate, createSupportTicket);
router.post('/bug-report', bugReportValidation, validate, submitBugReport);

export default router;
