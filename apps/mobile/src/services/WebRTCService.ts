// eslint-disable-next-line @typescript-eslint/no-require-imports
import { EventEmitter } from 'events';

import InCallManager from 'react-native-incall-manager';
import type { MediaStream } from 'react-native-webrtc';
import {
  RTCPeerConnection,
  RTCIceCandidate as RTCIceCandidateImpl,
  RTCSessionDescription as RTCSessionDescriptionImpl,
  mediaDevices,
} from 'react-native-webrtc';

import { logger } from './logger';
import { useAuthStore } from '../stores/useAuthStore';
import { hasNativeCameraSwitch } from '../types/native-webrtc';
import {
  checkMediaPermissions,
  showPermissionDeniedDialog,
  PermissionDeniedError,
} from './mediaPermissions';
import { preCallDeviceCheck, type DeviceCheckResult } from './PreCallDeviceCheckService';

// Extended RTCIceServer with React Native WebRTC compatibility
interface ExtendedRTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// Media constraints type for React Native WebRTC
interface MediaStreamConstraints {
  video?:
    | boolean
    | {
        width?: { min?: number; ideal?: number; max?: number };
        height?: { min?: number; ideal?: number; max?: number };
        frameRate?: { min?: number; ideal?: number; max?: number };
      };
  audio?: boolean | {
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
  };
}

// Type-safe video track with extended methods for React Native WebRTC
interface MediaStreamTrackWithSwitchCamera {
  _switchCamera?: () => void;
  enabled: boolean;
  id: string;
  kind: string;
  label: string;
  muted: boolean;
  readyState: MediaStreamTrackState;
}

export interface CallData {
  callId: string;
  matchId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  timestamp: number;
}

export type NetworkQuality = 'poor' | 'ok' | 'good';

export interface NetworkStats {
  bitrate: number; // kbps
  packetLoss: number; // percentage
  jitter: number; // ms
  rtt: number; // ms
  quality: NetworkQuality;
}

export interface CallState {
  isActive: boolean;
  isConnected: boolean;
  isIncoming: boolean;
  callData?: CallData;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  isMuted: boolean;
  isVideoEnabled: boolean;
  callDuration: number;
  networkQuality?: NetworkQuality;
  networkStats?: NetworkStats;
  videoQuality: '720p' | '480p' | 'audio-only';
}

export interface WebRTCSignalingData {
  callId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface CallAnsweredData {
  callId: string;
  accepted: boolean;
}

class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: {
    emit: (event: string, data: unknown) => void;
    on: (event: string, handler: (data: unknown) => void) => void;
  } | null = null;
  private currentCallId: string | null = null;
  private callStartTime = 0;

