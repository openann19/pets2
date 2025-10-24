'use client';


import { SubscriptionManager } from '@/components/Premium/SubscriptionManager';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div>
        <SubscriptionManager />
      </div>
    </div>
  );
}
