import { Button } from '@/components/ui/button';
import { DialogComponent as Dialog, DialogContentComponent as DialogContent, DialogHeaderComponent as DialogHeader, DialogTitleComponent as DialogTitle, } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react';
export const ReportDialog = ({ isOpen, onClose, onSubmit, isSubmitting, reportReasons, selectedReason, onReasonChange, details, onDetailsChange, }) => {
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Reason for reporting
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => (<label key={reason.id} className="flex items-start space-x-3 cursor-pointer">
                  <input type="radio" name="report-reason" value={reason.id} checked={selectedReason === reason.id} onChange={(e) => onReasonChange(e.target.value)} className="mt-1"/>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{reason.label}</div>
                    <div className="text-xs text-gray-600">{reason.description}</div>
                  </div>
                </label>))}
            </div>
          </div>

          <div>
            <label htmlFor="report-details" className="text-sm font-medium mb-2 block">
              Additional details (optional)
            </label>
            <Textarea id="report-details" value={details} onChange={(e) => onDetailsChange(e.target.value)} placeholder="Provide any additional context..." className="min-h-[80px]"/>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={!selectedReason || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);
};
//# sourceMappingURL=ReportDialog.jsx.map
//# sourceMappingURL=ReportDialog.jsx.map