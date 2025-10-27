'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, MapPinIcon, CalendarIcon, PlusIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, HeartIcon, } from '@heroicons/react/24/outline';
const PackGroupsManager = ({}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    // Sample pack groups data
    const [groups] = useState([
        {
            id: '1',
            name: 'Golden Retriever Enthusiasts',
            description: 'Weekly meetups for Golden lovers in the park',
            memberCount: 24,
            location: 'Central Park, NYC',
            nextMeetup: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            tags: ['golden-retrievers', 'playful', 'weekly'],
            isJoined: true,
        },
        {
            id: '2',
            name: 'Small Dog Social Club',
            description: 'Perfect for pups under 20lbs to socialize safely',
            memberCount: 18,
            location: 'Riverside Dog Park',
            nextMeetup: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            tags: ['small-dogs', 'social', 'friendly'],
            isJoined: false,
        },
        {
            id: '3',
            name: 'Hiking Hounds',
            description: 'Adventure-loving dogs and their humans',
            memberCount: 32,
            location: 'Various trails',
            nextMeetup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            tags: ['hiking', 'active', 'outdoor'],
            isJoined: true,
        },
        {
            id: '4',
            name: 'Puppy Training Group',
            description: 'For puppies 3-12 months learning social skills',
            memberCount: 15,
            location: 'Downtown Community Center',
            tags: ['puppies', 'training', 'beginners'],
            isJoined: false,
        },
    ]);
    const filteredGroups = groups.filter((group) => {
        const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' ||
            (selectedCategory === 'joined' && group.isJoined) ||
            (selectedCategory === 'nearby');
        return matchesSearch && matchesCategory;
    });
    const formatDate = (date) => {
        const days = Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        if (days === 0)
            return 'Today';
        if (days === 1)
            return 'Tomorrow';
        return `In ${days} days`;
    };
    return (<div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
              <UserGroupIcon className="h-6 w-6 text-white"/>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pack Groups</h2>
              <p className="text-sm text-gray-600">Connect with other pet owners</p>
            </div>
          </div>
          <button onClick={() => { setShowCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-5 w-5"/>
            <span>Create Group</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            <input type="text" placeholder="Search groups..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); }} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
          </div>

          <div className="flex gap-2">
            {['all', 'nearby', 'joined'].map((category) => (<button key={category} onClick={() => { setSelectedCategory(category); }} className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
          <div className="text-2xl font-bold text-blue-900">{groups.filter(g => g.isJoined).length}</div>
          <div className="text-sm text-blue-600">Joined Groups</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="text-2xl font-bold text-green-900">{filteredGroups.length}</div>
          <div className="text-sm text-green-600">Available</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
          <div className="text-2xl font-bold text-purple-900">
            {groups.reduce((sum, g) => sum + g.memberCount, 0)}
          </div>
          <div className="text-sm text-purple-600">Total Members</div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredGroups.map((group) => (<motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Group Header */}
            <div className={`p-4 ${group.isJoined ? 'bg-gradient-to-r from-blue-50 to-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                {group.isJoined && (<span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                    Joined
                  </span>)}
              </div>
              <p className="text-sm text-gray-600">{group.description}</p>
            </div>

            {/* Group Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserGroupIcon className="h-4 w-4"/>
                <span>{group.memberCount} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4"/>
                <span>{group.location}</span>
              </div>
              {group.nextMeetup && (<div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4"/>
                  <span>Next meetup: {formatDate(group.nextMeetup)}</span>
                </div>)}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {group.tags.map((tag) => (<span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    #{tag}
                  </span>))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                {group.isJoined ? (<>
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <ChatBubbleLeftRightIcon className="h-4 w-4"/>
                      <span>Chat</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <HeartIcon className="h-4 w-4 text-gray-600"/>
                    </button>
                  </>) : (<button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <PlusIcon className="h-4 w-4"/>
                    <span>Join Group</span>
                  </button>)}
              </div>
            </div>
          </motion.div>))}
      </div>

      {filteredGroups.length === 0 && (<div className="text-center py-12">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button onClick={() => { setShowCreateModal(true); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create a New Group
          </button>
        </div>)}

      {/* Create Group Modal */}
      {showCreateModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowCreateModal(false); }}>
          <div onClick={(e) => { e.stopPropagation(); }} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Pack Group</h3>
            <p className="text-sm text-gray-600 mb-6">
              This feature is coming soon! You'll be able to create custom pack groups for your community.
            </p>
            <button onClick={() => { setShowCreateModal(false); }} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
              Close
            </button>
          </div>
        </div>)}
    </div>);
};
export default PackGroupsManager;
//# sourceMappingURL=PackGroupsManager.jsx.map