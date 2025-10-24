'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, ClockIcon, CheckCircleIcon, EyeIcon, Cog6ToothIcon, BellIcon, MagnifyingGlassIcon, FunnelIcon, ArrowUpIcon, ArrowDownIcon, ArrowPathIcon, ArrowDownTrayIcon, TrashIcon, PencilIcon, } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
const ALERT_TYPES = {
    authentication: { label: 'Authentication', color: 'red', icon: '🔐' },
    authorization: { label: 'Authorization', color: 'orange', icon: '👤' },
    data_breach: { label: 'Data Breach', color: 'red', icon: '💥' },
    suspicious_activity: { label: 'Suspicious Activity', color: 'yellow', icon: '👁️' },
    system_intrusion: { label: 'System Intrusion', color: 'red', icon: '🚨' },
    malware: { label: 'Malware', color: 'red', icon: '🦠' },
    phishing: { label: 'Phishing', color: 'orange', icon: '🎣' },
    ddos: { label: 'DDoS Attack', color: 'red', icon: '⚡' },
    insider_threat: { label: 'Insider Threat', color: 'purple', icon: '👥' },
    compliance_violation: { label: 'Compliance Violation', color: 'blue', icon: '📋' },
};
const SEVERITY_COLORS = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
const STATUS_COLORS = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    investigating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    false_positive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    escalated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
const PRIORITY_COLORS = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
const SecurityAlertsDashboard = ({ alerts, isLoading = false, onAcknowledgeAlert, onResolveAlert, onUpdateAlert, onDeleteAlert, onExportAlerts, onRefresh, }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedSeverity, setSelectedSeverity] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [autoRefresh] = useState(true);
    const [, setSelectedAlert] = useState(null);
    const [, setShowAlertModal] = useState(false);
    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh || !onRefresh)
            return;
        const interval = setInterval(() => {
            onRefresh();
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [autoRefresh, onRefresh]);
    // Filtered and sorted alerts
    const filteredAlerts = useMemo(() => {
        const filtered = alerts.filter((alert) => {
            const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesType = selectedType === 'all' || alert.type === selectedType;
            const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
            const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
            const matchesPriority = selectedPriority === 'all' || alert.priority === selectedPriority;
            return matchesSearch && matchesType && matchesSeverity && matchesStatus && matchesPriority;
        });
        // Sort alerts
        filtered.sort((a, b) => {
            let aValue, bValue;
            const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
            switch (sortBy) {
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'severity':
                    aValue = severityOrder[a.severity];
                    bValue = severityOrder[b.severity];
                    break;
                case 'priority':
                    aValue = priorityOrder[a.priority];
                    bValue = priorityOrder[b.priority];
                    break;
                case 'riskScore':
                    aValue = a.riskScore;
                    bValue = b.riskScore;
                    break;
                default:
                    return 0;
            }
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            else {
                return aValue < bValue ? 1 : -1;
            }
        });
        return filtered;
    }, [
        alerts,
        searchTerm,
        selectedType,
        selectedSeverity,
        selectedStatus,
        selectedPriority,
        sortBy,
        sortOrder,
    ]);
    // Pagination
    const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    // Statistics
    const stats = useMemo(() => {
        const total = alerts.length;
        const critical = alerts.filter((a) => a.severity === 'critical').length;
        const high = alerts.filter((a) => a.severity === 'high').length;
        const newAlerts = alerts.filter((a) => a.status === 'new').length;
        const investigating = alerts.filter((a) => a.status === 'investigating').length;
        const resolved = alerts.filter((a) => a.status === 'resolved').length;
        const avgResponseTime = alerts
            .filter((a) => a.resolvedAt !== undefined)
            .reduce((acc, a) => {
            const created = new Date(a.createdAt).getTime();
            const resolved = new Date(a.resolvedAt).getTime();
            return acc + (resolved - created);
        }, 0) / Math.max(1, resolved);
        return {
            total,
            critical,
            high,
            new: newAlerts,
            investigating,
            resolved,
            avgResponseTime: avgResponseTime / (1000 * 60 * 60), // Convert to hours
        };
    }, [alerts]);
    const formatTimeAgo = (date) => {
        const now = new Date();
        const alertDate = new Date(date);
        const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        }
        else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        }
        else {
            return `${Math.floor(diffInMinutes / 1440)}d ago`;
        }
    };
    const getBorderColor = (severity) => {
        if (severity === 'critical')
            return 'border-l-red-500';
        if (severity === 'high')
            return 'border-l-orange-500';
        if (severity === 'medium')
            return 'border-l-yellow-500';
        return 'border-l-green-500';
    };
    const getRiskScoreColor = (score) => {
        if (score >= 80)
            return 'text-red-600 dark:text-red-400';
        if (score >= 60)
            return 'text-orange-600 dark:text-orange-400';
        if (score >= 40)
            return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };
    const AlertCard = ({ alert }) => (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 ${getBorderColor(alert.severity)} border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200`} role="article" aria-label={`Security alert: ${alert.title}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{ALERT_TYPES[alert.type].icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {ALERT_TYPES[alert.type].label} • {formatTimeAgo(alert.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[alert.severity]}`}>
            {alert.severity.toUpperCase()}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[alert.status]}`}>
            {alert.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{alert.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <span>
            Risk Score:{' '}
            <span className={getRiskScoreColor(alert.riskScore)}>{alert.riskScore}</span>
          </span>
          <span>Priority: {alert.priority}</span>
          {alert.assignedTo !== undefined && <span>Assigned to: {alert.assignedTo.name}</span>}
        </div>
        <div className="flex items-center space-x-1">
          {alert.isAcknowledged === true && <CheckCircleIcon className="h-4 w-4 text-green-500"/>}
          {alert.escalationLevel > 0 && (<ExclamationTriangleIcon className="h-4 w-4 text-red-500"/>)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {alert.tags.slice(0, 3).map((tag, index) => (<span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {tag}
          </span>))}
        {alert.tags.length > 3 && (<span className="text-xs text-gray-500 dark:text-gray-400">
            +{alert.tags.length - 3} more
          </span>)}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Source: {alert.source.name}
          </span>
          {alert.source.location !== undefined && alert.source.location.trim() !== '' && (<span className="text-sm text-gray-600 dark:text-gray-400">
              • {alert.source.location}
            </span>)}
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => {
            setSelectedAlert(alert);
            setShowAlertModal(true);
        }} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label={`View details for ${alert.title}`}>
            <EyeIcon className="h-4 w-4"/>
          </button>
          {!alert.isAcknowledged && (<button onClick={() => onAcknowledgeAlert?.(alert.id)} className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" aria-label={`Acknowledge ${alert.title}`}>
              <CheckCircleIcon className="h-4 w-4"/>
            </button>)}
          {alert.status !== 'resolved' && (<button onClick={() => onResolveAlert?.(alert.id, 'Resolved by admin')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label={`Resolve ${alert.title}`}>
              <CheckCircleIcon className="h-4 w-4"/>
            </button>)}
          <button onClick={() => onUpdateAlert?.(alert.id, {})} className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" aria-label={`Edit ${alert.title}`}>
            <PencilIcon className="h-4 w-4"/>
          </button>
          <button onClick={() => onDeleteAlert?.(alert.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label={`Delete ${alert.title}`}>
            <TrashIcon className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </motion.div>);
    const AlertListItem = ({ alert }) => (<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 ${getBorderColor(alert.severity)} border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200`} role="article" aria-label={`Security alert: ${alert.title}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="text-xl">{ALERT_TYPES[alert.type].icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {alert.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{alert.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${SEVERITY_COLORS[alert.severity]}`}>
              {alert.severity.toUpperCase()}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[alert.status]}`}>
              {alert.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className={getRiskScoreColor(alert.riskScore)}>{alert.riskScore}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimeAgo(alert.createdAt)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => {
            setSelectedAlert(alert);
            setShowAlertModal(true);
        }} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label={`View details for ${alert.title}`}>
            <EyeIcon className="h-4 w-4"/>
          </button>
          {!alert.isAcknowledged && (<button onClick={() => onAcknowledgeAlert?.(alert.id)} className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" aria-label={`Acknowledge ${alert.title}`}>
              <CheckCircleIcon className="h-4 w-4"/>
            </button>)}
          {alert.status !== 'resolved' && (<button onClick={() => onResolveAlert?.(alert.id, 'Resolved by admin')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label={`Resolve ${alert.title}`}>
              <CheckCircleIcon className="h-4 w-4"/>
            </button>)}
          <button onClick={() => onUpdateAlert?.(alert.id, {})} className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" aria-label={`Edit ${alert.title}`}>
            <PencilIcon className="h-4 w-4"/>
          </button>
          <button onClick={() => onDeleteAlert?.(alert.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label={`Delete ${alert.title}`}>
            <TrashIcon className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </motion.div>);
    if (isLoading) {
        return (<div className="space-y-6">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"/>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"/>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"/>
            </div>))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"/>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"/>
            </div>))}
        </div>
      </div>);
    }
    return (<div className="space-y-6" role="main" aria-label="Security alerts dashboard">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Security Alerts Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage security threats in real-time
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}>
            {viewMode === 'list' ? (<Cog6ToothIcon className="h-5 w-5"/>) : (<BellIcon className="h-5 w-5"/>)}
          </button>

          <button onClick={onRefresh} className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Refresh alerts">
            <ArrowPathIcon className="h-5 w-5"/>
          </button>

          <button onClick={() => onExportAlerts?.('csv')} className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Export alerts">
            <ArrowDownTrayIcon className="h-5 w-5"/>
          </button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400"/>
            </div>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.critical}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Alerts</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Immediate attention required
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
              <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400"/>
            </div>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.investigating}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Under Investigation
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Currently being analyzed</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.new}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">New Alerts</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Awaiting acknowledgment</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400"/>
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.resolved}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Successfully handled</p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="text" placeholder="Search alerts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" aria-label="Search alerts"/>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg transition-colors ${showFilters
            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`} aria-label="Toggle filters">
              <FunnelIcon className="h-5 w-5"/>
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {Boolean(showFilters) && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label htmlFor="alertType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select id="alertType" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">All Types</option>
                    {Object.entries(ALERT_TYPES).map(([key, value]) => (<option key={key} value={key}>
                        {value.label}
                      </option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="alertSeverity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity
                  </label>
                  <select id="alertSeverity" value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">All Severities</option>
                    {Object.keys(SEVERITY_COLORS).map((severity) => (<option key={severity} value={severity}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="alertStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select id="alertStatus" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">All Statuses</option>
                    {Object.keys(STATUS_COLORS).map((status) => (<option key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() +
                    status.replace('_', ' ').slice(1)}
                      </option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="alertPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select id="alertPriority" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">All Priorities</option>
                    {Object.keys(PRIORITY_COLORS).map((priority) => (<option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="alertSortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <select id="alertSortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="createdAt">Created Date</option>
                      <option value="severity">Severity</option>
                      <option value="priority">Priority</option>
                      <option value="riskScore">Risk Score</option>
                    </select>
                    <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}>
                      {sortOrder === 'asc' ? (<ArrowUpIcon className="h-4 w-4"/>) : (<ArrowDownIcon className="h-4 w-4"/>)}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>)}
        </AnimatePresence>
      </motion.div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {paginatedAlerts.length} of {filteredAlerts.length} alerts
        </span>
        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPage" className="text-sm">Items per page:</label>
          <select id="itemsPerPage" value={itemsPerPage} onChange={() => {
            /* Items per page is currently fixed */
        }} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid/List */}
      {viewMode === 'grid' ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAlerts.map((alert) => (<AlertCard key={alert.id} alert={alert}/>))}
        </div>) : (<div className="space-y-4">
          {paginatedAlerts.map((alert) => (<AlertListItem key={alert.id} alert={alert}/>))}
        </div>)}

      {/* Empty State */}
      {filteredAlerts.length === 0 && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No security alerts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm.trim() !== '' ||
                selectedType !== 'all' ||
                selectedSeverity !== 'all' ||
                selectedStatus !== 'all' ||
                selectedPriority !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'All security systems are operating normally.'}
          </p>
        </motion.div>)}
    </div>);
};
export default SecurityAlertsDashboard;
//# sourceMappingURL=SecurityAlertsDashboard.jsx.map