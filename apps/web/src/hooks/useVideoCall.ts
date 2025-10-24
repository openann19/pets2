/**
 * Video Call Hook
 * React hook for managing WebRTC video calling functionality
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { WebRTCService } from '../services/WebRTCService';
export const useVideoCall = (roomId, userId) => {
    const [state, setState] = useState({
        isConnected: false,
        isLoading: false,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isVideoEnabled: true,
        isScreenSharing: false,
        connectionQuality: 'disconnected',
        error: null,
    });
    const webRTCServiceRef = useRef(null);
    // Initialize WebRTC service
    useEffect(() => {
        const initWebRTC = async () => {
            try {
                webRTCServiceRef.current = new WebRTCService(roomId, userId);
                // Setup event handlers
                webRTCServiceRef.current.onLocalStream = (stream) => {
                    setState((prev) => ({ ...prev, localStream: stream }));
                };
                webRTCServiceRef.current.onRemoteStream = (stream) => {
                    setState((prev) => ({ ...prev, remoteStream: stream }));
                };
                webRTCServiceRef.current.onConnectionStateChange = (state) => {
                    setState((prev) => ({
                        ...prev,
                        isConnected: state === 'connected',
                        connectionQuality: state === 'connected' ? 'good' : 'disconnected'
                    }));
                };
                webRTCServiceRef.current.onError = (error) => {
                    setState((prev) => ({ ...prev, error }));
                };
            }
            catch (error) {
                setState((prev) => ({
                    ...prev,
                    error: error instanceof Error ? error : new Error('Failed to initialize WebRTC service')
                }));
            }
        };
        initWebRTC();
        return () => {
            // Clean up
            if (webRTCServiceRef.current) {
                webRTCServiceRef.current.disconnect();
            }
        };
    }, [roomId, userId]);
    // Start call
    const startCall = useCallback(async () => {
        if (!webRTCServiceRef.current)
            return;
        try {
            setState((prev) => ({ ...prev, isLoading: true }));
            await webRTCServiceRef.current.connect();
            setState((prev) => ({
                ...prev,
                isLoading: false,
                isConnected: true,
                isVideoEnabled: true,
                isMuted: false,
            }));
        }
        catch (error) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error : new Error('Failed to start call')
            }));
        }
    }, []);
    // End call
    const endCall = useCallback(() => {
        if (!webRTCServiceRef.current)
            return;
        webRTCServiceRef.current.disconnect();
        setState((prev) => ({
            ...prev,
            isConnected: false,
            isLoading: false,
            localStream: null,
            remoteStream: null,
            connectionQuality: 'disconnected'
        }));
    }, []);
    // Toggle video
    const toggleVideo = useCallback(() => {
        if (!webRTCServiceRef.current || !state.localStream)
            return;
        const videoTracks = state.localStream.getVideoTracks();
        if (videoTracks.length === 0)
            return;
        const videoTrack = videoTracks[0];
        if (!videoTrack)
            return;
        const enabled = !videoTrack.enabled;
        videoTracks.forEach(track => {
            track.enabled = enabled;
        });
        setState((prev) => ({ ...prev, isVideoEnabled: enabled }));
    }, [state.localStream]);
    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (!webRTCServiceRef.current || !state.localStream)
            return;
        const audioTracks = state.localStream.getAudioTracks();
        if (audioTracks.length === 0)
            return;
        const audioTrack = audioTracks[0];
        if (!audioTrack)
            return;
        const enabled = !audioTrack.enabled;
        audioTracks.forEach(track => {
            track.enabled = enabled;
        });
        setState((prev) => ({ ...prev, isMuted: !enabled }));
    }, [state.localStream]);
    // Start screen sharing
    const startScreenShare = useCallback(async () => {
        if (!webRTCServiceRef.current)
            return;
        try {
            await webRTCServiceRef.current.startScreenSharing();
            setState((prev) => ({ ...prev, isScreenSharing: true }));
        }
        catch (error) {
            setState((prev) => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to start screen sharing')
            }));
        }
    }, []);
    // Stop screen sharing
    const stopScreenShare = useCallback(() => {
        if (!webRTCServiceRef.current)
            return;
        webRTCServiceRef.current.stopScreenSharing();
        setState((prev) => ({ ...prev, isScreenSharing: false }));
    }, []);
    return {
        ...state,
        startCall,
        endCall,
        toggleVideo,
        toggleAudio,
        startScreenShare,
        stopScreenShare,
    };
};
//# sourceMappingURL=useVideoCall.js.map