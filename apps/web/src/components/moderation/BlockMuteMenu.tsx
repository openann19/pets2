"use client";
import PremiumButton from '@/components/ui/PremiumButton';
import { moderationToasts } from '@/lib/toast';
import { useBlockUser, useMuteUser, useUnblockUser, useUnmuteUser } from '@pawfectmatch/core/api';
import { useState } from 'react';
export function BlockMuteMenu({ userId, userName }) {
    const { mutateAsync: block, isPending: isBlocking } = useBlockUser();
    const { mutateAsync: mute, isPending: isMuting } = useMuteUser();
    const { mutateAsync: unblock, isPending: isUnblocking } = useUnblockUser();
    const { mutateAsync: unmute, isPending: isUnmuting } = useUnmuteUser();
    const [duration, setDuration] = useState(60);
    const handleBlock = async () => {
        try {
            await block({ blockedUserId: userId });
            moderationToasts.blockSuccess(userName);
        }
        catch (error) {
            moderationToasts.blockError();
        }
    };
    const handleUnblock = async () => {
        try {
            await unblock({ blockedUserId: userId });
            moderationToasts.unblockSuccess(userName);
        }
        catch (error) {
            moderationToasts.unblockError();
        }
    };
    const handleMute = async () => {
        try {
            await mute({ mutedUserId: userId, durationMinutes: duration });
            moderationToasts.muteSuccess(duration);
        }
        catch (error) {
            moderationToasts.muteError();
        }
    };
    const handleUnmute = async () => {
        try {
            await unmute({ mutedUserId: userId });
            moderationToasts.unmuteSuccess();
        }
        catch (error) {
            moderationToasts.unmuteError();
        }
    };
    return (<div className="flex gap-2 items-center">
            <PremiumButton variant="outline" disabled={isBlocking} onClick={handleBlock}>
                Block
            </PremiumButton>
            <PremiumButton variant="outline" disabled={isUnblocking} onClick={handleUnblock}>
                Unblock
            </PremiumButton>
            <input type="number" min={5} max={60 * 24 * 30} className="w-24 bg-white/10 border border-white/20 rounded p-2 text-black" value={duration} onChange={(e) => setDuration(Number(e.target.value))} aria-label="Mute duration in minutes"/>
            <PremiumButton variant="outline" disabled={isMuting} onClick={handleMute}>
                Mute
            </PremiumButton>
            <PremiumButton variant="outline" disabled={isUnmuting} onClick={handleUnmute}>
                Unmute
            </PremiumButton>
        </div>);
}
//# sourceMappingURL=BlockMuteMenu.jsx.map