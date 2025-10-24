/**
 * Video Call Service
 * Handles WebRTC connections and video call functionality
 */
import { api } from './api';
import { logger } from './logger';
class VideoCallService {
    peerConnection = null;
    localStream = null;
    /**
     * Initialize peer connection
     */
    initializePeerConnection() {
        try {
            const configuration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                ],
            };
            this.peerConnection = new RTCPeerConnection(configuration);
            return this.peerConnection;
        }
        catch (error) {
            logger.error('Failed to initialize peer connection', { error });
            throw error;
        }
    }
    /**
     * Get user media stream
     */
    async getUserMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: true,
            });
            this.localStream = stream;
            return stream;
        }
        catch (error) {
            logger.warn('Camera permission denied', { error });
            throw error;
        }
    }
    /**
     * Get screen share stream
     */
    async getScreenShareStream() {
        try {
            const mediaDevices = navigator.mediaDevices;
            const stream = await mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });
            return stream;
        }
        catch (error) {
            logger.info('Screen sharing cancelled by user', { error });
            throw error;
        }
    }
    /**
     * Toggle video track
     */
    toggleVideoTrack(stream) {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
            // Get the first track safely
            const firstTrack = videoTracks[0];
            if (firstTrack) {
                firstTrack.enabled = !firstTrack.enabled;
            }
        }
    }
    /**
     * Toggle audio track
     */
    toggleAudioTrack(stream) {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
            // Get the first track safely
            const firstTrack = audioTracks[0];
            if (firstTrack) {
                firstTrack.enabled = !firstTrack.enabled;
            }
        }
    }
    /**
     * Send offer to signaling server
     */
    async sendOffer(callId, offer) {
        try {
            return await api.videoCall.sendOffer(callId, offer);
        }
        catch (error) {
            logger.error('Failed to send offer', { error, callId });
            throw error;
        }
    }
    /**
     * Get answer from signaling server
     */
    async getAnswer(callId) {
        try {
            return await api.videoCall.getAnswer(callId);
        }
        catch (error) {
            logger.error('Failed to get answer', { error, callId });
            throw error;
        }
    }
    /**
     * Send ICE candidate
     */
    async sendIceCandidate(callId, candidate) {
        try {
            return await api.videoCall.sendIceCandidate(callId, candidate);
        }
        catch (error) {
            logger.error('Failed to send ICE candidate', { error, callId });
            throw error;
        }
    }
    /**
     * Create video call
     */
    async createCall(receiverId) {
        try {
            return await api.videoCall.createCall(receiverId);
        }
        catch (error) {
            logger.error('Failed to create video call', { error, receiverId });
            throw error;
        }
    }
    /**
     * Join video call
     */
    async joinCall(callId) {
        try {
            return await api.videoCall.joinCall(callId);
        }
        catch (error) {
            logger.error('Failed to join call', { error, callId });
            throw error;
        }
    }
    /**
     * End video call
     */
    async endCall(callId) {
        try {
            if (this.localStream) {
                // Get all tracks from video and audio tracks
                const videoTracks = this.localStream.getVideoTracks?.() || [];
                const audioTracks = this.localStream.getAudioTracks?.() || [];
                const allTracks = [...videoTracks, ...audioTracks];
                // Stop all tracks
                allTracks.forEach((track) => {
                    if (track && typeof track.stop === 'function') {
                        track.stop();
                    }
                });
                this.localStream = null;
            }
            if (this.peerConnection) {
                // Check if close method exists before calling it
                if (typeof this.peerConnection.close === 'function') {
                    this.peerConnection.close();
                }
                this.peerConnection = null;
            }
            return await api.videoCall.endCall(callId);
        }
        catch (error) {
            logger.error('Failed to end call', { error, callId });
            throw error;
        }
    }
    /**
     * Create offer
     */
    async createOffer() {
        try {
            if (!this.peerConnection) {
                throw new Error('Peer connection not initialized');
            }
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            return offer;
        }
        catch (error) {
            logger.error('Failed to create offer', { error });
            throw error;
        }
    }
    /**
     * Start recording
     */
    async startRecording(callId) {
        try {
            return await api.videoCall.startRecording(callId);
        }
        catch (error) {
            logger.warn('Recording permission denied', { error, callId });
            throw error;
        }
    }
    /**
     * Stop recording
     */
    async stopRecording(callId) {
        try {
            return await api.videoCall.stopRecording(callId);
        }
        catch (error) {
            logger.error('Failed to stop recording', { error, callId });
            throw error;
        }
    }
}
export const videoCallService = new VideoCallService();
export default videoCallService;
//# sourceMappingURL=VideoCallService.js.map