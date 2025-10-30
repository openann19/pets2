/**
 * Deactivate Account Dialog Component
 * Temporary account suspension with optional auto-reactivation
 */
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogComponent, DialogContentComponent, DialogDescriptionComponent, DialogFooterComponent, DialogHeaderComponent, DialogTitleComponent, } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AccountService } from '@pawfectmatch/core';
import { PauseCircle } from 'lucide-react';
import { useState } from 'react';
export const DeactivateAccountDialog = ({ open, onOpenChange, userId, onSuccess, }) => {
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const apiBaseUrl = process.env['NEXT_PUBLIC_API_URL'] || '/api';
    const accountService = new AccountService(apiBaseUrl);
    const handleDeactivate = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken') || '';
            const request = {
                userId,
                reason: reason || '',
            };
            const response = await accountService.deactivateAccount(request, token);
            if (!response.success) {
                throw new Error(response.message || 'Failed to deactivate account');
            }
            alert(`Account deactivated successfully at ${new Date(response.deactivatedAt).toLocaleString()}. ` +
                (response.reactivationDate ? `Scheduled reactivation: ${new Date(response.reactivationDate).toLocaleDateString()}. ` : '') +
                `You can reactivate it anytime by logging back in.`);
            onSuccess();
            onOpenChange(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to deactivate account');
        }
        finally {
            setIsProcessing(false);
        }
    };
    if (!open)
        return null;
    return (<DialogComponent>
      <DialogContentComponent className="max-w-lg bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <DialogHeaderComponent>
          <DialogTitleComponent className="flex items-center gap-2 text-yellow-600">
            <PauseCircle className="h-5 w-5"/>
            Deactivate Your Account
          </DialogTitleComponent>
          <DialogDescriptionComponent>
            Your account will be temporarily hidden. You can reactivate it anytime by logging back in.
          </DialogDescriptionComponent>
        </DialogHeaderComponent>
        <Alert>
          <AlertDescription>
            <strong>What happens when you deactivate:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Your profile will be hidden from other users</li>
              <li>• Your matches will be preserved</li>
              <li>• You won&apos;t receive notifications</li>
              <li>• Your subscription will be paused</li>
              <li>• You can reactivate anytime by logging in</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="space-y-2 mt-4">
          <Label htmlFor="reason">Why are you deactivating? (Optional)</Label>
          <Textarea id="reason" value={reason} onChange={(e) => { setReason(e.target.value); }} placeholder="Taking a break, found a match, need time off, etc..." rows={3}/>
        </div>
        {error && (<Alert className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>)}
        <DialogFooterComponent className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700" onClick={handleDeactivate} disabled={isProcessing}>
            {isProcessing ? 'Deactivating...' : 'Deactivate Account'}
          </Button>
        </DialogFooterComponent>
      </DialogContentComponent>
    </DialogComponent>);
};
//# sourceMappingURL=DeactivateAccountDialog.jsx.map
//# sourceMappingURL=DeactivateAccountDialog.jsx.map