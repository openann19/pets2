import { AnimatedButton } from '@/components/ui/animated-button';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Trash2, X } from 'lucide-react';
export const BulkActions = ({ selectedCount, onApprove, onReject, onDelete, onClear, isLoading = false, }) => {
    return (<AnimatePresence>
      {selectedCount > 0 && (<motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <GlassCard variant="heavy" blur="xl" className="px-6 py-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <motion.span key={selectedCount} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-sm font-semibold text-white">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
              </motion.span>

              <div className="flex items-center gap-2">
                <AnimatedButton size="sm" variant="primary" onClick={onApprove} disabled={isLoading} className="bg-green-500 hover:bg-green-600">
                  <Check className="h-4 w-4 mr-1"/>
                  Approve
                </AnimatedButton>

                <AnimatedButton size="sm" variant="secondary" onClick={onReject} disabled={isLoading} className="bg-red-500 hover:bg-red-600">
                  <X className="h-4 w-4 mr-1"/>
                  Reject
                </AnimatedButton>

                {onDelete && (<AnimatedButton size="sm" variant="ghost" onClick={onDelete} disabled={isLoading} className="text-white hover:bg-red-500/20">
                    <Trash2 className="h-4 w-4 mr-1"/>
                    Delete
                  </AnimatedButton>)}
              </div>

              <button onClick={onClear} disabled={isLoading} className="text-sm text-neutral-300 hover:text-white transition-colors ml-2">
                Clear
              </button>
            </div>
          </GlassCard>
        </motion.div>)}
    </AnimatePresence>);
};
//# sourceMappingURL=BulkActions.jsx.map
//# sourceMappingURL=BulkActions.jsx.map