  // STUN/TURN configuration with environment support
  private readonly rtcConfiguration = {
    iceServers: (() => {
      const servers: ExtendedRTCIceServer[] = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ];

      // Add TURN servers from environment if configured
      const turnUrl = process.env['EXPO_PUBLIC_TURN_SERVER_URL'];
      const turnUsername = process.env['EXPO_PUBLIC_TURN_USERNAME'];
      const turnCredential = process.env['EXPO_PUBLIC_TURN_CREDENTIAL'];

      if (turnUrl && turnUsername && turnCredential) {
        const turnServer: ExtendedRTCIceServer = {
          urls: turnUrl,
          username: turnUsername,
          credential: turnCredential,
        };
        servers.push(turnServer);
        logger.info('TURN server configured', { url: turnUrl });
      } else {
        logger.warn('No TURN server configured. Calls may fail across NAT/firewalls.');
      }

      return servers;
    })(),
    iceCandidatePoolSize: 10,
  };

  private callState: CallState = {
    isActive: false,
    isConnected: false,
    isIncoming: false,
    isMuted: false,
    isVideoEnabled: true,
    callDuration: 0,
    videoQuality: '720p',
  };

  // Network quality monitoring
  private networkQualityInterval: ReturnType<typeof setInterval> | null = null;
  private iceConnectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectionAttempts = 0;
  private readonly maxReconnectionAttempts = 5;
  private readonly iceTimeoutMs = 30000; // 30 seconds
  private readonly networkCheckIntervalMs = 5000; // Check every 5 seconds
  constructor() {
    super();
    this.setupInCallManager();
  }

  private setupInCallManager() {
    // const audioEnabled = true; // Default assumption
    try {
      if (typeof InCallManager.setKeepScreenOn === 'function') {
        InCallManager.setKeepScreenOn(true);
        InCallManager.setForceSpeakerphoneOn(false);
      }
    } catch (error) {
      logger.warn('InCallManager not available', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private setupSocketListeners() {
    if (this.socket === null) return;

    // Incoming call
    this.socket.on('incoming-call', (callData: unknown) => {
      this.handleIncomingCall(callData as CallData);
    });

    // Call answered
    this.socket.on('call-answered', (data: unknown) => {
      void this.handleCallAnswered(data as CallAnsweredData);
    });

    // Call rejected/ended
    this.socket.on('call-ended', () => {
      this.endCall();
    });

    // WebRTC signaling
    this.socket.on('webrtc-offer', (data: unknown) => {
      void this.handleOffer(data as WebRTCSignalingData);
    });

    this.socket.on('webrtc-answer', (data: unknown) => {
      void this.handleAnswer(data as WebRTCSignalingData);
    });

    this.socket.on('webrtc-ice-candidate', (data: unknown) => {
      void this.handleIceCandidate(data as WebRTCSignalingData);
    });
  }

  // Start a call
  async startCall(matchId: string, callType: 'voice' | 'video'): Promise<boolean> {
    try {
      // Perform pre-call device checks
      const deviceCheckResult: DeviceCheckResult = await preCallDeviceCheck.performPreCallCheck({
        checkCamera: callType === 'video',
        checkMicrophone: true,
        checkNetwork: true,
        checkAudioOutput: true,
        minNetworkQuality: 'fair',
        timeout: 10000,
      });

      // Log device check results
      logger.info('Pre-call device check completed', {
        allChecksPassed: deviceCheckResult.allChecksPassed,
        blockingIssues: deviceCheckResult.blockingIssues,
        warnings: deviceCheckResult.warnings,
      });

      // If device checks failed, emit error and return
      if (!deviceCheckResult.allChecksPassed) {
        const error = new Error(
          `Device check failed: ${deviceCheckResult.blockingIssues.join(', ')}\nWarnings: ${deviceCheckResult.warnings.join(', ')}`
        );
        this.emit('callError', error);
        this.emit('deviceCheckFailed', deviceCheckResult);
        return false;
      }

      // Emit device check success for UI feedback
      this.emit('deviceCheckPassed', deviceCheckResult);

      // Check permissions before requesting media
      const permissions = await checkMediaPermissions(callType === 'video');
      if (!permissions.allGranted) {
        const deniedTypes: Array<'audio' | 'video'> = [];
        if (!permissions.audio.granted) deniedTypes.push('audio');
        if (!permissions.video.granted && callType === 'video') deniedTypes.push('video');
        
        const type = deniedTypes.length === 2 ? 'both' : deniedTypes[0] ?? 'audio';
        showPermissionDeniedDialog(type);
        
        const error = new PermissionDeniedError(
          type,
          `Permission denied: ${deniedTypes.join(', ')}`,
        );
        this.emit('callError', error);
        return false;
      }

      // Get user media with AEC/AGC/NS enabled
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          callType === 'video'
            ? {
                width: { min: 640, ideal: 1280 },
                height: { min: 480, ideal: 720 },
                frameRate: { min: 16, ideal: 30 },
              }
            : false,
      };

      // Type assertion needed for react-native-webrtc compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.localStream = await mediaDevices.getUserMedia(constraints as any);

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);
      this.setupPeerConnectionListeners();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection !== null && this.localStream !== null) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Create and send call offer
      const callId = `call_${String(Date.now())}_${Math.random().toString(36).substring(2, 11)}`;
      this.currentCallId = callId;

      // Get user data from auth store
      const { user } = useAuthStore.getState();
      const callerId = user?._id ?? user?.id ?? 'unknown';
      const callerName = user?.firstName ?? 'Unknown User';

      const callData: CallData = {
        callId,
        matchId,
        callerId,
        callerName,
        callType,
        timestamp: Date.now(),
      };

      // Update call state
      this.callState = {
        ...this.callState,
        isActive: true,
        isIncoming: false,
        callData,
        localStream: this.localStream,
      };

      // Emit call initiation
      if (this.socket !== null) {
        this.socket.emit('initiate-call', callData);
      }
      this.emit('callStateChanged', this.callState);

      if (typeof InCallManager.start === 'function') {
        InCallManager.start({
          media: callType === 'video' ? 'video' : 'audio',
        });
      }

      return true;
    } catch (error) {
      logger.error('Error starting call', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      this.emit('callError', error);
      return false;
    }
  }

  // Answer incoming call
  async answerCall(): Promise<boolean> {
    try {
      if (this.callState.callData === undefined) return false;

      const callType = this.callState.callData.callType;
      
      // Check permissions before requesting media
      const permissions = await checkMediaPermissions(callType === 'video');
      if (!permissions.allGranted) {
        const deniedTypes: Array<'audio' | 'video'> = [];
        if (!permissions.audio.granted) deniedTypes.push('audio');
        if (!permissions.video.granted && callType === 'video') deniedTypes.push('video');
        
        const type = deniedTypes.length === 2 ? 'both' : deniedTypes[0] ?? 'audio';
        showPermissionDeniedDialog(type);
        
        const error = new PermissionDeniedError(
          type,
          `Permission denied: ${deniedTypes.join(', ')}`,
        );
        this.emit('callError', error);
        return false;
      }

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          callType === 'video'
            ? {
                width: { min: 640, ideal: 1280 },
                height: { min: 480, ideal: 720 },
                frameRate: { min: 16, ideal: 30 },
              }
            : false,
      };

      // Type assertion needed for react-native-webrtc compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.localStream = await mediaDevices.getUserMedia(constraints as any);

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);
      this.setupPeerConnectionListeners();

      // Add local stream
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection !== null && this.localStream !== null) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Update state
      this.callState = {
        ...this.callState,
        isActive: true,
        isIncoming: false,
        localStream: this.localStream,
      };

      // Notify caller that call was answered
      if (this.callState.callData !== undefined) {
        if (this.socket !== null) {
          this.socket.emit('answer-call', {
            callId: this.currentCallId,
            matchId: this.callState.callData.matchId,
          });
        }
      }

      this.emit('callStateChanged', this.callState);
      this.startCallTimer();

      if (this.callState.callData !== undefined) {
        if (typeof InCallManager.start === 'function') {
          InCallManager.start({
            media: this.callState.callData.callType === 'video' ? 'video' : 'audio',
          });
        }
      }

      return true;
    } catch (error) {
      logger.error('Error answering call', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      this.emit('callError', error);
      return false;
    }
  }

  // Reject incoming call
  rejectCall() {
    if (this.callState.callData !== undefined) {
      if (this.socket !== null) {
        this.socket.emit('reject-call', {
          callId: this.callState.callData.callId,
          matchId: this.callState.callData.matchId,
        });
      }
    }
    this.endCall();
  }

  // End active call
  endCall() {
    // Clean up network monitoring
    this.stopNetworkQualityMonitoring();
    this.clearIceTimeout();
    this.reconnectionAttempts = 0;

    // Clean up peer connection
    if (this.peerConnection !== null) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    try {
      if (this.localStream !== null) {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.localStream = null;
      }
    } catch (error) {
      logger.error('Error ending local stream', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    // Stop remote stream
    try {
      if (this.remoteStream !== null) {
        this.remoteStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.remoteStream = null;
      }
    } catch (error) {
      logger.error('Error ending remote stream', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    // Reset call state
    this.callState = {
      isActive: false,
      isConnected: false,
      isIncoming: false,
      isMuted: false,
      isVideoEnabled: true,
      callDuration: 0,
      videoQuality: '720p',
    };

    // Notify socket
    if (this.currentCallId !== null) {
      if (this.socket !== null) {
        this.socket.emit('end-call', { callId: this.currentCallId });
      }
    }

    this.currentCallId = null;
    this.callStartTime = 0;

    // Stop InCallManager
    if (typeof InCallManager.stop === 'function') {
      InCallManager.stop();
    }

    this.emit('callStateChanged', this.callState);
  }

  // Toggle mute
  toggleMute() {
    if (this.localStream !== null) {
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];
        if (audioTrack !== undefined) {
          audioTrack.enabled = !audioTrack.enabled;
          this.callState.isMuted = !audioTrack.enabled;
          this.emit('callStateChanged', this.callState);
        }
      }
    }
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream !== null) {
      const videoTracks = this.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0];
        if (videoTrack !== undefined) {
          videoTrack.enabled = !videoTrack.enabled;
          this.callState.isVideoEnabled = videoTrack.enabled;
          this.emit('callStateChanged', this.callState);
        }
      }
    }
  }

  // Switch camera (front/back)
  switchCamera() {
    if (this.localStream !== null) {
      const videoTracks = this.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0];
        if (videoTrack && hasNativeCameraSwitch(videoTrack)) {
          videoTrack._switchCamera();
        }
      }
    }
  }

  // Toggle speaker
  toggleSpeaker() {
    // State managed by InCallManager internally
    if (typeof InCallManager.setForceSpeakerphoneOn === 'function') {
      InCallManager.setForceSpeakerphoneOn(true);
    }
  }

  // Private methods for WebRTC signaling
  private setupPeerConnectionListeners() {
    if (this.peerConnection === null) return;

    // Type assertion for react-native-webrtc compatibility
    // The library supports event handlers but types don't match exactly
    const peerConnection = this.peerConnection as RTCPeerConnection & {
      onicecandidate: ((event: RTCPeerConnectionIceEvent | null) => void) | null;
      ontrack: ((event: RTCTrackEvent) => void) | null;
      onconnectionstatechange: (() => void) | null;
    };

    // ICE candidate handler - typed properly
    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent | null) => {
      if (event !== null && event.candidate !== null && event.candidate !== undefined) {
        if (this.socket !== null) {
          this.socket.emit('webrtc-ice-candidate', {
            callId: this.currentCallId,
            candidate: event.candidate,
          });
        }
      }
    };

    // Track handler - typed properly
    peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (event.streams && event.streams.length > 0) {
        // Cast to React Native WebRTC MediaStream type
        // Using double cast to bridge browser WebRTC and React Native WebRTC types
        const stream = event.streams[0] as unknown as MediaStream;
        if (stream !== undefined && stream !== null) {
          this.remoteStream = stream;
          this.callState.remoteStream = stream;
          this.emit('callStateChanged', this.callState);
        }
      }
    };

      // Connection state change handler - typed properly
      peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        if (state === 'connected') {
          this.callState.isConnected = true;
          this.reconnectionAttempts = 0;
          this.clearIceTimeout();
          this.startCallTimer();
          this.startNetworkQualityMonitoring();
          this.emit('callStateChanged', this.callState);
        } else if (state === 'disconnected') {
          // Attempt reconnection for transient network loss
          void this.handleDisconnection();
        } else if (state === 'failed') {
          this.handleConnectionFailure();
        }
      };

    // Additional event listeners for comprehensive state tracking
    // Using type assertion for optional handlers
    const extendedPeerConnection = this.peerConnection as RTCPeerConnection & {
      oniceconnectionstatechange?: (() => void) | null;
      onicegatheringstatechange?: (() => void) | null;
    };

    extendedPeerConnection.oniceconnectionstatechange = () => {
      const iceState = this.peerConnection?.iceConnectionState;
      logger.debug('ICE connection state changed', { state: iceState });

      if (iceState === 'connected' || iceState === 'completed') {
        this.clearIceTimeout();
      } else if (iceState === 'checking') {
        // Set timeout for ICE connection
        this.setIceTimeout();
      } else if (iceState === 'failed') {
        this.clearIceTimeout();
        logger.error('ICE connection failed');
        this.emit('callError', new Error('ICE connection failed'));
        void this.attemptReconnection();
      }
    };

    extendedPeerConnection.onicegatheringstatechange = () => {
      const gatheringState = this.peerConnection?.iceGatheringState;
      logger.debug('ICE gathering state changed', { state: gatheringState });
    };
  }

  private handleIncomingCall(callData: CallData) {
    this.currentCallId = callData.callId;
    this.callState = {
      ...this.callState,
      isActive: true,
      isIncoming: true,
      callData,
    };

    // InCallManager.displayIncomingCall not available in current version
    // Using start for incoming call notification
    if (typeof InCallManager.start === 'function') {
      InCallManager.start({
        media: callData.callType === 'video' ? 'video' : 'audio',
        ringback: '_DTMF_',
      });
    }
    this.emit('callStateChanged', this.callState);
  }

  private async handleCallAnswered(data: CallAnsweredData) {
    // Create offer when call is answered
    if (this.peerConnection !== null && data.accepted) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      if (this.socket !== null) {
        this.socket.emit('webrtc-offer', {
          callId: this.currentCallId,
          offer: offer,
        });
      }
    }
  }

  private async handleOffer(data: WebRTCSignalingData) {
    if (this.peerConnection !== null) {
      if (data.offer !== undefined) {
        const offer = new RTCSessionDescriptionImpl({
          sdp: data.offer.sdp ?? '',
          type: data.offer.type,
        });
        await this.peerConnection.setRemoteDescription(offer);
      }
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      if (this.socket !== null) {
        this.socket.emit('webrtc-answer', {
          callId: this.currentCallId,
          answer: answer,
        });
      }
    }
  }

  private async handleAnswer(data: WebRTCSignalingData) {
    if (this.peerConnection !== null) {
      if (data.answer !== undefined) {
        const answer = new RTCSessionDescriptionImpl({
          sdp: data.answer.sdp ?? '',
          type: data.answer.type,
        });
        await this.peerConnection.setRemoteDescription(answer);
      }
    }
  }

  private async handleIceCandidate(data: WebRTCSignalingData) {
    if (this.peerConnection !== null && data.candidate !== undefined) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidateImpl(data.candidate));
    }
  }

  // Network quality monitoring
  private startNetworkQualityMonitoring(): void {
    // Clear any existing interval
    if (this.networkQualityInterval !== null) {
      clearInterval(this.networkQualityInterval);
    }

    // Start monitoring network quality
    this.networkQualityInterval = setInterval(() => {
      void this.updateNetworkQuality();
    }, this.networkCheckIntervalMs) as unknown as ReturnType<typeof setInterval>;
  }

  private stopNetworkQualityMonitoring(): void {
    if (this.networkQualityInterval !== null) {
      clearInterval(this.networkQualityInterval);
      this.networkQualityInterval = null;
    }
  }

  private async updateNetworkQuality(): Promise<void> {
    if (this.peerConnection === null) return;

    try {
      const stats = await this.peerConnection.getStats();
      const networkStats = this.calculateNetworkStats(stats);
      
      this.callState.networkStats = networkStats;
      this.callState.networkQuality = networkStats.quality;

      // Auto-downgrade based on network quality
      void this.evaluateAutoDowngrade(networkStats);

      this.emit('callStateChanged', this.callState);
      this.emit('networkQualityChanged', networkStats);
    } catch (error) {
      logger.error('Failed to update network quality', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private calculateNetworkStats(stats: RTCStatsReport): NetworkStats {
    let totalBytesReceived = 0;
    let totalBytesSent = 0;
    let totalPacketsReceived = 0;
    let totalPacketsSent = 0;
    let totalPacketsLost = 0;
    let totalRtt = 0;
    let rttCount = 0;
    let totalJitter = 0;
    let jitterCount = 0;

    stats.forEach((report) => {
      // Accumulate bytes and packets
      if ('bytesReceived' in report && typeof report.bytesReceived === 'number') {
        totalBytesReceived += report.bytesReceived;
      }
      if ('bytesSent' in report && typeof report.bytesSent === 'number') {
        totalBytesSent += report.bytesSent;
      }
      if ('packetsReceived' in report && typeof report.packetsReceived === 'number') {
        totalPacketsReceived += report.packetsReceived;
      }
      if ('packetsSent' in report && typeof report.packetsSent === 'number') {
        totalPacketsSent += report.packetsSent;
      }
      if ('packetsLost' in report && typeof report.packetsLost === 'number') {
        totalPacketsLost += report.packetsLost;
      }
      if ('roundTripTime' in report && typeof report.roundTripTime === 'number') {
        totalRtt += report.roundTripTime;
        rttCount++;
      }
      if ('jitter' in report && typeof report.jitter === 'number') {
        totalJitter += report.jitter;
        jitterCount++;
      }
    });

    // Calculate metrics
    const totalPackets = totalPacketsReceived + totalPacketsSent;
    const packetLoss = totalPackets > 0 ? (totalPacketsLost / totalPackets) * 100 : 0;
    const avgRtt = rttCount > 0 ? totalRtt / rttCount : 0;
    const avgJitter = jitterCount > 0 ? totalJitter / jitterCount : 0;

    // Estimate bitrate (simple calculation, could be improved with timestamps)
    const totalBytes = totalBytesReceived + totalBytesSent;
    const bitrate = totalBytes > 0 ? (totalBytes * 8) / 1000 : 0; // kbps

    // Determine quality
    let quality: NetworkQuality = 'good';
    if (packetLoss > 10 || avgRtt > 500 || bitrate < 500) {
      quality = 'poor';
    } else if (packetLoss > 5 || avgRtt > 300 || bitrate < 1000) {
      quality = 'ok';
    }

    return {
      bitrate,
      packetLoss,
      jitter: avgJitter,
      rtt: avgRtt,
      quality,
    };
  }

  private async evaluateAutoDowngrade(stats: NetworkStats): Promise<void> {
    const currentQuality = this.callState.videoQuality;
    const isVideoCall = this.callState.callData?.callType === 'video';

    if (!isVideoCall) {
      return; // No video to downgrade
    }

    // Auto-downgrade conditions
    const shouldDowngradeTo480p =
      currentQuality === '720p' &&
      (stats.bitrate < 1000 || stats.packetLoss > 5 || stats.quality === 'poor');

    const shouldDowngradeToAudioOnly =
      (currentQuality === '720p' || currentQuality === '480p') &&
      (stats.bitrate < 500 || stats.packetLoss > 10 || stats.quality === 'poor');

    // Auto-upgrade conditions (restore quality when network improves)
    const shouldUpgradeTo720p =
      currentQuality === '480p' &&
      stats.bitrate > 1200 &&
      stats.packetLoss < 3 &&
      stats.quality === 'good';

    const shouldUpgradeTo480p =
      currentQuality === 'audio-only' &&
      stats.bitrate > 600 &&
      stats.packetLoss < 5 &&
      stats.quality !== 'poor';

    if (shouldDowngradeToAudioOnly) {
      await this.downgradeToAudioOnly();
    } else if (shouldDowngradeTo480p) {
      await this.downgradeTo480p();
    } else if (shouldUpgradeTo720p) {
      await this.upgradeTo720p();
    } else if (shouldUpgradeTo480p) {
      await this.upgradeTo480p();
    }
  }

  private async downgradeToAudioOnly(): Promise<void> {
    if (this.callState.videoQuality === 'audio-only') return;

    logger.info('Auto-downgrading to audio-only due to poor network quality');
    this.callState.videoQuality = 'audio-only';

    // Disable video tracks
    if (this.localStream !== null) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
    }

    this.emit('callStateChanged', this.callState);
    this.emit('videoQualityChanged', 'audio-only');
  }

  private async downgradeTo480p(): Promise<void> {
    if (this.callState.videoQuality !== '720p') return;

    logger.info('Auto-downgrading to 480p due to network quality');
    this.callState.videoQuality = '480p';

    // Adjust video constraints (would need to renegotiate for full effect)
    // For now, just update state
    this.emit('callStateChanged', this.callState);
    this.emit('videoQualityChanged', '480p');
  }

  private async upgradeTo480p(): Promise<void> {
    if (this.callState.videoQuality !== 'audio-only') return;

    logger.info('Auto-upgrading to 480p due to improved network quality');
    this.callState.videoQuality = '480p';

    // Re-enable video tracks
    if (this.localStream !== null) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });
    }

    this.emit('callStateChanged', this.callState);
    this.emit('videoQualityChanged', '480p');
  }

  private async upgradeTo720p(): Promise<void> {
    if (this.callState.videoQuality !== '480p') return;

    logger.info('Auto-upgrading to 720p due to improved network quality');
    this.callState.videoQuality = '720p';

    this.emit('callStateChanged', this.callState);
    this.emit('videoQualityChanged', '720p');
  }

  // ICE timeout handling
  private setIceTimeout(): void {
    this.clearIceTimeout();
    this.iceConnectionTimeout = setTimeout(() => {
      logger.error('ICE connection timeout - no connection established within 30s');
      this.emit('callError', new Error('Call setup timeout - network may be unreachable'));
      void this.attemptReconnection();
    }, this.iceTimeoutMs) as unknown as ReturnType<typeof setTimeout>;
  }

  private clearIceTimeout(): void {
    if (this.iceConnectionTimeout !== null) {
      clearTimeout(this.iceConnectionTimeout);
      this.iceConnectionTimeout = null;
    }
  }

  // Reconnection handling
  private async handleDisconnection(): Promise<void> {
    logger.warn('Call disconnected, attempting reconnection');
    await this.attemptReconnection();
  }

  private handleConnectionFailure(): void {
    logger.error('Connection failed');
    this.clearIceTimeout();
    this.stopNetworkQualityMonitoring();
    this.emit('callError', new Error('Connection failed'));
    // Don't auto-reconnect on failure - let user decide
    this.endCall();
  }

  private async attemptReconnection(): Promise<void> {
    if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
      logger.error('Max reconnection attempts reached');
      this.emit('callError', new Error('Failed to reconnect after multiple attempts'));
      this.endCall();
      return;
    }

    this.reconnectionAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectionAttempts - 1), 30000); // Exponential backoff, max 30s

    logger.info(`Attempting reconnection ${this.reconnectionAttempts}/${this.maxReconnectionAttempts} after ${delay}ms`);

    setTimeout(() => {
      if (this.peerConnection === null || !this.callState.isActive) {
        return; // Call already ended
      }

      const iceState = this.peerConnection.iceConnectionState;
      if (iceState === 'connected' || iceState === 'completed') {
        logger.info('Connection restored');
        this.reconnectionAttempts = 0;
        return;
      }

      // Try to restart ICE
      if (this.peerConnection !== null && this.callState.callData !== undefined) {
        void this.peerConnection.restartIce();
      }
    }, delay);
  }

  private startCallTimer() {
    this.callStartTime = Date.now();
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      if (this.callState.isActive && this.callState.isConnected) {
        this.callState.callDuration = Math.floor((Date.now() - this.callStartTime) / 1000);
        this.emit('callStateChanged', this.callState);
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }

  // Getters
  getCallState(): CallState {
    return { ...this.callState };
  }

  isCallActive(): boolean {
    return this.callState.isActive;
  }

  getNetworkStats(): NetworkStats | undefined {
    return this.callState.networkStats;
  }
}

// Export singleton instance
const webRTCServiceInstance = new WebRTCService();
export default webRTCServiceInstance;
