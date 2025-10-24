'use client';
import React, { useState, useMemo } from 'react';
import { DocumentIcon, FunnelIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, EyeIcon, PencilIcon, TrashIcon, PlusIcon, Cog6ToothIcon, ArrowUpIcon, ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
;
const REPORT_TYPES = {
    analytics: { label: 'Analytics', color: 'blue', icon: '📊' },
    financial: { label: 'Financial', color: 'green', icon: '💰' },
    user: { label: 'User', color: 'purple', icon: '👥' },
    security: { label: 'Security', color: 'red', icon: '🔒' },
    performance: { label: 'Performance', color: 'yellow', icon: '⚡' },
    custom: { label: 'Custom', color: 'gray', icon: '📝' },
};
const STATUS_COLORS = {
    draft: 'gray',
    scheduled: 'blue',
    running: 'yellow',
    completed: 'green',
    failed: 'red',
    archived: 'gray',
};
const PRIORITY_COLORS = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
};
const ReportsManagement = ({ reports, isLoading = false, onUpdateReport, onDeleteReport, onExportReport, onViewReport, }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [, setShowCreateModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    // Filtered and sorted reports
    const filteredReports = useMemo(() => {
        const filtered = reports.filter((report) => {
            const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesType = selectedType === 'all' || report.type === selectedType;
            const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
            const matchesPriority = selectedPriority === 'all' || report.priority === selectedPriority;
            return matchesSearch && matchesType && matchesStatus && matchesPriority;
        });
        // Sort reports
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'updatedAt':
                    aValue = new Date(a.updatedAt).getTime();
                    bValue = new Date(b.updatedAt).getTime();
                    break;
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
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
    }, [reports, searchTerm, selectedType, selectedStatus, selectedPriority, sortBy, sortOrder]);
    // Pagination
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };
    const getStatusBadge = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
            scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            running: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        };
        return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>);
    };
    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
            medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>);
    };
    const ReportCard = ({ report }) => (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200" role="article" aria-label={`Report: ${report.title}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{REPORT_TYPES[report.type].icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {REPORT_TYPES[report.type].label} Report
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(report.status)}
          {getPriorityBadge(report.priority)}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{report.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <span>Created: {format(parseISO(report.createdAt), 'MMM dd, yyyy')}</span>
          <span>Views: {report.views}</span>
          {report.fileSize !== undefined && <span>Size: {formatFileSize(report.fileSize)}</span>}
        </div>
        <div className="flex items-center space-x-1">
          {report.isPublic === true && (<span className="text-green-600 dark:text-green-400">Public</span>)}
          {report.schedule?.enabled === true && (<span className="text-blue-600 dark:text-blue-400">Scheduled</span>)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {report.tags.slice(0, 3).map((tag, index) => (<span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {tag}
          </span>))}
        {report.tags.length > 3 && (<span className="text-xs text-gray-500 dark:text-gray-400">
            +{report.tags.length - 3} more
          </span>)}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={report.createdBy.avatar ??
            `https://ui-avatars.com/api/?name=${report.createdBy.name}&background=8B5CF6&color=fff`} alt={report.createdBy.name} className="w-6 h-6 rounded-full"/>
          <span className="text-sm text-gray-600 dark:text-gray-400">{report.createdBy.name}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => onViewReport?.(report.id)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label={`View ${report.title}`}>
            <EyeIcon className="h-4 w-4"/>
          </button>
          <button onClick={() => onExportReport?.(report.id, report.parameters.format)} className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" aria-label={`Export ${report.title}`}>
            <ArrowDownTrayIcon className="h-4 w-4"/>
          </button>
          <button onClick={() => onUpdateReport?.(report.id, {})} className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" aria-label={`Edit ${report.title}`}>
            <PencilIcon className="h-4 w-4"/>
          </button>
          <button onClick={() => onDeleteReport?.(report.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label={`Delete ${report.title}`}>
            <TrashIcon className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </motion.div>);
    const ReportListItem = ({ report }) => (<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200" role="article" aria-label={`Report: ${report.title}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="text-xl">{REPORT_TYPES[report.type].icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {report.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {report.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(report.status)}
            {getPriorityBadge(report.priority)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(parseISO(report.createdAt), 'MMM dd, yyyy')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{report.views} views</div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => onViewReport?.(report.id)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label={`View ${report.title}`}>
            <EyeIcon className="h-4 w-4"/>
          </button>
          <button onClick={() => onExportReport?.(report.id, report.parameters.format)} className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" aria-label={`Export ${report.title}`}>
            <ArrowDownTrayIcon className="h-4 w-4"/>
          </button>
          <button onClick={() => onUpdateReport?.(report.id, {})} className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" aria-label={`Edit ${report.title}`}>
            <PencilIcon className="h-4 w-4"/>
          </button>
          <button onClick={() => onDeleteReport?.(report.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label={`Delete ${report.title}`}>
            <TrashIcon className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </motion.div>);
    if (isLoading) {
        return (<div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"/>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"/>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"/>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"/>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"/>
              </div>
            </div>))}
        </div>
      </div>);
    }
    return (<div className="space-y-6" role="main" aria-label="Reports management">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, manage, and schedule analytical reports
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}>
            {viewMode === 'grid' ? (<DocumentIcon className="h-5 w-5"/>) : (<Cog6ToothIcon className="h-5 w-5"/>)}
          </button>

          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" aria-label="Create new report">
            <PlusIcon className="h-5 w-5 mr-2"/>
            New Report
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="text" placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" aria-label="Search reports"/>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select id="filterType" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">All Types</option>
                    {Object.keys(REPORT_TYPES).map((key) => (<option key={key} value={key}>
                        {REPORT_TYPES[key].label}
                      </option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select id="filterStatus" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">All Statuses</option>
                    {Object.keys(STATUS_COLORS).map((status) => (<option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filterPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select id="filterPriority" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">All Priorities</option>
                    {Object.keys(PRIORITY_COLORS).map((priority) => (<option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="createdAt">Created Date</option>
                      <option value="updatedAt">Updated Date</option>
                      <option value="title">Title</option>
                      <option value="status">Status</option>
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
          Showing {paginatedReports.length} of {filteredReports.length} reports
        </span>
        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPageSelect" className="text-sm">Items per page:</label>
          <select id="itemsPerPageSelect" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Reports Grid/List */}
      {viewMode === 'grid' ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReports.map((report) => (<ReportCard key={report.id} report={report}/>))}
        </div>) : (<div className="space-y-4">
          {paginatedReports.map((report) => (<ReportListItem key={report.id} report={report}/>))}
        </div>)}

      {/* Pagination */}
      {totalPages > 1 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" aria-label="Previous page">
              <ChevronLeftIcon className="h-4 w-4"/>
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages)
                    return null;
                return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'}`} aria-label={`Go to page ${pageNum}`} aria-current={currentPage === pageNum ? 'page' : undefined}>
                    {pageNum}
                  </button>);
            })}
            </div>

            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" aria-label="Next page">
              <ChevronRightIcon className="h-4 w-4"/>
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </motion.div>)}

      {/* Empty State */}
      {filteredReports.length === 0 && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No reports found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm.trim() !== '' ||
                selectedType !== 'all' ||
                selectedStatus !== 'all' ||
                selectedPriority !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by creating your first report.'}
          </p>
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2"/>
            Create Report
          </button>
        </motion.div>)}
    </div>);
};
export default ReportsManagement;
//# sourceMappingURL=ReportsManagement.jsx.map