'use client';
import { CalendarIcon, ChatBubbleLeftRightIcon, HeartIcon, MapPinIcon, PhotoIcon, SparklesIcon, } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';
const MemoryWeave = ({ memories = [], onMemoryClick }) => {
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [timelineView, setTimelineView] = useState('all');
    // Mock data if no memories provided
    const displayMemories = useMemo(() => {
        if (memories.length > 0)
            return memories;
        // Generate sample memories
        return [
            {
                id: '1',
                type: 'conversation',
                content: 'First conversation about favorite dog parks',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                sentiment: 'positive',
                tags: ['parks', 'activities'],
            },
            {
                id: '2',
                type: 'milestone',
                content: 'Matched! Both love Golden Retrievers',
                timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                sentiment: 'positive',
                tags: ['match', 'breeds'],
            },
            {
                id: '3',
                type: 'photo',
                content: 'Shared first pet photos',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                sentiment: 'positive',
                tags: ['photos', 'sharing'],
            },
            {
                id: '4',
                type: 'location',
                content: 'Discussed meeting at Riverside Dog Park',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                sentiment: 'positive',
                tags: ['meetup', 'location'],
            },
            {
                id: '5',
                type: 'event',
                content: 'Planned first playdate for this weekend',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                sentiment: 'positive',
                tags: ['playdate', 'plans'],
            },
        ];
    }, [memories]);
    // Filter memories by timeline
    const filteredMemories = useMemo(() => {
        const now = Date.now();
        const filters = {
            all: () => true,
            week: (m) => now - m.timestamp.getTime() <= 7 * 24 * 60 * 60 * 1000,
            month: (m) => now - m.timestamp.getTime() <= 30 * 24 * 60 * 60 * 1000,
        };
        return displayMemories.filter(filters[timelineView]);
    }, [displayMemories, timelineView]);
    // Get icon for memory type
    const getMemoryIcon = (type) => {
        const icons = {
            conversation: ChatBubbleLeftRightIcon,
            event: CalendarIcon,
            milestone: HeartIcon,
            photo: PhotoIcon,
            location: MapPinIcon,
        };
        return icons[type];
    };
    // Get color for sentiment
    const getSentimentColor = (sentiment) => {
        const colors = {
            positive: 'from-green-50 to-emerald-50 border-green-200',
            neutral: 'from-gray-50 to-slate-50 border-gray-200',
            negative: 'from-red-50 to-rose-50 border-red-200',
        };
        switch (sentiment) {
            case 'positive':
                return colors.positive;
            case 'negative':
                return colors.negative;
            default:
                return colors.neutral;
        }
    };
    // Format relative time
    const formatRelativeTime = (date) => {
        const now = Date.now();
        const diff = now - date.getTime();
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        if (days === 0)
            return 'Today';
        if (days === 1)
            return 'Yesterday';
        if (days < 7)
            return `${days.toString()} days ago`;
        if (days < 30)
            return `${Math.floor(days / 7).toString()} weeks ago`;
        return `${Math.floor(days / 30).toString()} months ago`;
    };
    return (<div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <SparklesIcon className="h-6 w-6 text-white"/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Memory Weave</h2>
            <p className="text-sm text-gray-600">Your conversation journey</p>
          </div>
        </div>

        {/* Timeline Filter */}
        <div className="flex gap-2">
          {['all', 'week', 'month'].map((view) => (<button key={view} onClick={() => {
                setTimelineView(view);
            }} className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${timelineView === view
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}>
              {view === 'all' ? 'All Time' : `Past ${view}`}
            </button>))}
        </div>
      </div>

      {/* Memory Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
          <div className="text-2xl font-bold text-purple-900">{filteredMemories.length}</div>
          <div className="text-sm text-purple-600">Memories</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
          <div className="text-2xl font-bold text-blue-900">
            {filteredMemories.filter(m => m.type === 'conversation').length}
          </div>
          <div className="text-sm text-blue-600">Conversations</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="text-2xl font-bold text-green-900">
            {filteredMemories.filter(m => m.sentiment === 'positive').length}
          </div>
          <div className="text-sm text-green-600">Positive Moments</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-pink-200 to-transparent"/>

        {/* Memory Nodes */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredMemories.map((memory, index) => {
            const IconComponent = getMemoryIcon(memory.type);
            return (<motion.div key={memory.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="relative pl-20">
                  {/* Timeline Dot */}
                  <div className="absolute left-6 top-4 w-5 h-5 bg-white border-4 border-purple-500 rounded-full shadow"/>

                  {/* Memory Card */}
                  <motion.div whileHover={{ scale: 1.02 }} onClick={() => {
                    setSelectedMemory(memory);
                    onMemoryClick?.(memory);
                }} className={`
                      cursor-pointer rounded-lg border p-4 shadow-sm
                      bg-gradient-to-br ${getSentimentColor(memory.sentiment)}
                      hover:shadow-md transition-shadow
                    `}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                        <IconComponent className="h-5 w-5 text-purple-600"/>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                            {memory.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(memory.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {memory.content}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {memory.tags.map((tag) => (<span key={tag} className="inline-block px-2 py-0.5 bg-white bg-opacity-60 rounded text-xs text-gray-600">
                              #{tag}
                            </span>))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>);
        })}
          </AnimatePresence>

          {filteredMemories.length === 0 && (<div className="text-center py-12">
              <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3"/>
              <p className="text-gray-500">No memories in this timeframe yet</p>
              <p className="text-sm text-gray-400 mt-1">Start chatting to create memories!</p>
            </div>)}
        </div>
      </div>

      {/* Selected Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
                setSelectedMemory(null);
            }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => {
                e.stopPropagation();
            }} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                {React.createElement(getMemoryIcon(selectedMemory.type), {
                className: 'h-6 w-6 text-purple-600',
            })}
                <h3 className="text-lg font-bold text-gray-900">Memory Details</h3>
              </div>
              <div className="space-y-3">
                <p className="text-gray-900">{selectedMemory.content}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4"/>
                  <span>{selectedMemory.timestamp.toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  {selectedMemory.tags.map((tag) => (<span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      #{tag}
                    </span>))}
                </div>
              </div>
              <button onClick={() => {
                setSelectedMemory(null);
            }} className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
                Close
              </button>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
};
export default MemoryWeave;
//# sourceMappingURL=MemoryWeave.jsx.map