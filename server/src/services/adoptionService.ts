/**
 * Adoption Service
 * Handles adoption process, background checks, references, payments, contracts, and transfers
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';
import type { IUserDocument } from '../models/User';
import type { IPetDocument } from '../types/mongoose.d';
import type { Document } from 'mongoose';

interface BackgroundCheckResult {
  status: 'pending' | 'approved' | 'rejected';
  provider: string;
  checkedAt: Date;
  result?: Record<string, unknown>;
  notes?: string;
}

interface ReferenceCheckResult {
  referenceId: string;
  type: 'personal' | 'veterinary' | 'professional';
  status: 'pending' | 'contacted' | 'responded' | 'approved' | 'rejected';
  contactedAt?: Date;
  respondedAt?: Date;
  response?: string;
  notes?: string;
}

interface ContractData {
  applicantName: string;
  applicantEmail: string;
  ownerName: string;
  ownerEmail: string;
  petName: string;
  petSpecies: string;
  adoptionFee: number;
  terms: Record<string, unknown>;
  signatures: {
    applicant?: { signedAt?: Date; ipAddress?: string };
    owner?: { signedAt?: Date; ipAddress?: string };
  };
}

interface AdoptionApplicationWithPopulatedFields extends Document {
  petId: mongoose.Types.ObjectId | IPetDocument;
  applicantId: mongoose.Types.ObjectId | IUserDocument;
  ownerId: mongoose.Types.ObjectId | IUserDocument;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'completed';
  backgroundCheck?: BackgroundCheckResult;
  references?: Array<ReferenceCheckResult & {
    name: string;
    email: string;
    phone?: string;
    relationship: string;
  }>;
  payment?: {
    transactionId: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: Date;
  };
  contract?: {
    contractId: string;
    contractUrl: string;
    terms: Record<string, unknown>;
    generatedAt: Date;
    status: string;
  };
  transferSchedule?: {
    scheduleId: string;
    type: 'pickup' | 'delivery';
    scheduledDate: Date;
    location?: {
      address: string;
      coordinates?: [number, number];
    };
    notes?: string;
    status: string;
    createdAt: Date;
  };
  transferredHealthRecords?: Array<{
    type: string;
    date: Date;
    veterinarian: string;
    notes?: string;
    attachments?: string[];
  }>;
  insurance?: {
    insuranceId: string;
    provider: string;
    policyNumber?: string;
    coverageType: string;
    monthlyPremium?: number;
    enrolledAt: Date;
  };
  completedAt?: Date;
  ownershipTransferredAt?: Date;
  save(): Promise<this>;
}

/**
 * Submit background check request
 */
export async function submitBackgroundCheck(
  applicationId: string,
  applicantId: string,
): Promise<BackgroundCheckResult> {
  try {
    const AdoptionApplication = (await import('../models/AdoptionApplication')).default;
    const application = await AdoptionApplication.findById(applicationId).populate('applicantId');

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.applicantId.toString() !== applicantId) {
      throw new Error('Unauthorized');
    }

    // In a real implementation, this would integrate with background check providers
    // like Checkr, GoodHire, etc.
    const backgroundCheck: BackgroundCheckResult = {
      status: 'pending',
      provider: 'internal',
      checkedAt: new Date(),
      notes: 'Background check submitted',
    };

    // Store background check result in application
    const applicationDoc = application as unknown as AdoptionApplicationWithPopulatedFields;
    applicationDoc.backgroundCheck = backgroundCheck;
    await applicationDoc.save();

    logger.info('Background check submitted', { applicationId, applicantId });

    return backgroundCheck;
  } catch (error) {
    logger.error('Error submitting background check:', error);
    throw error;
  }
}

/**
 * Submit reference check
 */
export async function submitReferenceCheck(
  applicationId: string,
  reference: {
    name: string;
    email: string;
    phone?: string;
    type: 'personal' | 'veterinary' | 'professional';
    relationship: string;
  },
): Promise<ReferenceCheckResult> {
  try {
    const AdoptionApplication = (await import('../models/AdoptionApplication')).default;
    const application = await AdoptionApplication.findById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    const referenceCheck: ReferenceCheckResult = {
      referenceId: new mongoose.Types.ObjectId().toString(),
      type: reference.type,
      status: 'pending',
    };

    // Store reference in application
    const applicationDoc = application as unknown as AdoptionApplicationWithPopulatedFields;
    if (!applicationDoc.references) {
      applicationDoc.references = [];
    }

    applicationDoc.references.push({
      ...reference,
      ...referenceCheck,
    });

    await applicationDoc.save();

    // In a real implementation, send email to reference
    logger.info('Reference check submitted', { applicationId, reference });

    return referenceCheck;
  } catch (error) {
    logger.error('Error submitting reference check:', error);
    throw error;
  }
}

