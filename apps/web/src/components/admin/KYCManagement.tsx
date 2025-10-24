/**
 * 🔐 KYC (Know Your Customer) Management System
 * Comprehensive identity verification and compliance management
 */
'use client';
import React, { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, DocumentTextIcon, CameraIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon, EyeIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon, UserIcon, IdentificationIcon, BanknotesIcon, GlobeAltIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, CalendarIcon, DocumentDuplicateIcon, CloudArrowUpIcon, PhotoIcon, FaceSmileIcon, BuildingOfficeIcon, CreditCardIcon, LockClosedIcon, KeyIcon, BeakerIcon, ChartBarIcon, ArrowPathIcon, PlusIcon, ArrowDownTrayIcon, PrinterIcon, ShareIcon, } from '@heroicons/react/24/outline';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumButton from '@/components/UI/PremiumButton';
import { PREMIUM_VARIANTS, SPRING_CONFIGS, STAGGER_CONFIG } from '@/constants/animations';
export default function KYCManagement() {
    const [activeTab, setActiveTab] = useState('overview');
    const [verifications, setVerifications] = useState([]);
    const [selectedVerification, setSelectedVerification] = useState(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('submittedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    // Mock data - replace with actual API calls
    useEffect(() => {
        const loadKYCData = async () => {
            setIsLoading(true);
            // Simulate API calls
            setTimeout(() => {
                setStats({
                    totalVerifications: 2847,
                    pendingReview: 156,
                    approved: 2156,
                    rejected: 423,
                    expired: 112,
                    averageProcessingTime: 2.3,
                    complianceRate: 94.2,
                    riskDistribution: {
                        low: 1890,
                        medium: 756,
                        high: 167,
                        critical: 34
                    },
                    countryDistribution: [
                        { country: 'United States', count: 1245 },
                        { country: 'United Kingdom', count: 567 },
                        { country: 'Canada', count: 423 },
                        { country: 'Australia', count: 298 },
                        { country: 'Germany', count: 314 }
                    ],
                    documentTypes: [
                        { type: 'Passport', count: 1456, successRate: 96.2 },
                        { type: 'Drivers License', count: 892, successRate: 94.8 },
                        { type: 'National ID', count: 345, successRate: 92.1 },
                        { type: 'Utility Bill', count: 154, successRate: 89.3 }
                    ]
                });
                setVerifications([
                    {
                        id: '1',
                        userId: 'user123',
                        userEmail: 'john.doe@example.com',
                        userName: 'John Doe',
                        status: 'pending',
                        type: 'comprehensive',
                        documents: [
                            {
                                id: 'doc1',
                                type: 'passport',
                                name: 'US_Passport_John_Doe.pdf',
                                url: '/documents/passport1.pdf',
                                status: 'uploaded',
                                uploadedAt: '2024-01-20T10:30:00Z',
                                metadata: {
                                    documentNumber: '123456789',
                                    issuingAuthority: 'US Department of State',
                                    issueDate: '2020-01-15',
                                    expiryDate: '2030-01-15',
                                    name: 'John Doe',
                                    dateOfBirth: '1985-06-15'
                                },
                                aiAnalysis: {
                                    confidence: 0.94,
                                    extractedData: {
                                        name: 'John Doe',
                                        dateOfBirth: '1985-06-15',
                                        documentNumber: '123456789'
                                    },
                                    flags: ['document_quality_good', 'text_clearly_readable'],
                                    recommendations: ['approve_identity', 'verify_address_separately']
                                }
                            }
                        ],
                        submittedAt: '2024-01-20T10:30:00Z',
                        riskScore: 0.15,
                        complianceFlags: [],
                        priority: 'medium',
                        country: 'United States',
                        regulatoryFramework: 'US_PATRIOT_Act',
                        lastUpdated: '2024-01-20T10:30:00Z'
                    },
                    {
                        id: '2',
                        userId: 'user456',
                        userEmail: 'jane.smith@example.com',
                        userName: 'Jane Smith',
                        status: 'in_review',
                        type: 'identity',
                        documents: [
                            {
                                id: 'doc2',
                                type: 'drivers_license',
                                name: 'UK_Driving_License_Jane_Smith.pdf',
                                url: '/documents/license1.pdf',
                                status: 'verified',
                                uploadedAt: '2024-01-19T14:20:00Z',
                                verifiedAt: '2024-01-19T15:45:00Z',
                                metadata: {
                                    documentNumber: 'SMITH123456789',
                                    issuingAuthority: 'DVLA',
                                    issueDate: '2019-03-10',
                                    expiryDate: '2029-03-10',
                                    name: 'Jane Smith',
                                    dateOfBirth: '1990-12-03'
                                }
                            }
                        ],
                        submittedAt: '2024-01-19T14:20:00Z',
                        reviewedAt: '2024-01-19T15:45:00Z',
                        reviewedBy: 'admin001',
                        riskScore: 0.08,
                        complianceFlags: [],
                        priority: 'low',
                        country: 'United Kingdom',
                        regulatoryFramework: 'UK_AML_Regulations',
                        lastUpdated: '2024-01-19T15:45:00Z'
                    }
                ]);
                setIsLoading(false);
            }, 1000);
        };
        loadKYCData();
    }, []);
    const tabs = [
        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
        { id: 'verifications', label: 'Verifications', icon: ShieldCheckIcon },
        { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
        { id: 'compliance', label: 'Compliance', icon: BuildingOfficeIcon },
        { id: 'reports', label: 'Reports', icon: DocumentDuplicateIcon },
        { id: 'settings', label: 'Settings', icon: CogIcon },
    ];
    const handleVerificationAction = (action, verificationId, data) => {
        logger.info(`${action} verification ${verificationId}`, { data });
        // Implement actual API calls
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'in_review': return 'text-blue-600 bg-blue-100';
            case 'expired': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-100 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };
    const getRiskScoreColor = (score) => {
        if (score <= 0.2)
            return 'text-green-600 bg-green-100';
        if (score <= 0.5)
            return 'text-yellow-600 bg-yellow-100';
        if (score <= 0.8)
            return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };
    const renderOverview = () => (<div className="space-y-8">
      {/* KYC Statistics */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" initial="hidden" animate="visible" variants={STAGGER_CONFIG}>
        {stats && [
            {
                label: 'Total Verifications',
                value: stats.totalVerifications,
                icon: ShieldCheckIcon,
                color: 'blue',
                gradient: 'from-blue-500 to-blue-600',
                trend: '+12%',
                trendUp: true
            },
            {
                label: 'Pending Review',
                value: stats.pendingReview,
                icon: ClockIcon,
                color: 'yellow',
                gradient: 'from-yellow-500 to-yellow-600',
                trend: '-5%',
                trendUp: false
            },
            {
                label: 'Approval Rate',
                value: `${stats.complianceRate}%`,
                icon: CheckCircleIcon,
                color: 'green',
                gradient: 'from-green-500 to-green-600',
                trend: '+2.1%',
                trendUp: true
            },
            {
                label: 'Avg Processing Time',
                value: `${stats.averageProcessingTime}d`,
                icon: CalendarIcon,
                color: 'purple',
                gradient: 'from-purple-500 to-purple-600',
                trend: '-0.3d',
                trendUp: true
            },
        ].map((stat, index) => (<motion.div key={stat.label} variants={PREMIUM_VARIANTS.card} whileHover={{
                scale: 1.02,
                transition: SPRING_CONFIGS.gentle
            }}>
            <PremiumCard variant="glass" className="p-6 relative overflow-hidden group">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}/>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <div className="flex items-center space-x-1">
                    <span className={`text-xs font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <motion.p className="text-3xl font-bold text-gray-900" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1, ...SPRING_CONFIGS.bouncy }}>
                    {stat.value}
                  </motion.p>
                  
                  <motion.div whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: SPRING_CONFIGS.gentle
            }}>
                    <stat.icon className={`w-10 h-10 text-${stat.color}-500 drop-shadow-lg`}/>
                  </motion.div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>))}
      </motion.div>

      {/* Risk Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ...SPRING_CONFIGS.smooth }}>
        <PremiumCard variant="gradient" className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse"/>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Risk Distribution</h3>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <BeakerIcon className="w-6 h-6 text-white/80"/>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats && Object.entries(stats.riskDistribution).map(([risk, count], index) => (<motion.div key={risk} className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + index * 0.1, ...SPRING_CONFIGS.gentle }} whileHover={{
                scale: 1.02,
                transition: SPRING_CONFIGS.gentle
            }}>
                  <div className="flex-1">
                    <p className="text-sm text-white/80 font-medium capitalize">{risk} Risk</p>
                    <motion.p className="text-lg font-bold text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + index * 0.1 }}>
                      {count}
                    </motion.p>
                  </div>
                  
                  <div className={`w-4 h-4 rounded-full ${risk === 'low' ? 'bg-green-400' :
                risk === 'medium' ? 'bg-yellow-400' :
                    risk === 'high' ? 'bg-orange-400' : 'bg-red-400'}`}/>
                </motion.div>))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Country Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ...SPRING_CONFIGS.smooth }}>
        <PremiumCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 animate-pulse"/>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Top Countries</h3>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <GlobeAltIcon className="w-6 h-6 text-purple-500"/>
              </motion.div>
            </div>
            
            <div className="space-y-4">
              {stats && stats.countryDistribution.slice(0, 5).map((country, index) => (<motion.div key={country.country} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-300" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1, ...SPRING_CONFIGS.gentle }} whileHover={{
                scale: 1.01,
                transition: SPRING_CONFIGS.gentle
            }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {country.country.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">{country.count}</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-purple-400 to-pink-400" initial={{ width: 0 }} animate={{ width: `${(country.count / stats.countryDistribution[0].count) * 100}%` }} transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ...SPRING_CONFIGS.smooth }}/>
                    </div>
                  </div>
                </motion.div>))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>);
    const renderVerifications = () => (<div className="space-y-8">
      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_CONFIGS.smooth }}>
        <PremiumCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"/>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">KYC Verifications</h3>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <ShieldCheckIcon className="w-6 h-6 text-purple-500"/>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <motion.div className="relative" whileFocus={{ scale: 1.02 }} transition={SPRING_CONFIGS.gentle}>
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                  <input type="text" placeholder="Search by name, email, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"/>
                </motion.div>
              </div>
              
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
              
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                <option value="all">All Types</option>
                <option value="identity">Identity</option>
                <option value="address">Address</option>
                <option value="financial">Financial</option>
                <option value="business">Business</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
              
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Verifications Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...SPRING_CONFIGS.smooth }}>
        <PremiumCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50"/>
          
          <div className="relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">User</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Type</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Risk Score</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Priority</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Country</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Submitted</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((verification, index) => (<motion.tr key={verification.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300 group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1, ...SPRING_CONFIGS.gentle }} whileHover={{
                scale: 1.01,
                transition: SPRING_CONFIGS.gentle
            }}>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <motion.div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold" whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: SPRING_CONFIGS.gentle
            }}>
                            {verification.userName.charAt(0).toUpperCase()}
                          </motion.div>
                          <div>
                            <p className="font-semibold text-gray-900">{verification.userName}</p>
                            <p className="text-sm text-gray-500">{verification.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <motion.span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize" whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.gentle}>
                          {verification.type}
                        </motion.span>
                      </td>
                      <td className="py-4 px-4">
                        <motion.span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.status)}`} whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.gentle}>
                          {verification.status.replace('_', ' ')}
                        </motion.span>
                      </td>
                      <td className="py-4 px-4">
                        <motion.span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(verification.riskScore)}`} whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.gentle}>
                          {(verification.riskScore * 100).toFixed(1)}%
                        </motion.span>
                      </td>
                      <td className="py-4 px-4">
                        <motion.span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(verification.priority)}`} whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.gentle}>
                          {verification.priority}
                        </motion.span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 font-medium">{verification.country}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 font-medium">
                        {new Date(verification.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <motion.button onClick={() => {
                setSelectedVerification(verification);
                setShowVerificationModal(true);
            }} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={SPRING_CONFIGS.gentle}>
                            <EyeIcon className="w-4 h-4"/>
                          </motion.button>
                          <motion.button onClick={() => handleVerificationAction('approve', verification.id)} className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={SPRING_CONFIGS.gentle}>
                            <CheckCircleIcon className="w-4 h-4"/>
                          </motion.button>
                          <motion.button onClick={() => handleVerificationAction('reject', verification.id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={SPRING_CONFIGS.gentle}>
                            <XCircleIcon className="w-4 h-4"/>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>);
    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return renderOverview();
            case 'verifications': return renderVerifications();
            case 'documents': return <div>Documents management coming soon...</div>;
            case 'compliance': return <div>Compliance dashboard coming soon...</div>;
            case 'reports': return <div>Reports and analytics coming soon...</div>;
            case 'settings': return <div>KYC settings coming soon...</div>;
            default: return <div>Coming soon...</div>;
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading KYC management...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_CONFIGS.smooth }} className="mb-8">
          <PremiumCard variant="gradient" className="p-8 relative overflow-hidden">
            <div className="absolute inset-0">
              <motion.div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
        }} transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }}/>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ...SPRING_CONFIGS.gentle }}>
                    <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
                      <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        🔐
                      </motion.span>
                      <span>KYC Management</span>
                    </h1>
                  </motion.div>
                  
                  <motion.p className="text-white/80 text-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, ...SPRING_CONFIGS.gentle }}>
                    Identity verification and compliance management system
                  </motion.p>
                </div>
                
                <motion.div className="flex items-center space-x-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, ...SPRING_CONFIGS.gentle }}>
                  <div className="text-right text-white">
                    <p className="text-sm opacity-80 mb-1">Compliance Rate</p>
                    <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.gentle}>
                      <motion.div className="w-3 h-3 rounded-full bg-green-400" animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
        }} transition={{
            duration: 2,
            repeat: Infinity
        }}/>
                      <p className="text-lg font-semibold">
                        {stats?.complianceRate}%
                      </p>
                    </motion.div>
                  </div>
                  
                  <motion.div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm" whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.gentle}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <ShieldCheckIcon className="w-5 h-5 text-white"/>
                    </motion.div>
                    <span className="text-white font-medium">Secure</span>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        <div className="flex space-x-6">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, ...SPRING_CONFIGS.smooth }} className="w-64 flex-shrink-0">
            <PremiumCard className="p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5"/>
              
              <div className="relative z-10">
                <motion.div className="mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ...SPRING_CONFIGS.gentle }}>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">KYC Sections</h3>
                  <div className="w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"/>
                </motion.div>
                
                <nav className="space-y-2">
                  {tabs.map((tab, index) => (<motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-lg border border-purple-200'
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-800'}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1, ...SPRING_CONFIGS.gentle }} whileHover={{
                scale: 1.02,
                transition: SPRING_CONFIGS.gentle
            }} whileTap={{
                scale: 0.98,
                transition: SPRING_CONFIGS.snappy
            }}>
                      {activeTab === tab.id && (<motion.div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full" layoutId="activeTab" transition={SPRING_CONFIGS.gentle}/>)}
                      
                      <motion.div whileHover={{
                rotate: activeTab === tab.id ? 0 : 5,
                scale: 1.1
            }} transition={SPRING_CONFIGS.gentle}>
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'}`}/>
                      </motion.div>
                      
                      <span className={`font-medium ${activeTab === tab.id ? 'text-purple-700' : 'text-gray-600 group-hover:text-gray-800'}`}>
                        {tab.label}
                      </span>
                    </motion.button>))}
                </nav>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Main Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
            {renderContent()}
          </motion.div>
        </div>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && selectedVerification && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowVerificationModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Verification Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">User</label>
                    <p className="font-medium">{selectedVerification.userName}</p>
                    <p className="text-sm text-gray-500">{selectedVerification.userEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedVerification.status)}`}>
                      {selectedVerification.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Type</label>
                    <p className="font-medium capitalize">{selectedVerification.type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Risk Score</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(selectedVerification.riskScore)}`}>
                      {(selectedVerification.riskScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Documents</label>
                  <div className="space-y-2 mt-2">
                    {selectedVerification.documents.map((doc) => (<div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="w-5 h-5 text-gray-500"/>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <PremiumButton variant="glass" onClick={() => setShowVerificationModal(false)}>
                  Close
                </PremiumButton>
                <PremiumButton variant="primary" onClick={() => {
                handleVerificationAction('approve', selectedVerification.id);
                setShowVerificationModal(false);
            }}>
                  Approve
                </PremiumButton>
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
//# sourceMappingURL=KYCManagement.jsx.map