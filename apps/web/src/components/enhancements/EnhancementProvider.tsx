/**
 * Enhancement Provider Component
 * Integrates all high-leverage enhancements into the app
 */
'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useSessionReplay } from '@/services/session-replay';
import { usePWAOffline } from '@/services/pwa-offline';
import { useGamification } from '@/services/gamification';
import { useFirebaseMessaging } from '@/services/firebase-messaging';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { TourLauncher } from '@/components/coach/TourLauncher';
import { PushNotificationSetup } from '@/components/notifications/PushNotificationSetup';
import { BadgeSystem } from '@/components/gamification/BadgeSystem';
import { CompactNameSuggestion } from '@/components/pets/NameSuggestionWidget';
import { CompactCompatibilityHeatMap } from '@/components/compatibility/CompatibilityHeatMap';
import { SuccessStoriesCarousel } from '@/components/stories/SuccessStoriesCarousel';
import { AutoEnhancePetPhoto } from '@/components/photos/PhotoEnhancement';
export function EnhancementProvider({ children, showFeedbackWidget = true, showTourLauncher = true, showPushNotifications = true, showGamification = true, showSuccessStories = true }) {
    const { user, isAuthenticated } = useAuthStore();
    const { setUser: setSessionUser, addEvent } = useSessionReplay();
    const { isOffline, pendingActions } = usePWAOffline();
    const { recordActivity } = useGamification(user?.id);
    const { requestPermission: requestNotificationPermission } = useFirebaseMessaging();
    // Initialize session replay with user data
    useEffect(() => {
        if (isAuthenticated && user) {
            setSessionUser(user.id, user.email, `${user.firstName} ${user.lastName}`);
            addEvent('user_login', {
                userId: user.id,
                email: user.email,
                timestamp: new Date().toISOString()
            });
        }
    }, [isAuthenticated, user, setSessionUser, addEvent]);
    // Track user activities for gamification
    useEffect(() => {
        if (isAuthenticated && user) {
            // Track daily login
            recordActivity({
                type: 'login',
                metadata: { timestamp: new Date().toISOString() }
            });
        }
    }, [isAuthenticated, user, recordActivity]);
    // Request notification permission on first visit
    useEffect(() => {
        if (isAuthenticated && showPushNotifications) {
            // Delay to avoid interrupting user flow
            const timer = setTimeout(() => {
                requestNotificationPermission();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, showPushNotifications, requestNotificationPermission]);
    return (<div className="relative">
      {/* Main App Content */}
      {children}

      {/* Enhancement Overlays */}
      {showFeedbackWidget && (<FeedbackWidget position="bottom-right"/>)}

      {showTourLauncher && isAuthenticated && (<TourLauncher className="fixed top-4 right-4 z-40" showOnFirstVisit={true}/>)}

      {/* Offline Indicator */}
      {isOffline && (<div className="fixed top-4 left-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"/>
            <span className="text-sm font-medium">Offline Mode</span>
            {pendingActions > 0 && (<span className="text-xs bg-yellow-600 px-2 py-1 rounded">
                {pendingActions} pending
              </span>)}
          </div>
        </div>)}

      {/* Push Notification Setup Modal */}
      {showPushNotifications && isAuthenticated && (<PushNotificationSetup className="fixed bottom-6 left-6 z-40 max-w-sm" showSkip={true}/>)}

      {/* Gamification Badge System */}
      {showGamification && isAuthenticated && user && (<div className="fixed bottom-6 right-6 z-40">
          <BadgeSystem userId={user.id} className="w-80" showStreaks={true} showLevel={true}/>
        </div>)}

      {/* Success Stories Carousel */}
      {showSuccessStories && (<div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-30">
          <SuccessStoriesCarousel className="w-80" autoPlay={true} autoPlayInterval={8000} showFeatured={true} maxStories={3}/>
        </div>)}
    </div>);
}
// HOC for wrapping pages with enhancements
export function withEnhancements(Component, options = {}) {
    return function EnhancedComponent(props) {
        return (<EnhancementProvider {...options}>
        <Component {...props}/>
      </EnhancementProvider>);
    };
}
// Hook for accessing enhancement features
export function useEnhancements() {
    const { user, isAuthenticated } = useAuthStore();
    const { isOffline, pendingActions, queueAction } = usePWAOffline();
    const { recordActivity } = useGamification(user?.id);
    const { addEvent, addIssue } = useSessionReplay();
    const { enhancePhoto, getOptimizedUrl } = usePhotoEnhancement();
    const { generateSuggestions } = useNameSuggestions();
    const trackSwipe = async (petId, action) => {
        // Track for gamification
        recordActivity({
            type: 'swipe',
            metadata: { petId, action, timestamp: new Date().toISOString() }
        });
        // Track for analytics
        addEvent('swipe_action', {
            petId,
            action,
            userId: user?.id,
            timestamp: new Date().toISOString()
        });
        // Queue for offline if needed
        if (isOffline) {
            await queueAction('swipe', { petId, action });
        }
    };
    const trackMatch = async (matchId, petId) => {
        // Track for gamification
        recordActivity({
            type: 'match',
            metadata: { matchId, petId, timestamp: new Date().toISOString() }
        });
        // Track for analytics
        addEvent('match_created', {
            matchId,
            petId,
            userId: user?.id,
            timestamp: new Date().toISOString()
        });
    };
    const trackChatMessage = async (chatId, message) => {
        // Track for gamification
        recordActivity({
            type: 'chat',
            metadata: { chatId, messageLength: message.length, timestamp: new Date().toISOString() }
        });
        // Track for analytics
        addEvent('chat_message', {
            chatId,
            messageLength: message.length,
            userId: user?.id,
            timestamp: new Date().toISOString()
        });
        // Queue for offline if needed
        if (isOffline) {
            await queueAction('message', { chatId, content: message });
        }
    };
    const enhancePetPhoto = async (imageUrl, petId) => {
        try {
            const result = await enhancePhoto(imageUrl, {
                autoColor: true,
                autoContrast: true,
                autoBrightness: true,
                autoSaturation: true,
                quality: 'auto',
                format: 'auto'
            });
            // Track photo enhancement
            addEvent('photo_enhanced', {
                petId,
                originalUrl: imageUrl,
                enhancedUrl: result?.enhancedUrl,
                userId: user?.id,
                timestamp: new Date().toISOString()
            });
            return result;
        }
        catch (error) {
            addIssue({
                type: 'photo_enhancement_error',
                message: error instanceof Error ? error.message : 'Photo enhancement failed',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    };
    const getPetNameSuggestions = async (petInfo) => {
        try {
            const suggestions = await generateSuggestions(petInfo, 10, ['classic', 'trendy', 'unique', 'cute']);
            // Track name suggestion usage
            addEvent('name_suggestions_generated', {
                petSpecies: petInfo.species,
                suggestionCount: suggestions?.suggestions?.length || 0,
                userId: user?.id,
                timestamp: new Date().toISOString()
            });
            return suggestions;
        }
        catch (error) {
            addIssue({
                type: 'name_suggestion_error',
                message: error instanceof Error ? error.message : 'Name suggestion failed',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    };
    return {
        // State
        isAuthenticated,
        isOffline,
        pendingActions,
        user,
        // Actions
        trackSwipe,
        trackMatch,
        trackChatMessage,
        enhancePetPhoto,
        getPetNameSuggestions,
        queueAction,
        recordActivity,
        addEvent,
        addIssue,
        // Utilities
        getOptimizedUrl
    };
}
export default EnhancementProvider;
//# sourceMappingURL=EnhancementProvider.jsx.map