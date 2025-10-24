/**
 * Share Button Component
 * Comprehensive sharing functionality with deep linking support
 */
import React, { useState } from 'react';
import { logger } from '@pawfectmatch/core';
;
import { useDeepLink } from '../../hooks/useDeepLink';
export default function ShareButton({ title, description, url, image, hashtags, via, className = '', children, onShare, }) {
    const { shareLink, copyToClipboard, openInNewTab } = useDeepLink();
    const [isSharing, setIsSharing] = useState(false);
    const handleShare = async () => {
        try {
            setIsSharing(true);
            await shareLink({
                title,
                description,
                url,
                image,
                hashtags,
                via,
            });
            onShare?.();
        }
        catch (error) {
            logger.error('Failed to share:', { error });
        }
        finally {
            setIsSharing(false);
        }
    };
    const handleCopyLink = async () => {
        try {
            await copyToClipboard(url);
        }
        catch (error) {
            logger.error('Failed to copy link:', { error });
        }
    };
    const handleOpenInNewTab = () => {
        openInNewTab(url);
    };
    return (<div className={`share-button ${className}`}>
      <button onClick={handleShare} disabled={isSharing} className="share-button__primary">
        {isSharing ? 'Sharing...' : 'Share'}
      </button>

      <div className="share-button__actions">
        <button onClick={handleCopyLink} className="share-button__action" title="Copy link">
          📋
        </button>

        <button onClick={handleOpenInNewTab} className="share-button__action" title="Open in new tab">
          🔗
        </button>
      </div>

      {children}
    </div>);
}
//# sourceMappingURL=ShareButton.jsx.map
//# sourceMappingURL=ShareButton.jsx.map