/**
 * Process payment for adoption
 */
export async function processAdoptionPayment(
  applicationId: string,
  paymentData: {
    amount: number;
    paymentMethodId: string;
    currency?: string;
  },
): Promise<{
  success: boolean;
  transactionId: string;
  receiptUrl?: string;
}> {
  try {
    const AdoptionApplication = (await import('../models/AdoptionApplication')).default;
    const application = await AdoptionApplication.findById(applicationId).populate('petId');

    if (!application) {
      throw new Error('Application not found');
    }

    // In a real implementation, integrate with Stripe, PayPal, etc.
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-11-20.acacia',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentData.amount * 100, // Convert to cents
      currency: paymentData.currency || 'usd',
      payment_method: paymentData.paymentMethodId,
      confirm: true,
      description: `Adoption fee for application ${applicationId}`,
    });

    // Store payment info in application
    const applicationDoc = application as unknown as AdoptionApplicationWithPopulatedFields;
    applicationDoc.payment = {
      transactionId: paymentIntent.id,
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd',
      status: paymentIntent.status,
      paidAt: new Date(),
    };

    await applicationDoc.save();

    logger.info('Adoption payment processed', { applicationId, transactionId: paymentIntent.id });

    return {
      success: paymentIntent.status === 'succeeded',
      transactionId: paymentIntent.id,
    };
  } catch (error) {
    logger.error('Error processing adoption payment:', error);
    throw error;
  }
}

/**
 * Generate adoption contract
 */
export async function generateAdoptionContract(
  applicationId: string,
  contractTerms: Record<string, unknown>,
): Promise<{
  contractId: string;
  contractUrl: string;
  pdfUrl?: string;
}> {
  try {
    const AdoptionApplication = (await import('../models/AdoptionApplication')).default;
    const application = await AdoptionApplication.findById(applicationId)
      .populate('applicantId')
      .populate('ownerId')
      .populate('petId');

    if (!application) {
      throw new Error('Application not found');
    }

    const applicationDoc = application as unknown as AdoptionApplicationWithPopulatedFields;
    const applicant = applicationDoc.applicantId as IUserDocument;
    const owner = applicationDoc.ownerId as IUserDocument;
    const pet = applicationDoc.petId as IPetDocument;

    const contractData: ContractData = {
      applicantName: `${applicant.firstName} ${applicant.lastName}`,
      applicantEmail: applicant.email,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      ownerEmail: owner.email,
      petName: pet.name,
      petSpecies: pet.species,
      adoptionFee: applicationDoc.payment?.amount || 0,
      terms: contractTerms,
      signatures: {},
    };

    // In a real implementation, generate PDF contract using a library like pdfkit
    const contractId = new mongoose.Types.ObjectId().toString();
    const contractUrl = `/contracts/${contractId}`;

    // Store contract in application
    applicationDoc.contract = {
      contractId,
      contractUrl,
      terms: contractTerms,
      generatedAt: new Date(),
      status: 'pending_signature',
    };

    await applicationDoc.save();

    logger.info('Adoption contract generated', { applicationId, contractId });

    return {
      contractId,
      contractUrl,
    };
  } catch (error) {
    logger.error('Error generating adoption contract:', error);
    throw error;
  }
}

/**
 * Schedule pickup/delivery
 */
export async function schedulePickupDelivery(
  applicationId: string,
  scheduleData: {
    type: 'pickup' | 'delivery';
    scheduledDate: Date;
    location?: {
      address: string;
      coordinates?: [number, number];
    };
    notes?: string;
  },
): Promise<{
  scheduleId: string;
  scheduledDate: Date;
}> {
  try {
    const AdoptionApplication = (await import('../models/AdoptionApplication')).default;
    const application = await AdoptionApplication.findById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    const applicationDoc = application as unknown as AdoptionApplicationWithPopulatedFields;
    const scheduleId = new mongoose.Types.ObjectId().toString();

    // Store schedule in application
    applicationDoc.transferSchedule = {
      scheduleId,
      type: scheduleData.type,
      scheduledDate: scheduleData.scheduledDate,
      location: scheduleData.location,
      notes: scheduleData.notes,
      status: 'scheduled',
      createdAt: new Date(),
    };

    await applicationDoc.save();

    logger.info('Pickup/delivery scheduled', { applicationId, scheduleId });

    return {
      scheduleId,
      scheduledDate: scheduleData.scheduledDate,
    };
  } catch (error) {
    logger.error('Error scheduling pickup/delivery:', error);
    throw error;
  }
}

