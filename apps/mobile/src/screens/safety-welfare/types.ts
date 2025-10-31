/**
 * Safety & Welfare Types
 * Type definitions for safety reporting and health disclosures
 */
export interface IncidentReport {
  type: 'aggressive_behavior' | 'injury' | 'property_damage' | 'rule_violation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  involvedPets?: string[];
  witnesses?: string[];
  evidence?: string[]; // photo/video URLs
  contactInfo: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface HealthDisclosure {
  condition: string;
  severity: 'mild' | 'moderate' | 'serious';
  contagious: boolean;
  description: string;
  treatment?: string;
  restrictions?: string[];
  expiresAt?: string;
}

export interface CommunityRule {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Incident {
  id: string;
  type: string;
  location: string;
  reportedAt: string;
  status: 'resolved' | 'investigating' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const COMMUNITY_RULES: CommunityRule[] = [
  {
    title: '🐾 Respect Pet Boundaries',
    description: 'Always respect when a pet shows signs of discomfort. Stop interactions immediately if a pet seems anxious or aggressive.',
    severity: 'high',
  },
  {
    title: '📏 Leash Laws Apply',
    description: 'Keep pets leashed in public spaces unless in designated off-leash areas. Respect venue policies.',
    severity: 'high',
  },
  {
    title: '💉 Vaccination Required',
    description: 'All pets must be up-to-date on core vaccinations (DHPP, Rabies) for safe playdates and meetups.',
    severity: 'critical',
  },
  {
    title: '🏥 Health Disclosures',
    description: 'Disclose any health conditions, medications, or behavioral issues that may affect interactions.',
    severity: 'high',
  },
  {
    title: '📱 Supervision Required',
    description: 'Never leave pets unattended. Adult supervision required for all pet interactions.',
    severity: 'critical',
  },
  {
    title: '🚫 No Sales or Breeding',
    description: 'This is a community for pet lovers, not breeders or sellers. Report any commercial activities.',
    severity: 'high',
  },
];

export const INCIDENT_TYPES = [
  { value: 'aggressive_behavior' as const, label: '🐕 Aggressive Behavior' },
  { value: 'injury' as const, label: '🏥 Injury' },
  { value: 'property_damage' as const, label: '🏠 Property Damage' },
  { value: 'rule_violation' as const, label: '⚖️ Rule Violation' },
  { value: 'other' as const, label: '❓ Other' },
];

export const SEVERITY_OPTIONS = [
  { value: 'low' as const, label: 'Low' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'high' as const, label: 'High' },
  { value: 'critical' as const, label: 'Critical' },
];

export const HEALTH_DISCLOSURE_CATEGORIES = [
  {
    title: '🦠 Contagious Conditions',
    description: 'Kennel cough, parvovirus, distemper, and other contagious diseases require disclosure.',
  },
  {
    title: '💊 Medications & Treatments',
    description: 'Current medications, especially steroids or sedatives, should be disclosed for safety.',
  },
  {
    title: '🧠 Behavioral Conditions',
    description: 'Anxiety, aggression, or other behavioral issues that may affect interactions.',
  },
];

