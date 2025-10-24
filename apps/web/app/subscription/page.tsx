'use client';

import React from 'react';
import { SubscriptionManager } from '../../src/components/Premium/SubscriptionManager';
import { motion } from 'framer-motion';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <SubscriptionManager />
      </motion.div>
    </div>
  );
}
