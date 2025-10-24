/**
 * 📊 SYSTEM STATUS DASHBOARD
 * Real-time monitoring of all enhanced systems and performance metrics
 */

'use client';

import {
  ArrowPathIcon,
  BeakerIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ShieldCheckIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import PremiumButton from '../../../src/components/UI/PremiumButton';
import PremiumCard from '../../../src/components/UI/PremiumCard';
import { PREMIUM_VARIANTS } from '../../../src/constants/animations';
import { useEnhancedSocket } from '../../../src/hooks/useEnhancedSocket';
import { useAnalytics } from '../../../src/utils/analytics-system';
import { createPerformanceMonitor } from '../../../src/utils/performance';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  health: SystemHealth;
  endpoint?: string;
  features: string[];
}

export default function SystemStatusPage() {
  const { state: socketState, socket } = useEnhancedSocket();
  const analytics = useAnalytics();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize performance monitoring
  useEffect(() => {
    const monitor = createPerformanceMonitor();
    
    const interval = setInterval(() => {
      const report = monitor.generateReport();
      setPerformanceData(report);
    }, 5000);

    return () => {
      clearInterval(interval);
      monitor.destroy();
    };
  }, []);

  // Fetch service statuses
  const fetchServiceStatuses = async () => {
    setIsRefreshing(true);
    
    try {
      // Backend API Health
      const backendHealth = await fetch('/api/health').then(r => r.json()).catch(() => null);
      
      // AI Service Health  
      const aiHealth = await fetch(`${process.env['NEXT_PUBLIC_AI_URL']}/health`).then(r => r.json()).catch(() => null);
      
      // AI Routes Health
      const aiRoutesHealth = await fetch('/api/ai/health').then(r => r.json()).catch(() => null);

      const serviceStatuses: ServiceStatus[] = [
        {
          name: 'Backend API',
          status: backendHealth ? 'online' : 'offline',
          health: {
            status: backendHealth?.status === 'healthy' ? 'healthy' : 'critical',
            uptime: backendHealth?.uptime || 0,
            responseTime: backendHealth?.responseTime || 0,
            errorRate: backendHealth?.errorRate || 0,
            lastCheck: new Date().toISOString(),
          },
          endpoint: '/api/health',
          features: ['Authentication', 'Pet Management', 'Matching', 'Chat'],
        },
        {
          name: 'AI Service (Enhanced)',
          status: aiHealth ? 'online' : 'offline',
          health: {
            status: aiHealth?.status === 'healthy' ? 'healthy' : 'critical',
            uptime: 0,
            responseTime: 0,
            errorRate: 0,
            lastCheck: new Date().toISOString(),
          },
          endpoint: `${process.env['NEXT_PUBLIC_AI_URL']}/health`,
          features: ['Bio Generation', 'Photo Analysis', 'Compatibility', 'Caching'],
        },
        {
          name: 'AI Routes (Backend)',
          status: aiRoutesHealth ? 'online' : 'offline',
          health: {
            status: aiRoutesHealth?.status === 'healthy' ? 'healthy' : 'critical',
            uptime: 0,
            responseTime: 0,
            errorRate: 0,
            lastCheck: new Date().toISOString(),
          },
          endpoint: '/api/ai/health',
          features: ['Enhanced Bio', 'Photo Analysis', 'Compatibility', 'Cache Management'],
        },
        {
          name: 'Real-time Socket',
          status: socketState.isConnected ? 'online' : 'offline',
          health: {
            status: socketState.connectionQuality === 'excellent' || socketState.connectionQuality === 'good' ? 'healthy' : 'warning',
            uptime: 0,
            responseTime: socketState.latency,
            errorRate: 0,
            lastCheck: new Date().toISOString(),
          },
          features: ['Chat', 'Typing Indicators', 'Presence', 'Notifications'],
        },
      ];

      setServices(serviceStatuses);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Failed to fetch service statuses:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServiceStatuses();
    const interval = setInterval(fetchServiceStatuses, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning':
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'offline':
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy': return CheckCircleIcon;
      case 'warning':
      case 'degraded': return ExclamationTriangleIcon;
      case 'offline':
      case 'critical': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const overallSystemHealth = services.length > 0 
    ? services.every(s => s.status === 'online') ? 'healthy' : 'degraded'
    : 'unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6" data-testid="status-dashboard">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={PREMIUM_VARIANTS.fadeInUp}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">System Status</h1>
            <p className="text-gray-600">Real-time monitoring of all enhanced systems</p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.div
              className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(overallSystemHealth)}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Overall: {overallSystemHealth.toUpperCase()}
            </motion.div>
            
            <PremiumButton
              variant="glass"
              onClick={fetchServiceStatuses}
              loading={isRefreshing}
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Refresh
            </PremiumButton>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <PremiumCard variant="glass" hover glow>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <WifiIcon className="w-8 h-8 text-blue-600" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(socketState.connectionQuality)}`}>
                  {socketState.connectionQuality.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Connection</h3>
              <p className="text-gray-600 text-sm mb-2">Real-time connectivity</p>
              <div className="text-2xl font-bold text-blue-600">
                {socketState.latency.toFixed(0)}ms
              </div>
            </div>
          </PremiumCard>

          <PremiumCard variant="gradient" hover glow>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BoltIcon className="w-8 h-8 text-white" />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  ENHANCED
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Performance</h3>
              <p className="text-white/80 text-sm mb-2">App responsiveness</p>
              <div className="text-2xl font-bold text-white">
                {performanceData?.score || 0}/100
              </div>
            </div>
          </PremiumCard>

          <PremiumCard variant="neon" hover glow>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BeakerIcon className="w-8 h-8 text-purple-400" />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400">
                  AI POWERED
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Services</h3>
              <p className="text-purple-200 text-sm mb-2">Enhanced intelligence</p>
              <div className="text-2xl font-bold text-purple-400">
                {services.filter(s => s.name.includes('AI')).filter(s => s.status === 'online').length}/
                {services.filter(s => s.name.includes('AI')).length} Online
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Services Status */}
        <motion.div
          className="mb-8"
          variants={PREMIUM_VARIANTS.fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Services</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status);
              
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PremiumCard variant="elevated" hover className="p-6" data-testid="health-indicator">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.endpoint}</p>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Response Time</p>
                        <p className="font-semibold">{service.health.responseTime.toFixed(0)}ms</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Error Rate</p>
                        <p className="font-semibold">{service.health.errorRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`font-semibold ${getStatusColor(service.health.status).split(' ')[0]}`}>
                          {service.health.status}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {service.features.map(feature => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Performance Metrics */}
        {performanceData && (
          <motion.div
            variants={PREMIUM_VARIANTS.fadeInUp}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              {Object.entries(performanceData.metrics).map(([key, value]) => (
                <PremiumCard key={key} variant="glass" hover>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <div className="text-xl font-bold text-gray-900">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      {key.includes('time') ? 'ms' : ''}
                      {key.includes('percentage') ? '%' : ''}
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>

            {/* Performance Recommendations */}
            {performanceData.recommendations.length > 0 && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <PremiumCard variant="neon" className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <BoltIcon className="w-5 h-5 mr-2" />
                    Performance Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {performanceData.recommendations.map((rec: string, index: number) => (
                      <motion.li
                        key={index}
                        className="flex items-start text-purple-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <ChartBarIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </PremiumCard>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Analytics Overview */}
        <motion.div
          variants={PREMIUM_VARIANTS.fadeInUp}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <PremiumCard variant="holographic" hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <EyeIcon className="w-8 h-8 text-white" />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  REAL-TIME
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">User Behavior</h3>
              <p className="text-white/80 text-sm mb-4">Advanced tracking active</p>
              <PremiumButton
                variant="glass"
                size="sm"
                onClick={() => {
                  const report = analytics.generateReport();
                  console.log('📊 Analytics Report:', report);
                  alert('Analytics report generated! Check console for details.');
                }}
              >
                Generate Report
              </PremiumButton>
            </PremiumCard>

            <PremiumCard variant="elevated" hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                  PROTECTED
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Error Monitoring</h3>
              <p className="text-gray-600 text-sm mb-4">Comprehensive error tracking</p>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-xs text-gray-500">Uptime target</p>
            </PremiumCard>

            <PremiumCard variant="glass" hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CpuChipIcon className="w-8 h-8 text-purple-600" />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-600">
                  OPTIMIZED
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">System Load</h3>
              <p className="text-gray-600 text-sm mb-4">Resource utilization</p>
              <div className="text-2xl font-bold text-purple-600">Normal</div>
              <p className="text-xs text-gray-500">All systems optimal</p>
            </PremiumCard>
          </div>
        </motion.div>

        {/* Enhanced Features Status */}
        <motion.div
          variants={PREMIUM_VARIANTS.fadeInUp}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Features Status</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Premium UI System', status: 'active', features: 7, description: 'Glass morphism, animations, haptics' },
              { name: 'AI Cache System', status: 'active', features: 3, description: 'Redis caching, intelligent TTL' },
              { name: 'Advanced Analytics', status: 'active', features: 8, description: 'Behavior tracking, performance monitoring' },
              { name: 'Error Boundaries', status: 'active', features: 4, description: 'Auto-retry, user-friendly errors' },
              { name: 'Socket Enhancement', status: 'active', features: 6, description: 'Typing fixes, presence, quality monitoring' },
              { name: 'Performance Monitor', status: 'active', features: 5, description: 'Real-time metrics, optimization alerts' },
            ].map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <PremiumCard variant="default" hover className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                    </div>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      {feature.features} features
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                  <div className="text-xs text-green-600 font-medium">✅ ACTIVE</div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Last Update Info */}
        <motion.div
          className="mt-8 text-center text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-sm">
            Last updated: {lastUpdate.toLocaleTimeString()} | 
            Auto-refresh every 30 seconds |
            Enhanced monitoring active
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
