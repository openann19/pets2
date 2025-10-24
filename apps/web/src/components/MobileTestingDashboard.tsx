'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileTesting, MobileTestResults, TouchTargetTest, ResponsiveTest, PerformanceTest, AccessibilityTest, SafeAreaTest, quickMobileHealthCheck } from '@/utils/mobile-testing';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, PlayIcon, ChartBarIcon, DevicePhoneMobileIcon, CpuChipIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
export function MobileTestingDashboard({ className = '' }) {
    const { results, isRunning, progress, runTests } = useMobileTesting();
    const [quickCheck, setQuickCheck] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const runQuickCheck = async () => {
        const check = await quickMobileHealthCheck();
        setQuickCheck(check);
    };
    const getScoreColor = (score) => {
        if (score >= 90)
            return 'text-green-500';
        if (score >= 70)
            return 'text-yellow-500';
        return 'text-red-500';
    };
    const getScoreBg = (score) => {
        if (score >= 90)
            return 'bg-green-500';
        if (score >= 70)
            return 'bg-yellow-500';
        return 'bg-red-500';
    };
    return (<div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DevicePhoneMobileIcon className="h-8 w-8 text-pink-500"/>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mobile Testing Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive mobile compliance and performance testing
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button onClick={runQuickCheck} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
              <ChartBarIcon className="h-4 w-4"/>
              <span>Quick Check</span>
            </button>
            
            <button onClick={runTests} disabled={isRunning} className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2 disabled:opacity-50">
              <PlayIcon className="h-4 w-4"/>
              <span>{isRunning ? 'Running...' : 'Run Full Test'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isRunning && (<div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Running comprehensive tests...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div className="bg-pink-500 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}/>
            </div>
          </div>)}
      </div>

      {/* Quick Check Results */}
      {quickCheck && (<div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <ChartBarIcon className="h-5 w-5 text-blue-500"/>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Health Check</h3>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full ${getScoreBg(quickCheck.score)} flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">{quickCheck.score}</span>
            </div>
            
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">
                Mobile Health Score: {quickCheck.score}/100
              </p>
              {quickCheck.issues.length > 0 ? (<div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Issues found:</p>
                  <ul className="space-y-1">
                    {quickCheck.issues.map((issue, index) => (<li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
                        <ExclamationTriangleIcon className="h-4 w-4"/>
                        <span>{issue}</span>
                      </li>))}
                  </ul>
                </div>) : (<p className="text-sm text-green-600 dark:text-green-400">No issues detected!</p>)}
            </div>
          </div>
        </div>)}

      {/* Test Results */}
      {results && (<>
          {/* Overall Score */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Mobile Compliance</h3>
                <p className="text-gray-600 dark:text-gray-400">Comprehensive test results</p>
              </div>
              
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                  {results.overallScore}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'touch', label: 'Touch Targets', icon: DevicePhoneMobileIcon },
                { id: 'responsive', label: 'Responsive', icon: CpuChipIcon },
                { id: 'performance', label: 'Performance', icon: CpuChipIcon },
                { id: 'accessibility', label: 'Accessibility', icon: EyeIcon },
                { id: 'safe-areas', label: 'Safe Areas', icon: ShieldCheckIcon },
            ].map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
                <tab.icon className="h-4 w-4"/>
                <span>{tab.label}</span>
              </button>))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                {activeTab === 'overview' && <OverviewTab results={results}/>}
                {activeTab === 'touch' && <TouchTargetsTab results={results.touchTargets}/>}
                {activeTab === 'responsive' && <ResponsiveTab results={results.responsiveDesign}/>}
                {activeTab === 'performance' && <PerformanceTab results={results.performance}/>}
                {activeTab === 'accessibility' && <AccessibilityTab results={results.accessibility}/>}
                {activeTab === 'safe-areas' && <SafeAreasTab results={results.safeAreas}/>}
              </motion.div>
            </AnimatePresence>
          </div>
        </>)}
    </div>);
}
// Tab Components
function OverviewTab({ results }) {
    const categories = [
        {
            name: 'Touch Targets',
            score: results.touchTargets.length > 0
                ? Math.round((results.touchTargets.filter(t => t.meetsMinimum).length / results.touchTargets.length) * 100)
                : 100,
            total: results.touchTargets.length,
            passed: results.touchTargets.filter(t => t.meetsMinimum).length,
            icon: DevicePhoneMobileIcon,
        },
        {
            name: 'Responsive Design',
            score: results.responsiveDesign.length > 0
                ? Math.round((results.responsiveDesign.filter(r => !r.layoutBroken).length / results.responsiveDesign.length) * 100)
                : 100,
            total: results.responsiveDesign.length,
            passed: results.responsiveDesign.filter(r => !r.layoutBroken).length,
            icon: CpuChipIcon,
        },
        {
            name: 'Performance',
            score: results.performance.length > 0
                ? Math.round((results.performance.filter(p => p.passed).length / results.performance.length) * 100)
                : 100,
            total: results.performance.length,
            passed: results.performance.filter(p => p.passed).length,
            icon: CpuChipIcon,
        },
        {
            name: 'Accessibility',
            score: results.accessibility.length > 0
                ? Math.round((results.accessibility.filter(a => a.passed).length / results.accessibility.length) * 100)
                : 100,
            total: results.accessibility.length,
            passed: results.accessibility.filter(a => a.passed).length,
            icon: EyeIcon,
        },
        {
            name: 'Safe Areas',
            score: results.safeAreas.length > 0
                ? Math.round((results.safeAreas.filter(s => s.properlyHandled).length / results.safeAreas.length) * 100)
                : 100,
            total: results.safeAreas.length,
            passed: results.safeAreas.filter(s => s.properlyHandled).length,
            icon: ShieldCheckIcon,
        },
    ];
    return (<div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Categories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (<div key={category.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <category.icon className="h-5 w-5 text-pink-500"/>
                  <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                </div>
                <span className={`text-lg font-bold ${category.score >= 90 ? 'text-green-500' :
                category.score >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {category.score}%
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {category.passed}/{category.total} tests passed
              </div>
            </div>))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h4>
        <div className="space-y-2">
          {results.recommendations.map((rec, index) => (<div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5"/>
              <p className="text-sm text-blue-800 dark:text-blue-200">{rec}</p>
            </div>))}
        </div>
      </div>
    </div>);
}
function TouchTargetsTab({ results }) {
    return (<div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Touch Target Analysis</h4>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {results.filter(t => t.meetsMinimum).length}/{results.length} meet 44px minimum
        </span>
      </div>
      
      <div className="space-y-2">
        {results.map((test, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              {test.meetsMinimum ? (<CheckCircleIcon className="h-5 w-5 text-green-500"/>) : (<XCircleIcon className="h-5 w-5 text-red-500"/>)}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{test.element}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(test.size.width)}×{Math.round(test.size.height)}px
                </p>
              </div>
            </div>
            {test.recommendation && (<p className="text-sm text-red-600 dark:text-red-400 max-w-xs text-right">
                {test.recommendation}
              </p>)}
          </div>))}
      </div>
    </div>);
}
function ResponsiveTab({ results }) {
    return (<div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Responsive Design Analysis</h4>
      
      <div className="space-y-4">
        {results.map((test, index) => (<div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900 dark:text-white capitalize">{test.breakpoint}</h5>
              <div className="flex items-center space-x-2">
                {test.layoutBroken ? (<XCircleIcon className="h-5 w-5 text-red-500"/>) : (<CheckCircleIcon className="h-5 w-5 text-green-500"/>)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {test.viewport.width}×{test.viewport.height}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Visible Elements</p>
                <p className="font-medium text-gray-900 dark:text-white">{test.elementsVisible}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Hidden Elements</p>
                <p className="font-medium text-gray-900 dark:text-white">{test.elementsHidden}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Layout Status</p>
                <p className={`font-medium ${test.layoutBroken ? 'text-red-500' : 'text-green-500'}`}>
                  {test.layoutBroken ? 'Broken' : 'OK'}
                </p>
              </div>
            </div>
            
            {test.issues.length > 0 && (<div className="mt-3">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">Issues:</p>
                <ul className="space-y-1">
                  {test.issues.map((issue, issueIndex) => (<li key={issueIndex} className="text-sm text-red-600 dark:text-red-400">
                      • {issue}
                    </li>))}
                </ul>
              </div>)}
          </div>))}
      </div>
    </div>);
}
function PerformanceTab({ results }) {
    return (<div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h4>
      
      <div className="space-y-3">
        {results.map((test, index) => (<div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              {test.passed ? (<CheckCircleIcon className="h-5 w-5 text-green-500"/>) : (<XCircleIcon className="h-5 w-5 text-red-500"/>)}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{test.metric}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {test.value.toFixed(2)} / {test.threshold} ({test.impact} impact)
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${test.passed ? 'text-green-500' : 'text-red-500'}`}>
                {test.passed ? 'PASS' : 'FAIL'}
              </p>
            </div>
          </div>))}
      </div>
    </div>);
}
function AccessibilityTab({ results }) {
    const errors = results.filter(r => r.severity === 'error' && !r.passed);
    const warnings = results.filter(r => r.severity === 'warning' && !r.passed);
    const passed = results.filter(r => r.passed);
    return (<div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility Analysis</h4>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-green-500">{passed.length} passed</span>
          <span className="text-yellow-500">{warnings.length} warnings</span>
          <span className="text-red-500">{errors.length} errors</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {results.map((test, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              {test.passed ? (<CheckCircleIcon className="h-5 w-5 text-green-500"/>) : test.severity === 'error' ? (<XCircleIcon className="h-5 w-5 text-red-500"/>) : (<ExclamationTriangleIcon className="h-5 w-5 text-yellow-500"/>)}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{test.element}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{test.test}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{test.message}</p>
            </div>
          </div>))}
      </div>
    </div>);
}
function SafeAreasTab({ results }) {
    return (<div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Safe Area Analysis</h4>
      
      <div className="space-y-4">
        {results.map((test, index) => (<div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900 dark:text-white">{test.device}</h5>
              {test.properlyHandled ? (<CheckCircleIcon className="h-5 w-5 text-green-500"/>) : (<XCircleIcon className="h-5 w-5 text-red-500"/>)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Safe Area Insets</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  T:{test.insets.top} R:{test.insets.right} B:{test.insets.bottom} L:{test.insets.left}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Elements Affected</p>
                <p className="font-medium text-gray-900 dark:text-white">{test.elementsAffected}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <p className={`text-sm font-medium ${test.properlyHandled ? 'text-green-500' : 'text-red-500'}`}>
                {test.properlyHandled ? 'Properly handled' : 'Needs implementation'}
              </p>
            </div>
          </div>))}
      </div>
    </div>);
}
//# sourceMappingURL=MobileTestingDashboard.jsx.map