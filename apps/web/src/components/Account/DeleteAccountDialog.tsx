/**
 * Delete Account Dialog Component
 * GDPR Article 17 compliant - Right to erasure
 */
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogComponent, DialogContentComponent, DialogDescriptionComponent, DialogFooterComponent, DialogHeaderComponent, DialogTitleComponent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Download, Info, Shield } from 'lucide-react';
import React, { useState } from 'react';
class AccountService {
    apiUrl;
    constructor() {
        this.apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://api.pawfectmatch.com';
    }
    async requestDataExport(args, token) {
        const res = await fetch(`${this.apiUrl}/api/account/export-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(args),
        });
        if (!res.ok)
            throw new Error('Failed to request data export');
        return;
    }
    async requestAccountDeletion(args, token) {
        const res = await fetch(`${this.apiUrl}/api/account/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(args),
        });
        if (!res.ok)
            throw new Error('Failed to request account deletion');
        return await res.json();
    }
}
export function DeleteAccountDialog({ onOpenChange, userEmail, userId, onSuccess, }) {
    const [step, setStep] = useState('warning');
    const [reason, setReason] = useState('other');
    const [feedback, setFeedback] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [exportRequested, setExportRequested] = useState(false);
    const accountService = new AccountService(
    // No argument needed for constructor
    );
    const handleReset = () => {
        setStep('warning');
        setReason('other');
        setFeedback('');
        setConfirmEmail('');
        setTwoFactorCode('');
        setError(null);
        setExportRequested(false);
    };
    const handleExportData = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken') || '';
            await accountService.requestDataExport({
                userId,
                includeMessages: true,
                includePhotos: true,
                includeMatches: true,
                includeAnalytics: true,
                format: 'json',
            }, token);
            setExportRequested(true);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to request data export');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleDeleteAccount = async () => {
        if (confirmEmail !== userEmail) {
            setError('Email does not match. Please verify your email address.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken') || '';
            const response = await accountService.requestAccountDeletion({
                userId,
                reason,
                feedback: feedback ?? '',
                confirmEmail,
                twoFactorCode: twoFactorCode ?? '',
            }, token);
            // Show success message
            alert(`Account deletion scheduled for ${new Date(response.deletionScheduledDate).toLocaleDateString()}. ` +
                `You have until ${new Date(response.gracePeriodEndsAt).toLocaleDateString()} to cancel this request. ` +
                `Confirmation ID: ${response.confirmationId}`);
            onSuccess();
            onOpenChange(false);
            handleReset();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete account');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const renderWarningStep = () => (<>
      <DialogHeaderComponent>
        <DialogTitleComponent className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5"/>
          Delete Your Account
        </DialogTitleComponent>
        <DialogDescriptionComponent>
          This action will permanently delete your account and all associated data.
        </DialogDescriptionComponent>
      </DialogHeaderComponent>

      <div className="space-y-4 py-4">
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            <strong>Warning:</strong> This action cannot be undone after the 30-day grace period.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">What will be deleted:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>Your profile and all personal information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>All your pet profiles and photos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>All matches and conversations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>Subscription and payment history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>Activity history and analytics data</span>
            </li>
          </ul>
        </div>

        <Alert>
          <Shield className="h-4 w-4"/>
          <AlertDescription>
            <strong>30-Day Grace Period:</strong> Your account will be scheduled for deletion but
            you can cancel this request within 30 days.
          </AlertDescription>
        </Alert>
      </div>

      <DialogFooterComponent className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={() => setStep('export')}>
          Continue
        </Button>
      </DialogFooterComponent>
    </>);
    const renderExportStep = () => (<>
      <DialogHeaderComponent>
        <DialogTitleComponent className="flex items-center gap-2">
          <Download className="h-5 w-5"/>
          Download Your Data
        </DialogTitleComponent>
        <DialogDescriptionComponent>
          Before deleting your account, you can download a copy of your data (GDPR Right).
        </DialogDescriptionComponent>
      </DialogHeaderComponent>

      <div className="space-y-4 py-4">
        <Alert>
          <Info className="h-4 w-4"/>
          <AlertDescription>
            We recommend downloading your data before proceeding. This includes all your messages,
            photos, matches, and activity history in a machine-readable format.
          </AlertDescription>
        </Alert>

        {exportRequested && (<Alert className="bg-green-50 border-green-200">
            <Info className="h-4 w-4 text-green-600"/>
            <AlertDescription className="text-green-800">
              Data export requested! You will receive an email when your download is ready (usually
              within 48 hours).
            </AlertDescription>
          </Alert>)}

        {error && (<Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription>{error}</AlertDescription>
          </Alert>)}
      </div>

      <DialogFooterComponent className="gap-2">
        <Button variant="outline" onClick={() => setStep('warning')}>
          Back
        </Button>
        {!exportRequested && (<Button variant="outline" onClick={handleExportData} disabled={isProcessing} className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <Download className="h-4 w-4 mr-2"/>
            {isProcessing ? 'Requesting...' : 'Download My Data'}
          </Button>)}
        <Button variant="destructive" onClick={() => setStep('final')}>
          Skip & Continue
        </Button>
      </DialogFooterComponent>
    </>);
    const renderFinalStep = () => (<>
      <DialogHeaderComponent>
        <DialogTitleComponent className="text-red-600">Final Confirmation</DialogTitleComponent>
        <DialogDescriptionComponent>
          Please confirm your decision by providing the information below.
        </DialogDescriptionComponent>
      </DialogHeaderComponent>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="reason">Why are you leaving? (Optional)</Label>
          <Select value={reason} onValueChange={(value) => setReason(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="privacy">Privacy concerns</SelectItem>
              <SelectItem value="not_useful">Not useful anymore</SelectItem>
              <SelectItem value="too_expensive">Too expensive</SelectItem>
              <SelectItem value="found_match">Found a match</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
          <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Help us improve by sharing your experience..." rows={3}/>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmEmail">
            Confirm your email: <span className="text-red-500">*</span>
          </Label>
          <Input id="confirmEmail" type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder={userEmail} required/>
          {confirmEmail && confirmEmail !== userEmail && (<p className="text-sm text-red-500">Email does not match</p>)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="twoFactor">Two-Factor Code (if enabled)</Label>
          <Input id="twoFactor" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="000000" maxLength={6}/>
        </div>

        {error && (<Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription>{error}</AlertDescription>
          </Alert>)}

        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            By clicking &quot;Delete My Account&quot;, you acknowledge that this action will
            permanently delete your account after the 30-day grace period.
          </AlertDescription>
        </Alert>
      </div>

      <DialogFooterComponent className="gap-2">
        <Button variant="outline" onClick={() => setStep('export')}>
          Back
        </Button>
        <Button variant="destructive" onClick={handleDeleteAccount} disabled={isProcessing || !confirmEmail || confirmEmail !== userEmail}>
          {isProcessing ? 'Processing...' : 'Delete My Account'}
        </Button>
      </DialogFooterComponent>
    </>);
    return (<DialogComponent>
      <DialogContentComponent className="max-w-2xl">
        {step === 'warning' && renderWarningStep()}
        {step === 'export' && renderExportStep()}
        {step === 'final' && renderFinalStep()}
      </DialogContentComponent>
    </DialogComponent>);
}
//# sourceMappingURL=DeleteAccountDialog.jsx.map
//# sourceMappingURL=DeleteAccountDialog.jsx.map