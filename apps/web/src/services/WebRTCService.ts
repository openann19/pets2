/**
 * WebRTC Service
 * Handles WebRTC connections, signaling, and media streams
 */
export class WebRTCService {
    peerConnection = null;
    localStream = null;
    remoteStream = null;
    screenShareStream = null;
    socket = null;
    roomId;
    userId;
    // Event handlers
    onLocalStream = () => { };
    onRemoteStream = () => { };
    onConnectionStateChange = () => { };
    onError = () => { };
    constructor(roomId, userId) {
        this.roomId = roomId;
        this.userId = userId;
        // Initialize socket connection for signaling
        this.initializeSignaling();
    }
    initializeSignaling() {
        // Simulate socket initialization
        this.socket = {
            emit: () => { },
            on: () => { }
        };
    }
    async connect() {
        try {
            // Create peer connection
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            // Add tracks to peer connection
            this.localStream.getTracks().forEach(track => {
                if (this.peerConnection && this.localStream) {
                    this.peerConnection.addTrack(track, this.localStream);
                }
            });
            // Set up event handlers for peer connection
            this.setupPeerConnectionEvents();
            // Notify about local stream
            this.onLocalStream(this.localStream);
        }
        catch (error) {
            this.onError(error instanceof Error ? error : new Error('Failed to establish connection'));
        }
    }
    setupPeerConnectionEvents() {
        if (!this.peerConnection)
            return;
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.socket) {
                this.socket.emit('ice-candidate', {
                    roomId: this.roomId,
                    userId: this.userId,
                    candidate: event.candidate
                });
            }
        };
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            if (this.peerConnection) {
                this.onConnectionStateChange(this.peerConnection.connectionState);
            }
        };
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
                this.onRemoteStream(this.remoteStream);
            }
        };
    }
    async startScreenSharing() {
        try {
            // Using properly typed getDisplayMedia API
            this.screenShareStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            if (this.peerConnection && this.localStream) {
                // Replace video track with screen share track
                const videoTrack = this.localStream.getVideoTracks()[0];
                const screenTrack = this.screenShareStream.getVideoTracks()[0];
                if (videoTrack && screenTrack) {
                    const senders = this.peerConnection.getSenders();
                    const sender = senders.find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                }
            }
        }
        catch (error) {
            this.onError(error instanceof Error ? error : new Error('Failed to start screen sharing'));
        }
    }
    stopScreenSharing() {
        if (!this.peerConnection || !this.localStream || !this.screenShareStream)
            return;
        // Stop all tracks in screen share stream
        this.screenShareStream.getTracks().forEach(track => track.stop());
        // Replace screen track with original video track
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            const senders = this.peerConnection.getSenders();
            const sender = senders.find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        }
        this.screenShareStream = null;
    }
    disconnect() {
        // Stop all tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.screenShareStream) {
            this.screenShareStream.getTracks().forEach(track => track.stop());
        }
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        // Reset streams
        this.localStream = null;
        this.remoteStream = null;
        this.screenShareStream = null;
        // Notify about disconnection
        this.onConnectionStateChange('disconnected');
    }
}
//# sourceMappingURL=WebRTCService.js.map