import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import React from 'react';
export const NotificationPrompt = ({ onEnable, onDismiss, }) => {
    return (<Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20" role="region" aria-labelledby="notification-prompt-heading" aria-live="polite">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <Shield className="h-5 w-5 text-blue-600" aria-hidden="true"/>
            </div>
            <div>
              <h3 id="notification-prompt-heading" className="font-semibold text-blue-900 dark:text-blue-100">
                Stay Updated!
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Get notified about new posts, activities, and messages from your community.
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={onDismiss} className="text-blue-600 hover:text-blue-800" aria-label="Dismiss notification prompt">
                Later
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" onClick={onEnable} className="bg-blue-600 hover:bg-blue-700 text-white" aria-label="Enable push notifications for community updates">
                Enable Notifications
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>);
};
//# sourceMappingURL=NotificationPrompt.jsx.map
//# sourceMappingURL=NotificationPrompt.jsx.map