/**
 * Transfer health records
 */
export async function transferHealthRecords(
  applicationId: string,
  records: Array<{
    type: string;
    date: Date;
    veterinarian: string;
    notes?: string;
    attachments?: string[];
  }>,
): Promise<{
  transferred: number;
  total: number;
}> {
  try {
    const AdoptionApplication = (await import('../models/AdoptionApplication')).default;
    const application = await AdoptionApplication.findById(applicationId).populate('petId');

    if (!application) {
      throw new Error('Application not found');
    }

    const applicationDoc = application as unknown as AdoptionApplicationWithPopulatedFields;
    const pet = applicationDoc.petId as IPetDocument;

    // Store transferred records
    if (!applicationDoc.transferredHealthRecords) {
      applicationDoc.transferredHealthRecords = [];
    }

    applicationDoc.transferredHealthRecords.push(...records);

    // Update pet health records
    if (!pet.healthInfo) {
      pet.healthInfo = {
        vaccinated: false,
        spayedNeutered: false,
        microchipped: false,
        healthConditions: [],
        medications: [],
      };
    }

    // Note: healthRecords might not be a standard field, but we'll add it if needed
    const petDoc = pet as unknown as IPetDocument & { healthRecords?: typeof records };
    if (!petDoc.healthRecords) {
      petDoc.healthRecords = [];
    }

    petDoc.healthRecords.push(...records);
    await petDoc.save();
    await applicationDoc.save();

    logger.info('Health records transferred', { applicationId, count: records.length });

      return {
        transferred: records.length,
        total: applicationDoc.transferredHealthRecords.length,
      };
  } catch (error) {
    logger.error('Error transferring health records:', error);
    throw error;
  }
}

/**
 * Transfer ownership
 */
export async function transferOwnership(
  applicationId: string,
): Promise<{
  success: boolean;
  transferDate: Date;
}> {
  try {
    const AdoptionApplication = (await import('../models/AdoptionApplication')).default;
    const Pet = (await import('../models/Pet')).default;

    const application = await AdoptionApplication.findById(applicationId)
      .populate('petId')
      .populate('applicantId');

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.status !== 'approved') {
      throw new Error('Application must be approved before ownership transfer');
    }

    const applicationDoc = application as unknown as AdoptionApplicationWithPopulatedFields;
    const pet = applicationDoc.petId as IPetDocument;
    const newOwner = applicationDoc.applicantId as IUserDocument;

    // Transfer ownership
    const petDoc = pet as unknown as IPetDocument & {
      owner: string | mongoose.Types.ObjectId;
      availability: { isAvailable: boolean };
      adoptedBy?: mongoose.Types.ObjectId;
      adoptedAt?: Date;
    };
    petDoc.owner = newOwner._id;
    petDoc.availability = { isAvailable: false };
    petDoc.adoptedBy = newOwner._id;
    petDoc.adoptedAt = new Date();

    await petDoc.save();

    // Update application status
    applicationDoc.status = 'completed';
    applicationDoc.completedAt = new Date();
    applicationDoc.ownershipTransferredAt = new Date();

    await applicationDoc.save();

    logger.info('Ownership transferred', { applicationId, petId: pet._id, newOwnerId: newOwner._id });

    return {
      success: true,
      transferDate: new Date(),
    };
  } catch (error) {
    logger.error('Error transferring ownership:', error);
    throw error;
  }
}

/**
 * Integrate pet insurance
 */
export async function integratePetInsurance(
  applicationId: string,
  insuranceData: {
    provider: string;
    policyNumber?: string;
    coverageType: string;
    monthlyPremium?: number;
  },
): Promise<{
  success: boolean;
  insuranceId: string;
}> {
  try {
    const AdoptionApplication = (await import('../models/AdoptionApplication')).default;
    const application = await AdoptionApplication.findById(applicationId).populate('petId');

    if (!application) {
      throw new Error('Application not found');
    }

    const applicationDoc = application as unknown as AdoptionApplicationWithPopulatedFields;
    const insuranceId = new mongoose.Types.ObjectId().toString();

    // Store insurance info
    applicationDoc.insurance = {
      insuranceId,
      provider: insuranceData.provider,
      policyNumber: insuranceData.policyNumber,
      coverageType: insuranceData.coverageType,
      monthlyPremium: insuranceData.monthlyPremium,
      enrolledAt: new Date(),
    };

    await applicationDoc.save();

    logger.info('Pet insurance integrated', { applicationId, insuranceId });

    return {
      success: true,
      insuranceId,
    };
  } catch (error) {
    logger.error('Error integrating pet insurance:', error);
    throw error;
  }
}

