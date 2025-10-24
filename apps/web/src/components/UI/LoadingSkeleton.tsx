/**
 * LoadingSkeleton Components
 *
 * Beautiful skeleton loaders that match the shape of actual content
 */
import React from 'react';
import { motion } from 'framer-motion';
export function Skeleton({ className = '', variant = 'pulse' }) {
    return (<div className={`bg-gray-200 rounded ${variant === 'pulse' ? 'animate-pulse' : 'animate-shimmer'} ${className}`}/>);
}
// Card Skeleton
export function CardSkeleton({ count = 1 }) {
    return (<>
      {Array.from({ length: count }).map((_, i) => (<motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 space-y-4 shadow-lg border border-gray-100">
          <Skeleton className="h-48 w-full rounded-xl"/>
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4"/>
            <Skeleton className="h-4 w-full"/>
            <Skeleton className="h-4 w-5/6"/>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg"/>
            <Skeleton className="h-10 w-24 rounded-lg"/>
          </div>
        </motion.div>))}
    </>);
}
// Match Card Skeleton
export function MatchCardSkeleton({ count = 3 }) {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <Skeleton className="h-64 w-full"/>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full"/>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32"/>
                <Skeleton className="h-4 w-24"/>
              </div>
            </div>
            <Skeleton className="h-4 w-full"/>
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1 rounded-lg"/>
              <Skeleton className="h-10 w-10 rounded-lg"/>
              <Skeleton className="h-10 w-10 rounded-lg"/>
            </div>
          </div>
        </motion.div>))}
    </div>);
}
// Chat List Skeleton
export function ChatListSkeleton({ count = 5 }) {
    return (<div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (<motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100">
          <Skeleton className="h-14 w-14 rounded-full flex-shrink-0"/>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32"/>
            <Skeleton className="h-4 w-48"/>
          </div>
          <Skeleton className="h-4 w-12"/>
        </motion.div>))}
    </div>);
}
// Message Skeleton
export function MessageSkeleton({ count = 3, align = 'left' }) {
    return (<div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (<motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
          <div className="space-y-2 max-w-xs">
            <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-2xl`}/>
            <Skeleton className="h-3 w-16"/>
          </div>
        </motion.div>))}
    </div>);
}
// Dashboard Stats Skeleton
export function DashboardStatsSkeleton({ count = 4 }) {
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (<motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 space-y-3 shadow-lg border border-gray-100">
          <Skeleton className="h-10 w-10 rounded-lg"/>
          <Skeleton className="h-8 w-16"/>
          <Skeleton className="h-4 w-24"/>
        </motion.div>))}
    </div>);
}
// Table Row Skeleton
export function TableRowSkeleton({ count = 5, columns = 4 }) {
    return (<>
      {Array.from({ length: count }).map((_, i) => (<tr key={i} className="border-b border-gray-100">
          {Array.from({ length: columns }).map((_, j) => (<td key={j} className="px-6 py-4">
              <Skeleton className="h-5 w-full"/>
            </td>))}
        </tr>))}
    </>);
}
// Profile Skeleton
export function ProfileSkeleton() {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Skeleton className="h-32 w-32 rounded-full"/>
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-5 w-64"/>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-lg"/>
            <Skeleton className="h-10 w-32 rounded-lg"/>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <Skeleton className="h-6 w-32"/>
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-5/6"/>
          <Skeleton className="h-4 w-4/6"/>
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <Skeleton className="h-6 w-32"/>
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-4 w-5/6"/>
          <Skeleton className="h-4 w-4/6"/>
        </div>
      </div>
    </motion.div>);
}
//# sourceMappingURL=LoadingSkeleton.jsx.map
//# sourceMappingURL=LoadingSkeleton.jsx.map