"use client";
import { DialogComponent as Dialog, DialogContentComponent as DialogContent, DialogDescriptionComponent as DialogDescription, DialogHeaderComponent as DialogHeader, DialogTitleComponent as DialogTitle } from '@/components/ui/dialog';
import PremiumButton from '@/components/ui/PremiumButton';
import { moderationToasts } from '@/lib/toast';
import { useReportUser } from '@pawfectmatch/core/api';
import { useState } from 'react';
export function ReportDialog({ open, onOpenChange, targetId, category }) {
    const [type, setType] = useState('inappropriate_content');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const { mutateAsync, isPending } = useReportUser();
    const submit = async () => {
        try {
            const payload = { type, category, reason, description, targetId };
            await mutateAsync(payload);
            moderationToasts.reportSuccess();
            onOpenChange(false);
            // Reset form
            setReason('');
            setDescription('');
            setType('inappropriate_content');
        }
        catch (error) {
            moderationToasts.reportError();
        }
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report</DialogTitle>
                    <DialogDescription>Help us keep the community safe</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <label className="block text-sm">Type
                        <select className="mt-1 w-full bg-white/10 border border-white/20 rounded p-2" value={type} onChange={(e) => { setType(e.target.value); }}>
                            <option value="inappropriate_content">Inappropriate content</option>
                            <option value="harassment">Harassment</option>
                            <option value="spam">Spam</option>
                            <option value="fake_profile">Fake profile</option>
                            <option value="animal_abuse">Animal abuse</option>
                            <option value="scam">Scam</option>
                            <option value="inappropriate_behavior">Inappropriate behavior</option>
                            <option value="copyright_violation">Copyright violation</option>
                            <option value="other">Other</option>
                        </select>
                    </label>
                    <label className="block text-sm">Reason
                        <input className="mt-1 w-full bg-white/10 border border-white/20 rounded p-2" value={reason} onChange={(e) => { setReason(e.target.value); }} placeholder="Short reason"/>
                    </label>
                    <label className="block text-sm">Description (optional)
                        <textarea className="mt-1 w-full bg-white/10 border border-white/20 rounded p-2" value={description} onChange={(e) => { setDescription(e.target.value); }} rows={3}/>
                    </label>
                    <div className="flex gap-2 justify-end">
                        <PremiumButton variant="outline" onClick={() => onOpenChange(false)}>Cancel</PremiumButton>
                        <PremiumButton onClick={submit} disabled={isPending || !reason}>Submit</PremiumButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>);
}
//# sourceMappingURL=ReportDialog.jsx.map