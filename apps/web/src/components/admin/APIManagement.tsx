/**
 * 🔧 API Management System
 * Comprehensive API endpoint monitoring, testing, and management
 */
'use client';
import React, { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { ServerIcon, CpuChipIcon, ChartBarIcon, BeakerIcon, KeyIcon, ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, EyeIcon, PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, CloudIcon, WifiIcon, BoltIcon, DocumentTextIcon, CodeBracketIcon, PlayIcon, StopIcon, PauseIcon, ArrowUpIcon, ArrowDownIcon, GlobeAltIcon, LockClosedIcon, LockOpenIcon, CogIcon, DocumentDuplicateIcon, ShareIcon, ArrowDownTrayIcon, PrinterIcon, } from '@heroicons/react/24/outline';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumButton from '@/components/UI/PremiumButton';
import { PREMIUM_VARIANTS, SPRING_CONFIGS, STAGGER_CONFIG } from '@/constants/animations';
export default function APIManagement() {
    const [activeTab, setActiveTab] = useState('overview');
    const [endpoints, setEndpoints] = useState([]);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [showEndpointModal, setShowEndpointModal] = useState(false);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [testResults, setTestResults] = useState({});
    const [isRunningTests, setIsRunningTests] = useState(false);
    // Mock data - replace with actual API calls
    useEffect(() => {
        const loadAPIData = async () => {
            setIsLoading(true);
            setTimeout(() => {
                setStats({
                    totalEndpoints: 47,
                    activeEndpoints: 42,
                    totalCalls: 125847,
                    avgResponseTime: 145,
                    errorRate: 0.8,
                    uptime: 99.9,
                    throughput: {
                        requestsPerSecond: 234,
                        dataTransferred: 2.4
                    },
                    topEndpoints: [
                        { path: '/api/pets/discover', method: 'GET', calls: 15600, avgTime: 95 },
                        { path: '/api/auth/login', method: 'POST', calls: 12400, avgTime: 85 },
                        { path: '/api/users/profile', method: 'GET', calls: 9800, avgTime: 65 },
                        { path: '/api/matches', method: 'GET', calls: 8700, avgTime: 75 },
                        { path: '/api/messages/send', method: 'POST', calls: 7200, avgTime: 55 }
                    ],
                    errorDistribution: [
                        { status: 400, count: 234, percentage: 45.2 },
                        { status: 401, count: 156, percentage: 30.1 },
                        { status: 404, count: 89, percentage: 17.2 },
                        { status: 500, count: 39, percentage: 7.5 }
                    ],
                    performanceMetrics: {
                        p50: 120,
                        p95: 450,
                        p99: 1200
                    }
                });
                setEndpoints([
                    {
                        id: '1',
                        method: 'GET',
                        path: '/api/pets/discover',
                        description: 'Discover pets with advanced filtering and matching',
                        status: 'active',
                        calls: 15600,
                        avgTime: 95,
                        errors: 12,
                        successRate: 99.2,
                        lastCalled: '2024-01-20T15:30:00Z',
                        rateLimit: {
                            requests: 1000,
                            window: '1h',
                            remaining: 847
                        },
                        authentication: 'bearer',
                        parameters: [
                            {
                                name: 'species',
                                type: 'string',
                                required: false,
                                description: 'Filter by pet species',
                                example: 'dog',
                                validation: {
                                    enum: ['dog', 'cat', 'bird', 'rabbit', 'other']
                                }
                            },
                            {
                                name: 'age_min',
                                type: 'number',
                                required: false,
                                description: 'Minimum age in years',
                                example: 1,
                                validation: {
                                    min: 0,
                                    max: 20
                                }
                            }
                        ],
                        responses: [
                            {
                                status: 200,
                                description: 'Successful response with pet list',
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } },
                                example: [{ id: '1', name: 'Buddy', species: 'dog', age: 3 }]
                            },
                            {
                                status: 401,
                                description: 'Unauthorized - invalid token',
                                schema: { type: 'object', properties: { error: { type: 'string' } } },
                                example: { error: 'Invalid authentication token' }
                            }
                        ],
                        version: 'v1',
                        tags: ['pets', 'discovery'],
                        documentation: 'https://api.pawfectmatch.com/docs/pets#discover',
                        testCases: [
                            {
                                id: 'test1',
                                name: 'Valid Discovery Request',
                                description: 'Test successful pet discovery',
                                method: 'GET',
                                path: '/api/pets/discover?species=dog&age_min=1',
                                headers: { 'Authorization': 'Bearer test-token' },
                                expectedStatus: 200,
                                lastRun: '2024-01-20T14:30:00Z',
                                result: 'pass',
                                executionTime: 89
                            }
                        ],
                        monitoring: {
                            enabled: true,
                            alerts: true,
                            threshold: 500
                        }
                    }
                ]);
                setIsLoading(false);
            }, 1000);
        };
        loadAPIData();
    }, []);
    const tabs = [
        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
        { id: 'endpoints', label: 'Endpoints', icon: ServerIcon },
        { id: 'testing', label: 'Testing', icon: BeakerIcon },
        { id: 'monitoring', label: 'Monitoring', icon: CpuChipIcon },
        { id: 'documentation', label: 'Documentation', icon: DocumentTextIcon },
        { id: 'settings', label: 'Settings', icon: CogIcon },
    ];
    const handleEndpointAction = (action, endpointId, data) => {
        logger.info(`${action} endpoint ${endpointId}`, { data });
    };
    const runAllTests = async () => {
        setIsRunningTests(true);
        // Simulate test execution
        setTimeout(() => {
            setTestResults({
                total: 156,
                passed: 142,
                failed: 8,
                errors: 6,
                executionTime: 2340
            });
            setIsRunningTests(false);
        }, 3000);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'inactive': return 'text-gray-600 bg-gray-100';
            case 'deprecated': return 'text-yellow-600 bg-yellow-100';
            case 'maintenance': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'text-green-600 bg-green-100';
            case 'POST': return 'text-blue-600 bg-blue-100';
            case 'PUT': return 'text-yellow-600 bg-yellow-100';
            case 'DELETE': return 'text-red-600 bg-red-100';
            case 'PATCH': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const renderOverview = () => (<div className="space-y-8">
      {/* API Statistics */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" initial="hidden" animate="visible" variants={STAGGER_CONFIG}>
        {stats && [
            {
                label: 'Total Endpoints',
                value: stats.totalEndpoints,
                icon: ServerIcon,
                color: 'blue',
                gradient: 'from-blue-500 to-blue-600',
                trend: '+3',
                trendUp: true
            },
            {
                label: 'Total Calls',
                value: stats.totalCalls.toLocaleString(),
                icon: ChartBarIcon,
                color: 'green',
                gradient: 'from-green-500 to-green-600',
                trend: '+12%',
                trendUp: true
            },
            {
                label: 'Avg Response Time',
                value: `${stats.avgResponseTime}ms`,
                icon: ClockIcon,
                color: 'yellow',
                gradient: 'from-yellow-500 to-yellow-600',
                trend: '-15ms',
                trendUp: true
            },
            {
                label: 'Uptime',
                value: `${stats.uptime}%`,
                icon: CheckCircleIcon,
                color: 'purple',
                gradient: 'from-purple-500 to-purple-600',
                trend: '+0.1%',
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

      {/* Top Endpoints */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ...SPRING_CONFIGS.smooth }}>
        <PremiumCard variant="gradient" className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse"/>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Top Endpoints</h3>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <BoltIcon className="w-6 h-6 text-white/80"/>
              </motion.div>
            </div>
            
            <div className="space-y-4">
              {stats && stats.topEndpoints.map((endpoint, index) => (<motion.div key={endpoint.path} className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + index * 0.1, ...SPRING_CONFIGS.gentle }} whileHover={{
                scale: 1.02,
                transition: SPRING_CONFIGS.gentle
            }}>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-sm font-bold rounded ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <div>
                      <p className="text-white font-medium">{endpoint.path}</p>
                      <p className="text-white/60 text-sm">{endpoint.calls.toLocaleString()} calls</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white font-medium">{endpoint.avgTime}ms</p>
                    <p className="text-white/60 text-sm">avg time</p>
                  </div>
                </motion.div>))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ...SPRING_CONFIGS.smooth }}>
        <PremiumCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 animate-pulse"/>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Performance Metrics</h3>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <CpuChipIcon className="w-6 h-6 text-purple-500"/>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats && Object.entries(stats.performanceMetrics).map(([metric, value], index) => (<motion.div key={metric} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + index * 0.1, ...SPRING_CONFIGS.gentle }} whileHover={{
                scale: 1.05,
                transition: SPRING_CONFIGS.gentle
            }}>
                  <p className="text-2xl font-bold text-gray-900">{value}ms</p>
                  <p className="text-sm text-gray-500 font-medium">P{metric}</p>
                </motion.div>))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>);
    const renderEndpoints = () => (<div className="space-y-8">
      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_CONFIGS.smooth }}>
        <PremiumCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"/>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">API Endpoints</h3>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <ServerIcon className="w-6 h-6 text-purple-500"/>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <motion.div className="relative" whileFocus={{ scale: 1.02 }} transition={SPRING_CONFIGS.gentle}>
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                  <input type="text" placeholder="Search endpoints..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"/>
                </motion.div>
              </div>
              
              <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); }} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                <option value="all">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
              
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Endpoints Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...SPRING_CONFIGS.smooth }}>
        <PremiumCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50"/>
          
          <div className="relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Method</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Endpoint</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Calls</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Avg Time</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Success Rate</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint, index) => (<motion.tr key={endpoint.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300 group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1, ...SPRING_CONFIGS.gentle }} whileHover={{
                scale: 1.01,
                transition: SPRING_CONFIGS.gentle
            }}>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-sm font-bold rounded ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{endpoint.path}</p>
                          <p className="text-sm text-gray-500">{endpoint.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(endpoint.status)}`}>
                          {endpoint.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{endpoint.calls.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{endpoint.avgTime}ms</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${endpoint.successRate >= 99 ? 'text-green-600' : endpoint.successRate >= 95 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {endpoint.successRate}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <motion.button onClick={() => {
                setSelectedEndpoint(endpoint);
                setShowEndpointModal(true);
            }} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={SPRING_CONFIGS.gentle}>
                            <EyeIcon className="w-4 h-4"/>
                          </motion.button>
                          <motion.button onClick={() => { handleEndpointAction('test', endpoint.id); }} className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={SPRING_CONFIGS.gentle}>
                            <PlayIcon className="w-4 h-4"/>
                          </motion.button>
                          <motion.button onClick={() => { handleEndpointAction('edit', endpoint.id); }} className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={SPRING_CONFIGS.gentle}>
                            <PencilIcon className="w-4 h-4"/>
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
    const renderTesting = () => (<div className="space-y-8">
      {/* Test Controls */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_CONFIGS.smooth }}>
        <PremiumCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5"/>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">API Testing</h3>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <BeakerIcon className="w-6 h-6 text-green-500"/>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <PremiumButton variant="primary" onClick={runAllTests} disabled={isRunningTests} icon={isRunningTests ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <PlayIcon className="w-5 h-5"/>} className="px-6 py-3">
                {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
              </PremiumButton>
              
              <PremiumButton variant="neon" icon={<StopIcon className="w-5 h-5"/>} className="px-6 py-3">
                Stop Tests
              </PremiumButton>
              
              <PremiumButton variant="glass" icon={<DocumentDuplicateIcon className="w-5 h-5"/>} className="px-6 py-3">
                Export Results
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...SPRING_CONFIGS.smooth }}>
          <PremiumCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50"/>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Test Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{testResults.total}</p>
                  <p className="text-sm text-blue-500 font-medium">Total Tests</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">{testResults.passed}</p>
                  <p className="text-sm text-green-500 font-medium">Passed</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-600">{testResults.failed}</p>
                  <p className="text-sm text-red-500 font-medium">Failed</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <p className="text-2xl font-bold text-yellow-600">{testResults.executionTime}ms</p>
                  <p className="text-sm text-yellow-500 font-medium">Execution Time</p>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>)}
    </div>);
    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return renderOverview();
            case 'endpoints': return renderEndpoints();
            case 'testing': return renderTesting();
            case 'monitoring': return <div>Monitoring dashboard coming soon...</div>;
            case 'documentation': return <div>API documentation coming soon...</div>;
            case 'settings': return <div>API settings coming soon...</div>;
            default: return <div>Coming soon...</div>;
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API management...</p>
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
                        🔧
                      </motion.span>
                      <span>API Management</span>
                    </h1>
                  </motion.div>
                  
                  <motion.p className="text-white/80 text-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, ...SPRING_CONFIGS.gentle }}>
                    Comprehensive API endpoint monitoring and management
                  </motion.p>
                </div>
                
                <motion.div className="flex items-center space-x-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, ...SPRING_CONFIGS.gentle }}>
                  <div className="text-right text-white">
                    <p className="text-sm opacity-80 mb-1">System Uptime</p>
                    <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.gentle}>
                      <motion.div className="w-3 h-3 rounded-full bg-green-400" animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
        }} transition={{
            duration: 2,
            repeat: Infinity
        }}/>
                      <p className="text-lg font-semibold">
                        {stats?.uptime}%
                      </p>
                    </motion.div>
                  </div>
                  
                  <motion.div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm" whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.gentle}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <ServerIcon className="w-5 h-5 text-white"/>
                    </motion.div>
                    <span className="text-white font-medium">Live</span>
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
                  <h3 className="text-lg font-bold text-gray-800 mb-2">API Sections</h3>
                  <div className="w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"/>
                </motion.div>
                
                <nav className="space-y-2">
                  {tabs.map((tab, index) => (<motion.button key={tab.id} onClick={() => { setActiveTab(tab.id); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${activeTab === tab.id
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

      {/* Endpoint Modal */}
      <AnimatePresence>
        {showEndpointModal && selectedEndpoint && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowEndpointModal(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Endpoint Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Method</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEndpoint.status)}`}>
                      {selectedEndpoint.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Path</label>
                  <p className="font-medium font-mono">{selectedEndpoint.path}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="font-medium">{selectedEndpoint.description}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Calls</label>
                    <p className="font-medium">{selectedEndpoint.calls.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Avg Time</label>
                    <p className="font-medium">{selectedEndpoint.avgTime}ms</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Success Rate</label>
                    <p className="font-medium">{selectedEndpoint.successRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <PremiumButton variant="glass" onClick={() => { setShowEndpointModal(false); }}>
                  Close
                </PremiumButton>
                <PremiumButton variant="primary" onClick={() => {
                handleEndpointAction('test', selectedEndpoint.id);
                setShowEndpointModal(false);
            }}>
                  Test Endpoint
                </PremiumButton>
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
//# sourceMappingURL=APIManagement.jsx.map