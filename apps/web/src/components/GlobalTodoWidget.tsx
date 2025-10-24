/**
 * 🚀 GLOBAL TODO WIDGET
 * Universal todo management component that can be used anywhere in the app
 */
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, CircleIcon, PlusIcon, MagnifyingGlassIcon, ChartBarIcon, ClockIcon, ExclamationTriangleIcon, CheckIcon, XMarkIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useGlobalTodos, TodoItem, TodoStats } from '@/hooks/useGlobalTodos';
import PremiumButton from './UI/PremiumButton';
import PremiumCard from './UI/PremiumCard';
export default function GlobalTodoWidget({ variant = 'compact', showStats = true, showCategories = true, maxHeight = '400px', className = '', }) {
    const { todos, categories, stats, loading, error, addTodo, toggleTodo, updateTodo, deleteTodo, searchTodos, getPendingTodos, getTodosByPriority, hasHighPriorityTasks, hasPendingTasks, } = useGlobalTodos();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newTodo, setNewTodo] = useState({
        description: '',
        category: 'UI/UX TASKS',
        priority: 'medium',
    });
    const filteredTodos = searchQuery ? searchTodos(searchQuery) : getPendingTodos();
    const highPriorityTodos = getTodosByPriority('high').filter(todo => !todo.completed);
    const handleAddTodo = async () => {
        if (!newTodo.description.trim())
            return;
        await addTodo(newTodo.description, newTodo.category, newTodo.priority);
        setNewTodo({ description: '', category: 'UI/UX TASKS', priority: 'medium' });
        setShowAddForm(false);
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return <ExclamationTriangleIcon className="w-4 h-4"/>;
            case 'medium': return <ClockIcon className="w-4 h-4"/>;
            case 'low': return <CheckIcon className="w-4 h-4"/>;
            default: return <CircleIcon className="w-4 h-4"/>;
        }
    };
    if (loading) {
        return (<PremiumCard className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </PremiumCard>);
    }
    if (error) {
        return (<PremiumCard className={`p-4 border-red-500/50 ${className}`}>
        <div className="text-red-400 text-sm">
          ❌ Error loading todos: {error}
        </div>
      </PremiumCard>);
    }
    // Minimal variant - just shows count and high priority tasks
    if (variant === 'minimal') {
        return (<motion.div className={`flex items-center gap-2 ${className}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <div className="flex items-center gap-1 text-sm">
          <ChartBarIcon className="w-4 h-4 text-blue-400"/>
          <span className="text-white">
            {stats.completed}/{stats.total}
          </span>
        </div>
        {hasHighPriorityTasks && (<div className="flex items-center gap-1">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-400"/>
            <span className="text-red-400 text-sm">{stats.highPriority}</span>
          </div>)}
      </motion.div>);
    }
    // Compact variant - shows summary with expand option
    if (variant === 'compact' && !isExpanded) {
        return (<PremiumCard className={`p-4 cursor-pointer ${className}`} onClick={() => setIsExpanded(true)} hover>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-5 h-5 text-blue-400"/>
            <div>
              <div className="text-white font-semibold">Project Progress</div>
              <div className="text-gray-400 text-sm">
                {stats.completed}/{stats.total} tasks completed ({stats.completionRate}%)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasHighPriorityTasks && (<div className="flex items-center gap-1 text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4"/>
                <span className="text-sm">{stats.highPriority}</span>
              </div>)}
            <div className="text-gray-400 text-sm">Click to expand</div>
          </div>
        </div>
      </PremiumCard>);
    }
    // Full variant or expanded compact
    return (<PremiumCard className={`p-6 ${className}`} glow>
      <div className="max-h-[400px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-blue-400"/>
            <h3 className="text-white font-bold text-lg">Global Todo List</h3>
          </div>
          <div className="flex items-center gap-2">
            {variant === 'compact' && (<button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white transition-colors">
                <XMarkIcon className="w-5 h-5"/>
              </button>)}
          </div>
        </div>

        {/* Stats */}
        {showStats && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.highPriority}</div>
              <div className="text-xs text-gray-400">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.completionRate}%</div>
              <div className="text-xs text-gray-400">Complete</div>
            </div>
          </div>)}

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Search todos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"/>
        </div>

        {/* Add Todo Form */}
        <AnimatePresence>
          {showAddForm && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="space-y-3">
                <input type="text" placeholder="Task description..." value={newTodo.description} onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"/>
                <div className="flex gap-2">
                  <select value={newTodo.category} onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })} className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-400">
                    <option value="UI/UX TASKS">UI/UX TASKS</option>
                    <option value="TECHNICAL TASKS">TECHNICAL TASKS</option>
                    <option value="TESTING & QUALITY ASSURANCE">TESTING & QUALITY ASSURANCE</option>
                    <option value="DEPLOYMENT & DEVOPS">DEPLOYMENT & DEVOPS</option>
                    <option value="MOBILE DEVELOPMENT">MOBILE DEVELOPMENT</option>
                  </select>
                  <select value={newTodo.priority} onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-400">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <PremiumButton onClick={handleAddTodo} size="sm" className="flex-1">
                    Add Task
                  </PremiumButton>
                  <PremiumButton onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                    Cancel
                  </PremiumButton>
                </div>
              </div>
            </motion.div>)}
        </AnimatePresence>

        {/* Todo List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {filteredTodos.slice(0, 10).map((todo) => (<motion.div key={todo.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                  {todo.completed ? (<CheckCircleIcon className="w-5 h-5 text-green-400"/>) : (<CircleIcon className="w-5 h-5 text-gray-400 hover:text-blue-400"/>)}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                    {todo.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{todo.category}</span>
                    <div className={`flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
                      {getPriorityIcon(todo.priority)}
                      <span className="text-xs capitalize">{todo.priority}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => deleteTodo(todo.id)} className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors">
                  <XMarkIcon className="w-4 h-4"/>
                </button>
              </motion.div>))}
          </AnimatePresence>
        </div>

        {/* Add Todo Button */}
        {!showAddForm && (<div className="mt-4">
            <PremiumButton onClick={() => setShowAddForm(true)} variant="outline" size="sm" className="w-full" icon={<PlusIcon className="w-4 h-4"/>}>
              Add New Task
            </PremiumButton>
          </div>)}
      </div>
    </PremiumCard>);
}
//# sourceMappingURL=GlobalTodoWidget.jsx.map