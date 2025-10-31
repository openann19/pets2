'use client';

/**
 * Safety Center Page
 * Community rules, incident reporting, and safety resources
 */

import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  LockClosedIcon,
  EyeIcon,
  BanIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SafetyCenterPage() {
  const [selectedSection, setSelectedSection] = useState<
    'rules' | 'reporting' | 'resources'
  >('rules');

  const communityRules = [
    {
      title: 'Respect for All Pets',
      description:
        'Treat all pets with kindness, patience, and respect. Never approach a pet without owner permission.',
      icon: ShieldCheckIcon,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Supervision Required',
      description:
        'Pets must be supervised at all times during playdates. Owners are responsible for their pet\'s behavior.',
      icon: EyeIcon,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Health & Safety',
      description:
        'All pets must be up-to-date on vaccinations. Report any health concerns immediately.',
      icon: ShieldCheckIcon,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'No Aggression',
      description:
        'Aggressive behavior towards pets or people is not tolerated. Remove your pet immediately if aggression occurs.',
      icon: BanIcon,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Clean Up',
      description:
        'Always clean up after your pet. Bring waste bags and dispose of properly.',
      icon: DocumentTextIcon,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Respect Privacy',
      description:
        'Do not share others\' personal information without permission. Respect privacy settings.',
      icon: LockClosedIcon,
      color: 'text-pink-600 dark:text-pink-400',
    },
  ];

  const reportingTypes = [
    {
      type: 'harassment',
      title: 'Harassment or Inappropriate Behavior',
      description:
        'Report users who engage in harassment, bullying, or inappropriate communication.',
      urgent: false,
    },
    {
      type: 'aggression',
      title: 'Pet Aggression or Injury',
      description:
        'Report incidents involving aggressive pets, fights, or injuries to pets or people.',
      urgent: true,
    },
    {
      type: 'scam',
      title: 'Suspicious Activity or Scams',
      description:
        'Report suspicious profiles, potential scams, or fraudulent activity.',
      urgent: false,
    },
    {
      type: 'neglect',
      title: 'Pet Neglect or Abuse',
      description:
        'Report suspected cases of pet neglect, abuse, or mistreatment.',
      urgent: true,
    },
    {
      type: 'other',
      title: 'Other Safety Concern',
      description: 'Report any other safety concerns not covered above.',
      urgent: false,
    },
  ];

  const safetyResources = [
    {
      title: 'Emergency Contacts',
      items: [
        { label: 'Local Animal Control', value: '(555) 123-4567' },
        { label: 'Pet Emergency Clinic', value: '(555) 234-5678' },
        { label: 'Poison Control', value: '(555) 345-6789' },
      ],
      icon: PhoneIcon,
    },
    {
      title: 'Safety Tips',
      items: [
        'Always meet in public places for first playdates',
        'Bring a friend or family member when meeting someone new',
        'Trust your instincts - if something feels off, leave',
        'Keep emergency contact information accessible',
        'Monitor your pet\'s behavior and stress levels',
      ],
      icon: DocumentTextIcon,
    },
    {
      title: 'Community Guidelines',
      items: [
        'Read and understand community rules before participating',
        'Respect all members and their pets',
        'Report violations promptly',
        'Help maintain a safe and welcoming environment',
      ],
      icon: UserGroupIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            <span>Safety Center</span>
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Community guidelines, incident reporting, and safety resources
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'rules', label: 'Community Rules' },
            { id: 'reporting', label: 'Report Incident' },
            { id: 'resources', label: 'Safety Resources' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setSelectedSection(tab.id as 'rules' | 'reporting' | 'resources')
              }
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                selectedSection === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="mt-6">
          {/* Community Rules Section */}
          {selectedSection === 'rules' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Community Rules
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  These rules help maintain a safe and respectful community for
                  all pets and owners.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityRules.map((rule, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <rule.icon
                      className={`w-8 h-8 mb-4 ${rule.color}`}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {rule.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {rule.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  ⚠️ Important Reminder
                </h3>
                <p className="text-blue-800 dark:text-blue-400">
                  Violations of these rules may result in account suspension or
                  permanent ban. If you witness a violation, please report it
                  immediately using the Report Incident tab.
                </p>
              </div>
            </motion.div>
          )}

          {/* Incident Reporting Section */}
          {selectedSection === 'reporting' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Report an Incident
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your reports help keep our community safe. All reports are
                  reviewed promptly and confidentially.
                </p>
              </div>

              <div className="space-y-4">
                {reportingTypes.map((type) => (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {type.title}
                          </h3>
                          {type.urgent && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {type.description}
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              // Open reporting interface - send to moderation queue
                              const response = await fetch('/api/reports', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  reportType: type.type,
                                  category: 'safety',
                                  urgent: type.urgent,
                                  description: type.description,
                                  timestamp: new Date().toISOString(),
                                }),
                              });

                              if (response.ok) {
                                alert('Report submitted successfully. Our team will review it shortly.');
                              } else {
                                alert('Failed to submit report. Please try again or contact support.');
                              }
                            } catch (error) {
                              logger.error('Error submitting report:', error);
                              alert('An error occurred. Please try again.');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                          <span>Report This</span>
                        </button>
                      </div>
                      <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0 ml-4" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                  🚨 Emergency Situations
                </h3>
                <p className="text-yellow-800 dark:text-yellow-400 text-sm mb-4">
                  If you are in immediate danger or witnessing an emergency,
                  please contact local authorities immediately.
                </p>
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5" />
                    <span>Call 911</span>
                  </button>
                  <Link
                    href="/safety"
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  >
                    View Emergency Contacts
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Safety Resources Section */}
          {selectedSection === 'resources' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Safety Resources
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Important information and contacts to help keep you and your
                  pet safe.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safetyResources.map((resource, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <resource.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {resource.title}
                    </h3>
                    <ul className="space-y-2">
                      {resource.items.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                        >
                          <span className="text-blue-600 dark:text-blue-400 mt-1">
                            •
                          </span>
                          <span>{typeof item === 'string' ? item : `${item.label}: ${item.value}`}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">
                  📚 Additional Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Link
                    href="#"
                    className="text-green-800 dark:text-green-400 hover:underline"
                  >
                    Pet Safety Guide
                  </Link>
                  <Link
                    href="#"
                    className="text-green-800 dark:text-green-400 hover:underline"
                  >
                    First Aid for Pets
                  </Link>
                  <Link
                    href="#"
                    className="text-green-800 dark:text-green-400 hover:underline"
                  >
                    Understanding Pet Behavior
                  </Link>
                  <Link
                    href="#"
                    className="text-green-800 dark:text-green-400 hover:underline"
                  >
                    Safe Playdate Guidelines
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

