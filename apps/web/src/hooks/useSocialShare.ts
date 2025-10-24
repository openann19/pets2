/**
 * Social Share Hook
 * Handles sharing to various social platforms
 */
import { useState } from 'react';
import { logger } from '@/services/logger';
export function useSocialShare() {
    const [isSharing, setIsSharing] = useState(false);
    const shareToSocial = async (platform, data) => {
        setIsSharing(true);
        try {
            switch (platform) {
                case 'twitter':
                    await shareToTwitter(data);
                    break;
                case 'facebook':
                    await shareToFacebook(data);
                    break;
                case 'linkedin':
                    await shareToLinkedIn(data);
                    break;
                case 'whatsapp':
                    await shareToWhatsApp(data);
                    break;
                case 'telegram':
                    await shareToTelegram(data);
                    break;
                case 'copy':
                    await copyToClipboard(data);
                    break;
                case 'native':
                    await shareNative(data);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${platform}`);
            }
            // Track analytics
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'share', {
                    method: platform,
                    content_type: 'pet_profile',
                    item_id: data.url
                });
            }
            logger.info('Content shared successfully', { platform, url: data.url });
        }
        catch (error) {
            logger.error('Share failed', error);
            throw error;
        }
        finally {
            setIsSharing(false);
        }
    };
    const shareToTwitter = async (data) => {
        const text = encodeURIComponent(data.text);
        const url = encodeURIComponent(data.url);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    };
    const shareToFacebook = async (data) => {
        const url = encodeURIComponent(data.url);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        window.open(facebookUrl, '_blank', 'width=550,height=420');
    };
    const shareToLinkedIn = async (data) => {
        const url = encodeURIComponent(data.url);
        const title = encodeURIComponent(data.title);
        const summary = encodeURIComponent(data.text);
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
        window.open(linkedInUrl, '_blank', 'width=550,height=420');
    };
    const shareToWhatsApp = async (data) => {
        const text = encodeURIComponent(`${data.text} ${data.url}`);
        const whatsappUrl = `https://wa.me/?text=${text}`;
        window.open(whatsappUrl, '_blank');
    };
    const shareToTelegram = async (data) => {
        const text = encodeURIComponent(`${data.text} ${data.url}`);
        const telegramUrl = `https://t.me/share/url?url=${data.url}&text=${text}`;
        window.open(telegramUrl, '_blank');
    };
    const copyToClipboard = async (data) => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(data.url);
        }
        else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = data.url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
    };
    const shareNative = async (data) => {
        if (navigator.share) {
            await navigator.share({
                title: data.title,
                text: data.text,
                url: data.url
            });
        }
        else {
            // Fallback to copy
            await copyToClipboard(data);
        }
    };
    const getShareUrl = (platform, data) => {
        const encodedUrl = encodeURIComponent(data.url);
        const encodedText = encodeURIComponent(data.text);
        const encodedTitle = encodeURIComponent(data.title);
        switch (platform) {
            case 'twitter':
                return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            case 'linkedin':
                return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`;
            case 'whatsapp':
                return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
            case 'telegram':
                return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
            default:
                return data.url;
        }
    };
    const isNativeShareSupported = () => {
        return typeof navigator !== 'undefined' && !!navigator.share;
    };
    return {
        shareToSocial,
        getShareUrl,
        isNativeShareSupported,
        isSharing
    };
}
//# sourceMappingURL=useSocialShare.js.map