'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, ClipboardDocumentCheckIcon, CheckCircleIcon, ClockIcon, XCircleIcon, } from '@heroicons/react/24/outline';
const RescueWorkflowManager = ({ applicationId: _applicationId }) => {
    // applicationId would be used to fetch specific application data from API
    const [selectedApplication, setSelectedApplication] = useState(null);
    // Sample application data
    const [applications] = useState([
        {
            id: '1',
            petName: 'Max',
            applicantName: 'Sarah Johnson',
            submittedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            currentStep: 3,
            status: 'pending',
            steps: [
                {
                    id: 'app-submitted',
                    name: 'Application Submitted',
                    status: 'completed',
                    description: 'Initial application form completed',
                    completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 'review',
                    name: 'Application Review',
                    status: 'completed',
                    description: 'Rescue organization reviews application',
                    completedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                    notes: 'Strong application with excellent references',
                },
                {
                    id: 'home-visit',
                    name: 'Home Visit',
                    status: 'in_progress',
                    description: 'Schedule and conduct home safety inspection',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 'meet-greet',
                    name: 'Meet & Greet',
                    status: 'pending',
                    description: 'Applicant meets the pet',
                },
                {
                    id: 'final-approval',
                    name: 'Final Approval',
                    status: 'pending',
                    description: 'Final decision and adoption agreement',
                },
            ],
        },
        {
            id: '2',
            petName: 'Luna',
            applicantName: 'Mike Chen',
            submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            currentStep: 1,
            status: 'pending',
            steps: [
                {
                    id: 'app-submitted',
                    name: 'Application Submitted',
                    status: 'completed',
                    description: 'Initial application form completed',
                    completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                {
                    id: 'review',
                    name: 'Application Review',
                    status: 'in_progress',
                    description: 'Rescue organization reviews application',
                },
                {
                    id: 'home-visit',
                    name: 'Home Visit',
                    status: 'pending',
                    description: 'Schedule and conduct home safety inspection',
                },
                {
                    id: 'meet-greet',
                    name: 'Meet & Greet',
                    status: 'pending',
                    description: 'Applicant meets the pet',
                },
                {
                    id: 'final-approval',
                    name: 'Final Approval',
                    status: 'pending',
                    description: 'Final decision and adoption agreement',
                },
            ],
        },
    ]);
    const getStatusIcon = (status) => {
        const icons = {
            completed: CheckCircleIcon,
            in_progress: ClockIcon,
            pending: ClockIcon,
            rejected: XCircleIcon,
        };
        return icons[status];
    };
    const getStatusColor = (status) => {
        const colors = {
            completed: 'text-green-600 bg-green-50 border-green-200',
            in_progress: 'text-blue-600 bg-blue-50 border-blue-200',
            pending: 'text-gray-400 bg-gray-50 border-gray-200',
            rejected: 'text-red-600 bg-red-50 border-red-200',
        };
        return colors[status];
    };
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    const calculateProgress = (app) => {
        const completed = app.steps.filter(s => s.status === 'completed').length;
        return (completed / app.steps.length) * 100;
    };
    return (<div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
            <HomeIcon className="h-6 w-6 text-white"/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rescue Workflow</h2>
            <p className="text-sm text-gray-600">Track adoption applications</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
          <div className="text-2xl font-bold text-blue-900">{applications.length}</div>
          <div className="text-sm text-blue-600">Active Applications</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="text-2xl font-bold text-green-900">
            {applications.filter(a => a.currentStep === a.steps.length - 1).length}
          </div>
          <div className="text-sm text-green-600">Near Approval</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
          <div className="text-2xl font-bold text-orange-900">
            {applications.filter(a => a.steps.some(s => s.status === 'in_progress')).length}
          </div>
          <div className="text-sm text-orange-600">In Progress</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
          <div className="text-2xl font-bold text-purple-900">
            {Math.round(applications.reduce((sum, a) => sum + calculateProgress(a), 0) / applications.length)}%
          </div>
          <div className="text-sm text-purple-600">Avg Progress</div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {applications.map((app) => (<motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Application Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Adoption Application: {app.petName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Applicant: {app.applicantName} • Submitted {formatDate(app.submittedDate)}
                  </p>
                </div>
                <button onClick={() => { setSelectedApplication(selectedApplication?.id === app.id ? null : app); }} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  {selectedApplication?.id === app.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(calculateProgress(app))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calculateProgress(app)}%` }}/>
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            {selectedApplication?.id === app.id && (<div className="p-6">
                <div className="space-y-4">
                  {app.steps.map((step, index) => {
                    const StatusIcon = getStatusIcon(step.status);
                    const isActive = index === app.currentStep;
                    return (<div key={step.id} className={`
                          relative pl-8 pb-6 border-l-2
                          ${index === app.steps.length - 1 ? 'border-transparent' : ''}
                          ${isActive ? 'border-orange-500' : 'border-gray-200'}
                        `}>
                        {/* Step Icon */}
                        <div className={`
                          absolute -left-3.5 top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center
                          ${getStatusColor(step.status)}
                        `}>
                          <StatusIcon className="h-4 w-4"/>
                        </div>

                        {/* Step Content */}
                        <div className={`
                          ml-4 p-4 rounded-lg border
                          ${isActive ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}
                        `}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{step.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            </div>
                            <span className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${step.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                              ${step.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ''}
                              ${step.status === 'pending' ? 'bg-gray-100 text-gray-600' : ''}
                              ${step.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                            `}>
                              {step.status.replace('_', ' ')}
                            </span>
                          </div>

                          {step.completedDate && (<p className="text-xs text-gray-500 mt-2">
                              Completed: {formatDate(step.completedDate)}
                            </p>)}

                          {step.dueDate && step.status !== 'completed' && (<p className="text-xs text-orange-600 mt-2">
                              Due: {formatDate(step.dueDate)}
                            </p>)}

                          {step.notes && (<div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                              <p className="text-xs text-gray-700">{step.notes}</p>
                            </div>)}

                          {step.status === 'in_progress' && (<div className="mt-3 flex gap-2">
                              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                                Mark Complete
                              </button>
                              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                                Add Notes
                              </button>
                            </div>)}
                        </div>
                      </div>);
                })}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Approve Application
                  </button>
                  <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Reject Application
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Contact Applicant
                  </button>
                </div>
              </div>)}
          </motion.div>))}
      </div>

      {applications.length === 0 && (<div className="text-center py-12 bg-gray-50 rounded-lg">
          <ClipboardDocumentCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
          <p className="text-gray-500">Adoption applications will appear here</p>
        </div>)}
    </div>);
};
/**
 * Export both named and default for maximum compatibility
 * index.ts uses named export, other files may use default
 */
export { RescueWorkflowManager };
export default RescueWorkflowManager;
//# sourceMappingURL=RescueWorkflowManager.jsx.map