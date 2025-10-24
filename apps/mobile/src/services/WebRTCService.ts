import { EventEmitter } from "events";

import InCallManager from "react-native-incall-manager";
import type { MediaStream } from "react-native-webrtc";
import {
  RTCPeerConnection,
  RTCIceCandidate as RTCIceCandidateImpl,
  RTCSessionDescription as RTCSessionDescriptionImpl,
  mediaDevices,
} from "react-native-webrtc";

import { logger } from "./logger";

export interface CallData {
  callId: string;
  matchId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: "voice" | "video";
  timestamp: number;
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

  // STUN/TURN configuration
  private readonly rtcConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ],
    iceCandidatePoolSize: 10,
  };

  private callState: CallState = {
    isActive: false,
    isConnected: false,
    isIncoming: false,
    isMuted: false,
    isVideoEnabled: true,
    callDuration: 0,
  };
  constructor() {
    super();
    this.setupInCallManager();
  }

  private setupInCallManager() {
    // const audioEnabled = true; // Default assumption
    try {
      if (typeof InCallManager.setKeepScreenOn === "function") {
        InCallManager.setKeepScreenOn(true);
        InCallManager.setForceSpeakerphoneOn(false);
      }
    } catch (error) {
      logger.warn("InCallManager not available", {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  // Initialize WebRTC service with socket connection
  initialize(socket: {
    emit: (event: string, data: unknown) => void;
    on: (event: string, handler: (data: unknown) => void) => void;
  }) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (this.socket === null) return;

    // Incoming call
    this.socket.on("incoming-call", (callData: unknown) => {
      this.handleIncomingCall(callData as CallData);
    });

    // Call answered
    this.socket.on("call-answered", (data: unknown) => {
      void this.handleCallAnswered(data as CallAnsweredData);
    });

    // Call rejected/ended
    this.socket.on("call-ended", () => {
      this.endCall();
    });

    // WebRTC signaling
    this.socket.on("webrtc-offer", (data: unknown) => {
      void this.handleOffer(data as WebRTCSignalingData);
    });

    this.socket.on("webrtc-answer", (data: unknown) => {
      void this.handleAnswer(data as WebRTCSignalingData);
    });

    this.socket.on("webrtc-ice-candidate", (data: unknown) => {
      void this.handleIceCandidate(data as WebRTCSignalingData);
    });
  }

  // Start a call
  async startCall(
    matchId: string,
    callType: "voice" | "video",
  ): Promise<boolean> {
    try {
      // Get user media
      const constraints = {
        audio: true,
        video:
          callType === "video"
            ? {
                width: { min: 640, ideal: 1280 },
                height: { min: 480, ideal: 720 },
                frameRate: { min: 16, ideal: 30 },
              }
            : false,
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);

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

      const callData: CallData = {
        callId,
        matchId,
        callerId: "current-user-id", // Get from auth store
        callerName: "Current User", // Get from auth store
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
        this.socket.emit("initiate-call", callData);
      }
      this.emit("callStateChanged", this.callState);

      if (typeof InCallManager.start === "function") {
        InCallManager.start({
          media: callType === "video" ? "video" : "audio",
        });
      }

      return true;
    } catch (error) {
      logger.error("Error starting call", {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      this.emit("callError", error);
      return false;
    }
  }

  // Answer incoming call
  async answerCall(): Promise<boolean> {
    try {
      if (this.callState.callData === undefined) return false;

      const constraints = {
        audio: true,
        video:
          this.callState.callData.callType === "video"
            ? {
                width: { min: 640, ideal: 1280 },
                height: { min: 480, ideal: 720 },
                frameRate: { min: 16, ideal: 30 },
              }
            : false,
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);

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
          this.socket.emit("answer-call", {
            callId: this.currentCallId,
            matchId: this.callState.callData.matchId,
          });
        }
      }

      this.emit("callStateChanged", this.callState);
      this.startCallTimer();

      if (this.callState.callData !== undefined) {
        if (typeof InCallManager.start === "function") {
          InCallManager.start({
            media:
              this.callState.callData.callType === "video" ? "video" : "audio",
          });
        }
      }

      return true;
    } catch (error) {
      logger.error("Error answering call", {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      this.emit("callError", error);
      return false;
    }
  }

  // Reject incoming call
  rejectCall() {
    if (this.callState.callData !== undefined) {
      if (this.socket !== null) {
        this.socket.emit("reject-call", {
          callId: this.callState.callData.callId,
          matchId: this.callState.callData.matchId,
        });
      }
    }
    this.endCall();
  }

  // End active call
  endCall() {
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
      logger.error("Error ending local stream", {
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
      logger.error("Error ending remote stream", {
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
    };

    // Notify socket
    if (this.currentCallId !== null) {
      if (this.socket !== null) {
        this.socket.emit("end-call", { callId: this.currentCallId });
      }
    }

    this.currentCallId = null;
    this.callStartTime = 0;

    // Stop InCallManager
    if (typeof InCallManager.stop === "function") {
      InCallManager.stop();
    }

    this.emit("callStateChanged", this.callState);
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
          this.emit("callStateChanged", this.callState);
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
          this.emit("callStateChanged", this.callState);
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
        // React Native WebRTC specific method
        if (
          "_switchCamera" in videoTrack &&
          typeof (videoTrack as any)._switchCamera === "function"
        ) {
          (videoTrack as any)._switchCamera();
        }
      }
    }
  }

  // Toggle speaker
  toggleSpeaker() {
    // State managed by InCallManager internally
    if (typeof InCallManager.setForceSpeakerphoneOn === "function") {
      InCallManager.setForceSpeakerphoneOn(true);
    }
  }

  // Private methods for WebRTC signaling
  private setupPeerConnectionListeners() {
    if (this.peerConnection === null) return;

    this.peerConnection.addEventListener(
      "icecandidate",
      (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate !== null) {
          if (this.socket !== null) {
            this.socket.emit("webrtc-ice-candidate", {
              callId: this.currentCallId,
              candidate: event.candidate,
            });
          }
        }
      },
    );

    this.peerConnection.addEventListener("track", (event: RTCTrackEvent) => {
      if (event.streams.length > 0) {
        this.remoteStream = event.streams[0] as any;
        this.callState.remoteStream = this.remoteStream;
        this.emit("callStateChanged", this.callState);
      }
    });

    this.peerConnection.addEventListener("connectionstatechange", () => {
      const state = this.peerConnection?.connectionState;
      if (state === "connected") {
        this.callState.isConnected = true;
        this.startCallTimer();
        this.emit("callStateChanged", this.callState);
      } else if (state === "disconnected" || state === "failed") {
        this.endCall();
      }
    });
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
    if (typeof InCallManager.start === "function") {
      InCallManager.start({
        media: callData.callType === "video" ? "video" : "audio",
        ringback: "_DTMF_",
      });
    }
    this.emit("callStateChanged", this.callState);
  }

  private async handleCallAnswered(data: CallAnsweredData) {
    // Create offer when call is answered
    if (this.peerConnection !== null && data.accepted) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      if (this.socket !== null) {
        this.socket.emit("webrtc-offer", {
          callId: this.currentCallId,
          offer: offer,
        });
      }
    }
  }

  private async handleOffer(data: WebRTCSignalingData) {
    if (this.peerConnection !== null) {
      if (data.offer !== undefined) {
        await this.peerConnection.setRemoteDescription(data.offer as any);
      }
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      if (this.socket !== null) {
        this.socket.emit("webrtc-answer", {
          callId: this.currentCallId,
          answer: answer,
        });
      }
    }
  }

  private async handleAnswer(data: WebRTCSignalingData) {
    if (this.peerConnection !== null) {
      if (data.answer !== undefined) {
        await this.peerConnection.setRemoteDescription(data.answer as any);
      }
    }
  }

  private async handleIceCandidate(data: WebRTCSignalingData) {
    if (this.peerConnection !== null && data.candidate !== undefined) {
      await this.peerConnection.addIceCandidate(
        new RTCIceCandidateImpl(data.candidate),
      );
    }
  }

  private startCallTimer() {
    this.callStartTime = Date.now();
    const timer = setInterval(() => {
      if (this.callState.isActive && this.callState.isConnected) {
        this.callState.callDuration = Math.floor(
          (Date.now() - this.callStartTime) / 1000,
        );
        this.emit("callStateChanged", this.callState);
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
}

export default WebRTCService;
