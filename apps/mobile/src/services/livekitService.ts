import { Room, RoomEvent, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';
import { logger } from '../utils/logger';

export interface LiveStreamConfig {
  url: string;
  token: string;
}

export interface LiveStreamState {
  isConnected: boolean;
  isPublishing: boolean;
  participants: RemoteParticipant[];
  viewerCount: number;
  error: string | null;
}

class LiveKitService {
  private room: Room | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Connect to a LiveKit room
   */
  async connect(config: LiveStreamConfig): Promise<Room> {
    try {
      if (this.room) {
        await this.room.disconnect();
      }

      const room = new Room();
      await room.connect(config.url, config.token);

      this.setupRoomListeners(room);
      this.room = room;

      logger.info('Connected to LiveKit room', { 
        sid: room.sid,
        name: room.name 
      });

      return room;
    } catch (error) {
      logger.error('Failed to connect to LiveKit room', { error });
      throw error;
    }
  }

  /**
   * Disconnect from the room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
    this.listeners.clear();
  }

  /**
   * Get current room
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Toggle camera
   */
  async toggleCamera(): Promise<void> {
    if (!this.room) return;
    
    const track = this.room.localParticipant?.videoTrackPublications?.get('camera');
    if (track?.track) {
      await track.track.setEnabled(!track.track.isEnabled);
    }
  }

  /**
   * Toggle microphone
   */
  async toggleMicrophone(): Promise<void> {
    if (!this.room) return;
    
    const track = this.room.localParticipant?.audioTrackPublications?.get('microphone');
    if (track?.track) {
      await track.track.setEnabled(!track.track.isEnabled);
    }
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<void> {
    if (!this.room) return;
    
    const track = this.room.localParticipant?.videoTrackPublications?.get('camera');
    if (track?.track) {
      await track.track.setFacingMode(
        track.track.mediaStreamTrack?.getSettings().facingMode === 'user' 
          ? 'environment' 
          : 'user'
      );
    }
  }

  /**
   * Enable/disable camera
   */
  async enableCamera(enabled: boolean): Promise<void> {
    if (!this.room) return;
    
    const track = this.room.localParticipant?.videoTrackPublications?.get('camera');
    if (track?.track) {
      await track.track.setEnabled(enabled);
    }
  }

  /**
   * Enable/disable microphone
   */
  async enableMicrophone(enabled: boolean): Promise<void> {
    if (!this.room) return;
    
    const track = this.room.localParticipant?.audioTrackPublications?.get('microphone');
    if (track?.track) {
      await track.track.setEnabled(enabled);
    }
  }

  /**
   * Setup room event listeners
   */
  private setupRoomListeners(room: Room): void {
    room.on(RoomEvent.TrackPublished, (publication, participant) => {
      logger.debug('Track published', { 
        track: publication.trackSid,
        participant: participant.identity 
      });
      
      this.emit('trackPublished', { publication, participant });
    });

    room.on(RoomEvent.TrackUnpublished, (publication, participant) => {
      logger.debug('Track unpublished', { 
        track: publication.trackSid,
        participant: participant.identity 
      });
      
      this.emit('trackUnpublished', { publication, participant });
    });

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      logger.debug('Participant connected', { identity: participant.identity });
      this.emit('participantConnected', { participant });
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      logger.debug('Participant disconnected', { identity: participant.identity });
      this.emit('participantDisconnected', { participant });
    });

    room.on(RoomEvent.Disconnected, () => {
      logger.info('Disconnected from room');
      this.emit('disconnected', {});
    });

    room.on(RoomEvent.Reconnecting, () => {
      logger.info('Reconnecting to room');
      this.emit('reconnecting', {});
    });

    room.on(RoomEvent.Reconnected, () => {
      logger.info('Reconnected to room');
      this.emit('reconnected', {});
    });

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      logger.debug('Connection state changed', { state });
      this.emit('connectionStateChanged', { state });
    });

    room.on(RoomEvent.LocalTrackPublished, (publication) => {
      logger.debug('Local track published', { track: publication.trackSid });
      this.emit('localTrackPublished', { publication });
    });

    room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
      logger.debug('Local track unpublished', { track: publication.trackSid });
      this.emit('localTrackUnpublished', { publication });
    });
  }

  /**
   * Subscribe to room events
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from room events
   */
  off(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emit room events
   */
  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}

// Export singleton
export const liveKitService = new LiveKitService();
export default liveKitService;

